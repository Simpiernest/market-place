"""Admin endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from app.core.database import get_db
from app.models.domain import User, Listing, ListingStatus, VerificationCase, UserRole, UserRoleMapping, AuditLog
from app.api import deps
from app.services.notifications import NotificationService
from app.services.audit_logger import AuditLogger

router = APIRouter()


@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Get admin dashboard statistics."""
    total_users = db.query(User).count()
    active_listings = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE).count()
    pending_review = db.query(Listing).filter(Listing.status == ListingStatus.PENDING_REVIEW).count()

    return {
        "total_users": total_users,
        "active_listings": active_listings,
        "pending_review": pending_review,
        "total_gmv": 450200000, # Mocked for now until we have more deal data
    }


@router.get("/users", response_model=List[Any])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN]))
):
    """Get all users (admin only)."""
    return db.query(User).all()


@router.get("/listings/pending", response_model=List[Any])
async def get_pending_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN]))
):
    """Get listings pending review."""
    return db.query(Listing).filter(Listing.status == ListingStatus.PENDING_REVIEW).all()


@router.post("/listings/{listing_id}/approve")
async def approve_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN]))
):
    """Approve a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.ACTIVE

    # SECURITY FIX: Audit log the admin action
    audit_logger = AuditLogger(db)
    audit_logger.log_admin_action(
        admin_user=current_user,
        action="APPROVE_LISTING",
        target_resource_type="LISTING",
        target_resource_id=listing_id,
        metadata={"listing_title": listing.title, "seller_id": str(listing.seller_id)}
    )

    # Notify Seller
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=listing.seller_id,
        type="LISTING_APPROVED",
        title="Listing Approved",
        content=f"Your listing '{listing.title}' has been approved and is now live on the marketplace.",
        link=f"/businesses/{listing.slug}"
    )

    db.commit()
    return {"message": f"Listing {listing_id} approved"}


@router.post("/listings/{listing_id}/reject")
async def reject_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN]))
):
    """Reject a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.REJECTED

    # SECURITY FIX: Audit log the admin action
    audit_logger = AuditLogger(db)
    audit_logger.log_admin_action(
        admin_user=current_user,
        action="REJECT_LISTING",
        target_resource_type="LISTING",
        target_resource_id=listing_id,
        metadata={"listing_title": listing.title, "seller_id": str(listing.seller_id)}
    )

    # Notify Seller
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=listing.seller_id,
        type="LISTING_REJECTED",
        title="Listing Rejected",
        content=f"Your listing '{listing.title}' was not approved. Please review the marketplace guidelines.",
        link="/dashboard/seller/listings"
    )

    db.commit()
    return {"message": f"Listing {listing_id} rejected"}


@router.get("/audit-logs", response_model=List[Any])
async def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.PermissionChecker([UserRole.ADMIN]))
):
    """Get audit logs."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
