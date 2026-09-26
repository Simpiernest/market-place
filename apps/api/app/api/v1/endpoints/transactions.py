from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Any, List

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, Transaction, DealRoom, DealMilestone, Listing, TransactionStatus, Review
from app.schemas.transaction import TransactionRead
from app.schemas.review import ReviewRead, ReviewCreate
from app.services.transaction_service import TransactionService
from app.services.payment import payment_orchestrator
from app.api.auth_helpers import ResourceOwnershipValidator
from app.services.audit_logger import AuditLogger

router = APIRouter()

@router.get("/{transaction_id}", response_model=TransactionRead)
async def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get transaction by ID with associated deal room info."""
    # SECURITY FIX: Use proper authorization validator
    txn = ResourceOwnershipValidator.validate_transaction_participant(
        transaction_id, current_user, db
    )

    # Hydrate UI-specific fields
    listing = db.query(Listing).filter(Listing.id == txn.listing_id).first()
    deal_room = db.query(DealRoom).filter(DealRoom.offer_id == txn.offer_id).first()
    milestones = []
    progress = 0

    if deal_room:
        milestones = db.query(DealMilestone).filter(
            DealMilestone.deal_room_id == deal_room.id
        ).order_by(DealMilestone.created_at).all()

        if milestones:
            completed_count = len([m for m in milestones if m.status.value == "COMPLETED"])
            progress = int((completed_count / len(milestones)) * 100)

    # Use dict comprehension to avoid SQLAlchemy internal state
    txn_data = {c.name: getattr(txn, c.name) for c in txn.__table__.columns}

    return {
        **txn_data,
        "listing_title": listing.title if listing else "Unknown Listing",
        "buyer_name": txn.buyer.full_name if txn.buyer else "Unknown Buyer",
        "seller_name": txn.seller.full_name if txn.seller else "Unknown Seller",
        "progress": progress,
        "milestones": milestones
    }


@router.post("/{transaction_id}/milestones/{milestone_id}/complete", response_model=TransactionRead)
async def complete_milestone(
    transaction_id: UUID,
    milestone_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Marks a milestone as complete and advances the deal."""
    # SECURITY FIX: Validate user has authority to complete this milestone
    txn, milestone = ResourceOwnershipValidator.validate_milestone_authority(
        transaction_id, milestone_id, current_user, db
    )

    # Audit log the milestone completion
    audit_logger = AuditLogger(db)
    audit_logger.log_transaction_milestone(
        current_user, transaction_id, milestone_id, milestone.title
    )

    txn_service = TransactionService(db)
    try:
        await txn_service.complete_milestone(transaction_id, milestone_id)
        # Return refreshed transaction
        return await get_transaction(transaction_id, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{transaction_id}/checkout")
async def initiate_checkout(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Initiates the payment process for a transaction."""
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can initiate checkout")

    # In production, we'd check if the deal is in the correct state (AGREEMENT_SIGNED)
    # For V4/Demo, we allow it if status is OFFER_ACCEPTED or beyond
    checkout_data = await payment_orchestrator.initiate_payment(
        transaction_id=str(txn.id),
        amount=txn.amount,
        currency=txn.currency.value
    )

    return checkout_data

@router.post("/{transaction_id}/reviews", response_model=ReviewRead)
async def create_transaction_review(
    transaction_id: UUID,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Submit a review for a completed transaction."""
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn.status != TransactionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Reviews can only be submitted for completed transactions")

    # Access control
    if current_user.id not in [txn.buyer_id, txn.seller_id]:
        raise HTTPException(status_code=403, detail="Not authorized to review this transaction")

    # Determine reviewee
    reviewee_id = txn.seller_id if current_user.id == txn.buyer_id else txn.buyer_id

    # Check if review already exists
    existing = db.query(Review).filter(
        Review.transaction_id == transaction_id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this transaction")

    review = Review(
        **review_in.model_dump(),
        transaction_id=transaction_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
