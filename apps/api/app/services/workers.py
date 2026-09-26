"""Background worker infrastructure using Redis queues (RQ or Celery-like)."""

from typing import Any, Dict, Callable
from datetime import datetime, timedelta
from uuid import uuid4
import json

try:
    from redis import Redis
    from rq import Queue
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from app.core.config import settings


class TaskQueue:
    """Simple task queue abstraction for background jobs."""

    def __init__(self):
        if REDIS_AVAILABLE and settings.REDIS_URL:
            self.redis = Redis.from_url(settings.REDIS_URL)
            self.queue = Queue(connection=self.redis)
            self.enabled = True
        else:
            self.enabled = False
            print("Warning: Redis not available. Background tasks will run synchronously.")

    def enqueue(
        self,
        func: Callable,
        *args,
        job_id: str = None,
        timeout: int = 600,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Enqueue a background task.

        Args:
            func: Function to execute
            args: Positional arguments
            job_id: Optional job ID
            timeout: Job timeout in seconds
            kwargs: Keyword arguments

        Returns:
            Job info dict
        """
        if not self.enabled:
            # Fallback: execute synchronously
            result = func(*args, **kwargs)
            return {
                "job_id": job_id or str(uuid4()),
                "status": "completed",
                "result": result,
                "enqueued_at": datetime.utcnow().isoformat(),
            }

        job = self.queue.enqueue(
            func,
            *args,
            job_id=job_id,
            job_timeout=timeout,
            **kwargs
        )

        return {
            "job_id": job.id,
            "status": job.get_status(),
            "enqueued_at": job.enqueued_at.isoformat() if job.enqueued_at else None,
        }

    def enqueue_at(
        self,
        scheduled_time: datetime,
        func: Callable,
        *args,
        **kwargs
    ) -> Dict[str, Any]:
        """Enqueue a task to run at a specific time."""
        if not self.enabled:
            # Can't schedule without Redis
            return {"error": "Scheduling requires Redis"}

        job = self.queue.enqueue_at(scheduled_time, func, *args, **kwargs)

        return {
            "job_id": job.id,
            "status": "scheduled",
            "scheduled_for": scheduled_time.isoformat(),
        }

    def enqueue_in(
        self,
        delay: timedelta,
        func: Callable,
        *args,
        **kwargs
    ) -> Dict[str, Any]:
        """Enqueue a task to run after a delay."""
        scheduled_time = datetime.utcnow() + delay
        return self.enqueue_at(scheduled_time, func, *args, **kwargs)

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a background job."""
        if not self.enabled:
            return {"error": "Redis not available"}

        from rq.job import Job

        try:
            job = Job.fetch(job_id, connection=self.redis)
            return {
                "job_id": job.id,
                "status": job.get_status(),
                "result": job.result if job.is_finished else None,
                "error": str(job.exc_info) if job.is_failed else None,
                "enqueued_at": job.enqueued_at.isoformat() if job.enqueued_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "ended_at": job.ended_at.isoformat() if job.ended_at else None,
            }
        except Exception as e:
            return {"error": str(e)}


# Global instance
task_queue = TaskQueue()


# Common background tasks
async def send_email_task(to: str, subject: str, template_name: str, template_data: Dict[str, Any]):
    """Background task to send an email."""
    from app.services.email import email_service

    result = await email_service.send_template_email(
        to=to,
        subject=subject,
        template_name=template_name,
        template_data=template_data,
    )
    return result


async def process_saved_search_alerts_task():
    """Background task to process saved search alerts."""
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    from app.models.domain import SavedSearch, Listing
    from app.services.email import email_service

    db: Session = SessionLocal()

    try:
        # Get saved searches that need to run
        searches = db.query(SavedSearch).filter(
            SavedSearch.alert_frequency != "off"
        ).all()

        for search in searches:
            # Check if enough time has passed since last run
            if search.last_run_at:
                time_since_run = datetime.utcnow() - search.last_run_at
                if search.alert_frequency == "daily" and time_since_run < timedelta(days=1):
                    continue
                elif search.alert_frequency == "weekly" and time_since_run < timedelta(weeks=1):
                    continue

            # Find new listings matching filters
            filters = search.filters
            query = db.query(Listing).filter(Listing.status == "ACTIVE")

            if filters.get("min_price"):
                query = query.filter(Listing.asking_price >= filters["min_price"])
            if filters.get("max_price"):
                query = query.filter(Listing.asking_price <= filters["max_price"])
            if filters.get("category_id"):
                query = query.filter(Listing.category_id == filters["category_id"])

            # Only get listings created since last run
            if search.last_run_at:
                query = query.filter(Listing.created_at > search.last_run_at)

            new_listings = query.limit(10).all()

            if new_listings:
                # Send alert email
                await email_service.send_template_email(
                    to=search.user.email,
                    subject=f"New listings match your search: {search.name}",
                    template_name="saved_search_alert",
                    template_data={
                        "user_name": search.user.full_name,
                        "search_name": search.name,
                        "count": len(new_listings),
                        "listings": [
                            {
                                "title": listing.title,
                                "price": f"{listing.asking_price} {listing.currency.value}",
                            }
                            for listing in new_listings
                        ],
                        "marketplace_url": f"{settings.FRONTEND_URL}/marketplace",
                    },
                )

            # Update last run timestamp
            search.last_run_at = datetime.utcnow()
            db.commit()

    finally:
        db.close()


async def cleanup_expired_offers_task():
    """Background task to mark expired offers."""
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    from app.models.domain import Offer, OfferStatus

    db: Session = SessionLocal()

    try:
        expired_offers = db.query(Offer).filter(
            Offer.status == OfferStatus.DRAFT,
            Offer.expires_at < datetime.utcnow()
        ).all()

        for offer in expired_offers:
            offer.status = OfferStatus.EXPIRED

        db.commit()

        return {"expired_count": len(expired_offers)}
    finally:
        db.close()


async def generate_analytics_snapshot_task():
    """Background task to generate daily analytics snapshot."""
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    from app.models.domain import Listing, Transaction, User

    db: Session = SessionLocal()

    try:
        snapshot = {
            "date": datetime.utcnow().date().isoformat(),
            "active_listings": db.query(Listing).filter(Listing.status == "ACTIVE").count(),
            "total_transactions": db.query(Transaction).count(),
            "completed_transactions": db.query(Transaction).filter(
                Transaction.status == "COMPLETED"
            ).count(),
            "total_users": db.query(User).count(),
        }

        # Store snapshot (could save to DB, S3, or analytics service)
        print(f"Analytics snapshot: {json.dumps(snapshot)}")

        return snapshot
    finally:
        db.close()
