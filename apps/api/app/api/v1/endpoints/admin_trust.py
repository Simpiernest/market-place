"""Admin Trust Center endpoints for vetting and moderation."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Any, List, Optional
from uuid import UUID

from app.core.database import get_db
from app.api import deps
from app.models.domain import (
    User, UserRole, Listing, ListingVettingStatus,
    UserVerification, VerificationStatus, DataAccessRequest,
    Offer, DealRoom, AuditLog
)
from app.api.auth_helpers import require_roles

router = APIRouter()

@router.get("/summary")
async def get_trust_center_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Get high-level summary of pending items for the trust center."""
    return {
        "pending_listings": db.query(Listing).filter(
            Listing.status.in_([ListingVettingStatus.SUBMITTED, ListingVettingStatus.AUTOMATED_REVIEW])
        ).count(),
        "pending_verifications": db.query(UserVerification).filter(
            UserVerification.status == VerificationStatus.UNDER_REVIEW
        ).count(),
        "open_disputes": db.query(DealRoom).filter(DealRoom.status == "DISPUTED").count(),
        "suspicious_activity": db.query(AuditLog).filter(AuditLog.success == False).count(),
        "risk_signals": {
            "unlock_spikes": 0,
            "ip_anomalies": 0,
            "failed_verifications": db.query(UserVerification).filter(UserVerification.status == VerificationStatus.REJECTED).count()
        }
    }

@router.get("/listings", response_model=List[dict])
async def get_pending_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Listings awaiting human review."""
    listings = db.query(Listing).filter(
        Listing.status.in_([ListingVettingStatus.SUBMITTED, ListingVettingStatus.AUTOMATED_REVIEW, ListingVettingStatus.HUMAN_REVIEW])
    ).all()

    return [
        {
            "id": l.id,
            "title": l.title,
            "seller_name": l.seller_profile.user.full_name,
            "status": l.status,
            "submitted_at": l.created_at
        } for l in listings
    ]

@router.get("/verifications", response_model=List[dict])
async def get_pending_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """User verifications awaiting human review (e.g. POF documents)."""
    verifications = db.query(UserVerification).filter(
        UserVerification.status == VerificationStatus.UNDER_REVIEW
    ).all()

    return [
        {
            "id": v.id,
            "user_name": v.user.full_name,
            "category": v.category,
            "evidence_count": len(v.evidence) if v.evidence else 0,
            "submitted_at": v.created_at
        } for v in verifications
    ]

@router.post("/listings/{listing_id}/vetting")
async def update_listing_vetting(
    listing_id: UUID,
    status: ListingVettingStatus,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Approve or reject a listing with notes."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    old_status = listing.status
    listing.status = status

    db.commit()

    # Audit log the decision
    from app.services.audit_logger import AuditLogger
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="ADMIN",
        action="VET_LISTING",
        resource_type="LISTING",
        resource_id=listing_id,
        changes={"old_status": old_status, "new_status": status, "notes": admin_notes}
    )

    # Notify Seller
    from app.services.notifications import NotificationService
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=listing.seller_id,
        type="LISTING_VETTED",
        title=f"Listing {status.value.replace('_', ' ')}",
        content=f"Your listing '{listing.title}' has been {status.value.lower()}. {admin_notes if admin_notes else ''}",
        link=f"/dashboard/seller/listings/{listing.id}"
    )

    return {"message": "Listing status updated"}

@router.post("/verifications/{verification_id}/review")
async def review_user_verification(
    verification_id: UUID,
    status: VerificationStatus,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Approve or reject a user verification request (e.g. POF)."""
    v = db.query(UserVerification).filter(UserVerification.id == verification_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Verification not found")

    v.status = status
    from datetime import datetime
    if status == VerificationStatus.VERIFIED:
        v.verified_at = datetime.utcnow()

    db.commit()

    # Refresh reputation/standing
    from app.services.reputation import ReputationService
    reputation_service = ReputationService(db)
    reputation_service.calculate_buyer_standing(v.user_id)

    # Notify User
    from app.services.notifications import NotificationService
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=v.user_id,
        type="VERIFICATION_UPDATE",
        title=f"{v.category.value.replace('_', ' ')} {status.value}",
        content=f"Your {v.category.value.lower()} verification has been {status.value.lower()}.",
        link="/dashboard/settings"
    )

    return {"message": "Verification reviewed"}

@router.get("/audit-logs")
async def get_system_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Global system audit log view."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
