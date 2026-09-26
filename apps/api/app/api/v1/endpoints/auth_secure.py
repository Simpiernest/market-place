"""
Security fixes for Business Bridge critical vulnerabilities.
Apply these fixes BEFORE production deployment.
"""

from typing import Any, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core import security
from app.models.domain import (
    User, UserRole, UserRoleMapping,
    Offer, OfferStatus, Listing, ListingStatus,
    Transaction, TransactionStatus, DealRoom, DealMilestone, DealMilestoneStatus
)
from app.schemas.user import UserRead, UserUpdate
from app.api import deps
from app.services.email import email_service
from app.services.audit import audit_logger
from redis_client import get_redis

router = APIRouter()


# =====================================================
# FIX #1: Email Verification Security
# =====================================================

@router.post("/verify-email")
async def verify_email_secure(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),  # ✅ Require authentication
) -> Any:
    """
    SECURE: Verify email with proper token validation.
    Fixed: CVE-2026-001 - Email verification bypass
    """
    # ✅ Validate token is for THIS user's email
    token_data = security.verify_email_verification_token(token)
    if not token_data or token_data.get("email") != current_user.email:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )

    # ✅ Check token hasn't been used
    redis = get_redis()
    token_key = f"email_verify_used:{token}"
    if redis.get(token_key):
        raise HTTPException(status_code=400, detail="Token already used")

    # ✅ Mark as verified
    current_user.email_verified = True
    current_user.email_verified_at = datetime.utcnow()
    db.add(current_user)
    db.commit()

    # ✅ Mark token as used
    redis.setex(token_key, 86400, "1")  # 24 hour expiry

    # ✅ Audit log
    audit_logger.log_event(
        event_type="EMAIL_VERIFIED",
        user_id=current_user.id,
        metadata={"email": current_user.email}
    )

    return {"message": "Email verified successfully"}


# =====================================================
# FIX #2: Financial Authorization - Fund Release
# =====================================================

@router.post("/transactions/{transaction_id}/release")
def release_transaction_funds_secure(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    SECURE: Release funds with proper authorization and business rules.
    Fixed: CVE-2026-002 - Unauthorized fund release
    """
    # ✅ Lock transaction to prevent race conditions
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).with_for_update().first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # ✅ Check user authorization
    user_roles = [r.role for r in current_user.roles]
    is_admin = UserRole.ADMIN in user_roles or UserRole.SUPER_ADMIN in user_roles
    is_buyer = transaction.buyer_id == current_user.id

    if not (is_buyer or is_admin):
        audit_logger.log_security_event(
            event_type="UNAUTHORIZED_FUND_RELEASE_ATTEMPT",
            user_id=current_user.id,
            severity="HIGH",
            metadata={"transaction_id": str(transaction_id)}
        )
        raise HTTPException(status_code=403, detail="Not authorized to release funds")

    # ✅ Validate transaction state
    if transaction.status != TransactionStatus.PAYMENT_CONFIRMED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot release funds: transaction status is {transaction.status.value}"
        )

    # ✅ Check all milestones completed
    deal_room = db.query(DealRoom).filter(
        DealRoom.transaction_id == transaction.id
    ).first()

    if deal_room:
        pending_milestones = db.query(DealMilestone).filter(
            DealMilestone.deal_room_id == deal_room.id,
            DealMilestone.status != DealMilestoneStatus.COMPLETED
        ).count()

        if pending_milestones > 0 and not is_admin:
            raise HTTPException(
                status_code=400,
                detail=f"{pending_milestones} milestone(s) must be completed before releasing funds"
            )

    # ✅ Check inspection period expired (7 days default)
    if transaction.created_at:
        days_elapsed = (datetime.utcnow() - transaction.created_at).days
        if days_elapsed < 7 and not is_admin:
            raise HTTPException(
                status_code=400,
                detail=f"Inspection period not expired ({7 - days_elapsed} days remaining)"
            )

    # ✅ Check no active disputes
    active_dispute = db.query(Dispute).filter(
        Dispute.transaction_id == transaction.id,
        Dispute.status.in_(["OPEN", "UNDER_REVIEW"])
    ).first()

    if active_dispute:
        raise HTTPException(
            status_code=400,
            detail="Cannot release funds: active dispute exists"
        )

    # ✅ Audit log with admin override tracking
    audit_logger.log_financial_event(
        event_type="FUNDS_RELEASED",
        user_id=current_user.id,
        transaction_id=transaction.id,
        amount=transaction.amount,
        metadata={
            "admin_override": is_admin and not is_buyer,
            "pending_milestones_count": pending_milestones if deal_room else 0,
            "days_in_escrow": days_elapsed if transaction.created_at else None
        }
    )

    # ✅ Release funds through secure service
    from app.services.transaction_service import TransactionService
    txn_service = TransactionService(db)
    updated_txn = txn_service.release_funds(transaction_id)

    return {
        "message": "Funds released successfully",
        "transaction": updated_txn,
        "released_amount": transaction.seller_proceeds
    }


# =====================================================
# FIX #3: Refund Authorization
# =====================================================

@router.post("/transactions/{transaction_id}/refund")
def refund_transaction_secure(
    transaction_id: UUID,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    SECURE: Refund with proper authorization.
    Fixed: CVE-2026-003 - Unauthorized refunds
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).with_for_update().first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # ✅ Check authorization
    user_roles = [r.role for r in current_user.roles]
    is_admin = UserRole.ADMIN in user_roles or UserRole.SUPER_ADMIN in user_roles

    if not is_admin:
        # ✅ Check mutual refund agreement exists
        refund_agreement = db.query(RefundAgreement).filter(
            RefundAgreement.transaction_id == transaction_id,
            RefundAgreement.buyer_agreed == True,
            RefundAgreement.seller_agreed == True,
            RefundAgreement.expires_at > datetime.utcnow()
        ).first()

        if not refund_agreement:
            raise HTTPException(
                status_code=403,
                detail="Refund requires both parties' agreement or admin approval"
            )

    # ✅ Validate refund is possible
    if transaction.status not in [
        TransactionStatus.PAYMENT_CONFIRMED,
        TransactionStatus.DISPUTED
    ]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot refund transaction in {transaction.status.value} status"
        )

    # ✅ Audit log
    audit_logger.log_financial_event(
        event_type="REFUND_INITIATED",
        user_id=current_user.id,
        transaction_id=transaction.id,
        amount=transaction.amount,
        metadata={
            "reason": reason,
            "admin_initiated": is_admin,
            "original_status": transaction.status.value
        }
    )

    # ✅ Process refund
    from app.services.transaction_service import TransactionService
    txn_service = TransactionService(db)
    updated_txn = txn_service.refund_payment(transaction_id, reason)

    return {
        "message": "Refund processed successfully",
        "transaction": updated_txn,
        "refund_amount": transaction.amount
    }


# =====================================================
# FIX #4: Secure User Update (No Mass Assignment)
# =====================================================

ALLOWED_PROFILE_FIELDS = {'full_name', 'phone', 'bio', 'avatar_url', 'timezone'}

@router.patch("/me", response_model=UserRead)
async def update_me_secure(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    SECURE: Update only whitelisted profile fields.
    Fixed: CVE-2026-006 - Mass assignment vulnerability
    """
    update_data = user_in.model_dump(exclude_unset=True)

    # ✅ Only update whitelisted fields
    for field, value in update_data.items():
        if field in ALLOWED_PROFILE_FIELDS:
            setattr(current_user, field, value)
        else:
            # ✅ Log attempt to modify restricted field
            audit_logger.log_security_event(
                event_type="RESTRICTED_FIELD_UPDATE_ATTEMPT",
                user_id=current_user.id,
                severity="MEDIUM",
                metadata={"field": field, "value": str(value)[:100]}
            )

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-email")
async def change_email_secure(
    new_email: str,
    current_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    SECURE: Email change requires password and re-verification.
    Fixed: CVE-2026-006 - Email change without verification
    """
    # ✅ Verify current password
    if not security.verify_password(current_password, current_user.password_hash):
        audit_logger.log_security_event(
            event_type="EMAIL_CHANGE_INVALID_PASSWORD",
            user_id=current_user.id,
            severity="MEDIUM"
        )
        raise HTTPException(status_code=401, detail="Invalid password")

    # ✅ Check email not already taken
    existing = db.query(User).filter(User.email == new_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    # ✅ Create pending email change
    token = security.create_email_change_token(current_user.id, new_email)

    # ✅ Store pending change
    redis = get_redis()
    redis.setex(
        f"email_change:{current_user.id}",
        3600,  # 1 hour
        new_email
    )

    # ✅ Send verification to NEW email
    await email_service.send_email_change_verification(
        current_user.email,
        new_email,
        current_user.full_name,
        token
    )

    audit_logger.log_event(
        event_type="EMAIL_CHANGE_INITIATED",
        user_id=current_user.id,
        metadata={"old_email": current_user.email, "new_email": new_email}
    )

    return {"message": "Verification email sent to new address"}


@router.post("/change-password")
async def change_password_secure(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    SECURE: Password change requires current password.
    Fixed: CVE-2026-006 - Password change without verification
    """
    # ✅ Verify current password
    if not security.verify_password(current_password, current_user.password_hash):
        audit_logger.log_security_event(
            event_type="PASSWORD_CHANGE_INVALID_CURRENT",
            user_id=current_user.id,
            severity="HIGH"
        )
        raise HTTPException(status_code=401, detail="Invalid current password")

    # ✅ Validate new password strength
    if len(new_password) < 12:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 12 characters"
        )

    # ✅ Check not reusing old password
    if security.verify_password(new_password, current_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    # ✅ Update password
    current_user.password_hash = security.get_password_hash(new_password)
    current_user.password_changed_at = datetime.utcnow()
    db.add(current_user)
    db.commit()

    # ✅ Invalidate all existing sessions
    redis = get_redis()
    redis.delete(f"user_sessions:{current_user.id}")

    # ✅ Send notification email
    await email_service.send_password_changed_notification(
        current_user.email,
        current_user.full_name
    )

    audit_logger.log_security_event(
        event_type="PASSWORD_CHANGED",
        user_id=current_user.id,
        severity="INFO"
    )

    return {"message": "Password changed successfully. Please log in again."}


# =====================================================
# FIX #5: Secure Offer Acceptance (No Double-Sale)
# =====================================================

@router.post("/{offer_id}/accept")
def accept_offer_secure(
    offer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    SECURE: Offer acceptance with race condition protection.
    Fixed: CVE-2026-005 - Double-sale vulnerability
    """
    # ✅ Use SELECT FOR UPDATE to prevent race conditions
    offer = db.query(Offer).filter(
        Offer.id == offer_id
    ).with_for_update().first()

    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    # ✅ Verify authorization
    if offer.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can accept this offer"
        )

    # ✅ Check offer status
    if offer.status != OfferStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail=f"Offer is {offer.status.value}, cannot accept"
        )

    # ✅ Check expiration
    if offer.expires_at and offer.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Offer has expired")

    # ✅ Lock listing and verify availability
    listing = db.query(Listing).filter(
        Listing.id == offer.listing_id
    ).with_for_update().first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.status != ListingStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail=f"Listing is {listing.status.value}, not available"
        )

    # ✅ Check no other accepted offers exist
    existing_accepted = db.query(Offer).filter(
        Offer.listing_id == offer.listing_id,
        Offer.status == OfferStatus.ACCEPTED,
        Offer.id != offer.id
    ).first()

    if existing_accepted:
        raise HTTPException(
            status_code=400,
            detail="Another offer has already been accepted for this listing"
        )

    # ✅ Update offer status
    offer.status = OfferStatus.ACCEPTED
    offer.responded_at = datetime.utcnow()

    # ✅ Update listing status atomically
    listing.status = ListingStatus.UNDER_CONTRACT
    listing.contracted_at = datetime.utcnow()

    # ✅ Get commission rate from config or broker
    commission_rate = settings.DEFAULT_COMMISSION_RATE
    if listing.broker_id:
        broker = db.query(Broker).filter(Broker.id == listing.broker_id).first()
        if broker:
            commission_rate = broker.commission_rate

    commission_amount = offer.amount * commission_rate
    seller_proceeds = offer.amount - commission_amount

    # ✅ Create transaction
    transaction = Transaction(
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        seller_id=offer.seller_id,
        offer_id=offer.id,
        amount=offer.amount,
        currency=offer.currency,
        commission_rate=commission_rate,
        commission_amount=commission_amount,
        seller_proceeds=seller_proceeds,
        status=TransactionStatus.DRAFT
    )
    db.add(transaction)
    db.flush()

    # ✅ Create deal room
    deal_room = DealRoom(
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        seller_id=offer.seller_id,
        offer_id=offer.id,
        transaction_id=transaction.id,
        status="active"
    )
    db.add(deal_room)

    # ✅ Commit transaction
    db.commit()
    db.refresh(offer)
    db.refresh(transaction)
    db.refresh(deal_room)

    # ✅ Audit log
    audit_logger.log_business_event(
        event_type="OFFER_ACCEPTED",
        user_id=current_user.id,
        metadata={
            "offer_id": str(offer.id),
            "listing_id": str(listing.id),
            "amount": float(offer.amount),
            "transaction_id": str(transaction.id)
        }
    )

    # ✅ Notify buyer
    from app.services.notifications import NotificationService
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=offer.buyer_id,
        type="OFFER_ACCEPTED",
        title="Offer Accepted!",
        content=f"Your offer of {offer.amount} {offer.currency.value} has been accepted.",
        link=f"/dashboard/deal-rooms/{deal_room.id}"
    )

    return {
        "offer": offer,
        "transaction": transaction,
        "deal_room": deal_room,
        "message": "Offer accepted successfully. Deal room created."
    }
