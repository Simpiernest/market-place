"""
Webhook security and idempotency management.
Prevents replay attacks and ensures idempotent webhook processing.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, DateTime, Boolean, Text
from uuid import uuid4

from app.core.database import Base


class WebhookEvent(Base):
    """Track processed webhook events to prevent replay attacks."""
    __tablename__ = "webhook_events"

    id = Column(String(255), primary_key=True)
    provider = Column(String(50), nullable=False)  # stripe, paystack, etc.
    event_id = Column(String(255), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_processed = Column(Boolean, default=True, nullable=False)
    transaction_id = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class WebhookSecurityManager:
    """Manages webhook security including replay protection and idempotency."""

    def __init__(self, db: Session):
        self.db = db

    def is_event_processed(self, provider: str, event_id: str) -> bool:
        """Check if webhook event has already been processed."""
        event = self.db.query(WebhookEvent).filter(
            WebhookEvent.provider == provider,
            WebhookEvent.event_id == event_id
        ).first()

        return event is not None

    def mark_event_processed(
        self,
        provider: str,
        event_id: str,
        event_type: str,
        transaction_id: Optional[str] = None,
        payload: Optional[str] = None
    ) -> WebhookEvent:
        """Mark webhook event as processed to prevent replay."""
        # Check if already exists
        existing = self.db.query(WebhookEvent).filter(
            WebhookEvent.provider == provider,
            WebhookEvent.event_id == event_id
        ).first()

        if existing:
            return existing

        # Create new webhook event record
        webhook_event = WebhookEvent(
            id=str(uuid4()),
            provider=provider,
            event_id=event_id,
            event_type=event_type,
            transaction_id=transaction_id,
            payload=payload,
            processed_at=datetime.utcnow(),
            is_processed=True
        )

        self.db.add(webhook_event)
        self.db.commit()
        self.db.refresh(webhook_event)

        return webhook_event

    def is_timestamp_valid(self, timestamp: int, max_age_seconds: int = 300) -> bool:
        """
        Validate webhook timestamp to prevent replay attacks.
        Rejects webhooks older than max_age_seconds (default 5 minutes).
        """
        webhook_time = datetime.fromtimestamp(timestamp)
        age = datetime.utcnow() - webhook_time

        return age.total_seconds() <= max_age_seconds

    def cleanup_old_events(self, days_to_keep: int = 30) -> int:
        """Clean up webhook events older than specified days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

        deleted = self.db.query(WebhookEvent).filter(
            WebhookEvent.created_at < cutoff_date
        ).delete()

        self.db.commit()
        return deleted


class IdempotencyManager:
    """Manages idempotency keys for financial operations."""

    @staticmethod
    def generate_idempotency_key(
        operation: str,
        user_id: str,
        resource_id: str
    ) -> str:
        """Generate deterministic idempotency key."""
        return f"{operation}:{user_id}:{resource_id}"

    def is_operation_completed(
        self,
        idempotency_key: str,
        db: Session
    ) -> bool:
        """Check if operation with this key has been completed."""
        # In production, you'd check against an idempotency_operations table
        # For now, this is a placeholder for the pattern
        pass

    def mark_operation_completed(
        self,
        idempotency_key: str,
        result: Any,
        db: Session
    ) -> None:
        """Mark operation as completed with result."""
        # Store in idempotency_operations table
        pass
