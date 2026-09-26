from typing import Any, List
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Offer, Listing, Transaction, DealRoom, OfferStatus, TransactionStatus, UserVerification, ListingStatus, SaleType
from app.schemas.offer import OfferRead, OfferCreate, OfferResponse
from app.api import deps
from app.models.domain import User
from app.services.notifications import NotificationService

router = APIRouter()


@router.post("/", response_model=OfferRead, status_code=201)
def create_offer(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Submit an offer on a listing."""
    listing = db.query(Listing).filter(Listing.id == offer_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot make an offer on your own listing")

    # VERIFICATION CHECKS
    from app.models.domain import VerificationCategory, VerificationStatus, BuyerTier, DataAccessRequestStatus, DataAccessRequest

    # 1. Identity Verified
    id_v = db.query(UserVerification).filter(
        UserVerification.user_id == current_user.id,
        UserVerification.category == VerificationCategory.IDENTITY,
        UserVerification.status == VerificationStatus.VERIFIED
    ).first()
    if not id_v:
        raise HTTPException(status_code=403, detail="Identity verification required before submitting an offer.")

    # 2. NDA Signed & Approved (Confidential Access)
    access = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing.id,
        DataAccessRequest.buyer_id == current_user.id,
        DataAccessRequest.status == DataAccessRequestStatus.APPROVED
    ).first()
    if not access:
        raise HTTPException(status_code=403, detail="Approved confidential access required before submitting an offer.")

    # 3. Proof of Funds Verified (For high-value deals or if required by listing)
    if listing.require_proof_of_funds or listing.asking_price > 50000:
        pof = db.query(UserVerification).filter(
            UserVerification.user_id == current_user.id,
            UserVerification.category == VerificationCategory.PROOF_OF_FUNDS,
            UserVerification.status == VerificationStatus.VERIFIED
        ).first()
        if not pof:
            raise HTTPException(status_code=403, detail="Verified Proof of Funds required for this acquisition tier.")

    # 4. Buyer Standing
    if current_user.buyer_profile and current_user.buyer_profile.standing_score < 30:
        raise HTTPException(status_code=403, detail="Buyer reputation too low to submit offers. Please contact support.")

    # Create offer
    offer = Offer(
        **offer_in.model_dump(),
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        status=OfferStatus.DRAFT,
        expires_at=datetime.utcnow() + timedelta(days=7)  # 7-day expiration
    )

    # SECURITY FIX: Handle AUTO-ACCEPT FOR BUY NOW with Race Condition protection
    if listing.sale_type == SaleType.BUY_NOW:
        if offer.amount >= listing.asking_price:
            # 1. Lock listing record again to ensure it's still ACTIVE
            listing = db.query(Listing).filter(
                Listing.id == listing.id
            ).with_for_update().first()

            if listing.status != ListingVettingStatus.PUBLISHED:
                raise HTTPException(status_code=400, detail="Listing is no longer available for Buy Now")

            offer.status = OfferStatus.ACCEPTED
            offer.responded_at = datetime.utcnow()

            # Atomic state change
            listing.status = ListingVettingStatus.SOLD

            # In V2, trigger escrow funding requirement immediately
            # Create transaction record immediately for BUY NOW
            from app.core.config import settings
            commission_rate = settings.DEFAULT_COMMISSION_RATE
            commission_amount = offer.amount * commission_rate
            seller_proceeds = offer.amount - commission_amount

            transaction = Transaction(
                listing_id=listing.id,
                buyer_id=current_user.id,
                seller_id=listing.seller_id,
                offer_id=None, # Will be set after flush
                amount=offer.amount,
                currency=offer.currency,
                commission_rate=commission_rate,
                commission_amount=commission_amount,
                seller_proceeds=seller_proceeds,
                status=TransactionStatus.OFFER_ACCEPTED
            )
            db.add(transaction)
            db.flush()

            # Create deal room
            deal_room = DealRoom(
                listing_id=listing.id,
                buyer_id=current_user.id,
                seller_id=listing.seller_id,
                offer_id=offer.id,
                transaction_id=transaction.id,
                status="active"
            )
            db.add(deal_room)

            # Link transaction to offer
            transaction.offer_id = offer.id

    db.add(offer)
    db.commit()
    db.refresh(offer)

    # Notify seller
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=listing.seller_id,
        type="NEW_OFFER",
        title="New Offer Received",
        content=f"You received an offer of {offer.amount} {offer.currency.value} on {listing.title}.",
        link=f"/dashboard/offers?id={offer.id}",
        metadata={"offer_id": str(offer.id), "listing_id": str(listing.id)}
    )

    return offer


@router.get("/listing/{listing_id}", response_model=List[OfferRead])
def get_listing_offers(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all offers for a listing (seller only)."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these offers")

    return db.query(Offer).filter(Offer.listing_id == listing_id).order_by(Offer.created_at.desc()).all()


@router.get("/my-offers", response_model=List[OfferRead])
def get_my_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all offers made by the current user (buyer perspective)."""
    return db.query(Offer).filter(Offer.buyer_id == current_user.id).order_by(Offer.created_at.desc()).all()


@router.get("/inbound", response_model=List[OfferRead])
def get_inbound_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all offers received by the current user (seller perspective)."""
    offers = db.query(Offer).filter(Offer.seller_id == current_user.id).order_by(Offer.created_at.desc()).all()

    result = []
    for o in offers:
        read = OfferRead.model_validate(o)
        read.buyer_name = o.buyer.full_name
        if o.buyer.buyer_profile:
            read.buyer_tier = o.buyer.buyer_profile.tier.value
            read.buyer_standing = o.buyer.buyer_profile.standing_score
        result.append(read)

    return result


@router.post("/{offer_id}/accept", response_model=OfferResponse)
def accept_offer(
    offer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    SECURE: Accept an offer with race condition protection.
    Fixed: Double-sale vulnerability.
    """
    from app.services.audit import audit_logger

    # Use SELECT FOR UPDATE to prevent race conditions
    offer = db.query(Offer).filter(
        Offer.id == offer_id
    ).with_for_update().first()

    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can accept this offer")

    if offer.status != OfferStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Offer is {offer.status.value}, cannot accept")

    if offer.expires_at and offer.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Offer has expired")

    # Lock listing and verify availability
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

    # Check no other accepted offers exist
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

    # Update offer status
    offer.status = OfferStatus.ACCEPTED
    offer.responded_at = datetime.utcnow()

    # Update listing status atomically
    listing.status = ListingStatus.UNDER_CONTRACT

    # Get commission rate from config or broker
    from app.core.config import settings
    commission_rate = settings.DEFAULT_COMMISSION_RATE

    commission_amount = offer.amount * commission_rate
    seller_proceeds = offer.amount - commission_amount

    # Create transaction
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

    # Create deal room
    deal_room = DealRoom(
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        seller_id=offer.seller_id,
        offer_id=offer.id,
        status="active"
    )
    db.add(deal_room)

    db.commit()
    db.refresh(offer)
    db.refresh(transaction)
    db.refresh(deal_room)

    # Audit log
    audit_logger.log_event(
        event_type="OFFER_ACCEPTED",
        user_id=current_user.id,
        metadata={
            "offer_id": str(offer.id),
            "listing_id": str(listing.id),
            "amount": float(offer.amount),
            "transaction_id": str(transaction.id)
        }
    )

    # Notify buyer
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=offer.buyer_id,
        type="OFFER_ACCEPTED",
        title="Offer Accepted",
        content=f"Your offer has been accepted! Deal room is now active.",
        link=f"/dashboard/deal-rooms/{deal_room.id}",
        metadata={"offer_id": str(offer.id), "deal_room_id": str(deal_room.id)}
    )

    return {
        "offer": offer,
        "transaction": transaction,
        "deal_room": deal_room,
        "message": "Offer accepted successfully. Deal room created."
    }


@router.post("/{offer_id}/reject")
def reject_offer(
    offer_id: UUID,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Reject an offer (seller action)."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can reject this offer")

    if offer.status != OfferStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Offer is {offer.status.value}, cannot reject")

    offer.status = OfferStatus.REJECTED
    offer.responded_at = datetime.utcnow()

    if reason:
        offer.conditions = {"rejection_reason": reason}

    db.commit()

    # Notify buyer
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=offer.buyer_id,
        type="OFFER_REJECTED",
        title="Offer Rejected",
        content=f"Your offer has been rejected." + (f" Reason: {reason}" if reason else ""),
        link=f"/dashboard/offers?id={offer.id}",
        metadata={"offer_id": str(offer.id)}
    )

    return {"message": "Offer rejected successfully"}


@router.post("/{offer_id}/counter", response_model=OfferRead)
def counter_offer(
    offer_id: UUID,
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Counter an existing offer (seller action)."""
    original_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not original_offer:
        raise HTTPException(status_code=404, detail="Original offer not found")

    if original_offer.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can counter this offer")

    if original_offer.status != OfferStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Cannot counter offer with status {original_offer.status.value}")

    # Mark original as countered
    original_offer.status = OfferStatus.COUNTERED
    original_offer.responded_at = datetime.utcnow()

    # Create counter offer (roles reversed)
    counter = Offer(
        **offer_in.model_dump(),
        buyer_id=original_offer.buyer_id,
        seller_id=original_offer.seller_id,
        parent_offer_id=original_offer.id,
        status=OfferStatus.DRAFT,
        expires_at=datetime.utcnow() + timedelta(days=3)  # 3-day counter expiration
    )
    db.add(counter)
    db.commit()
    db.refresh(counter)

    # Notify original buyer
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=original_offer.buyer_id,
        type="COUNTER_OFFER",
        title="Counter Offer Received",
        content=f"The seller countered with {counter.amount} {counter.currency.value}.",
        link=f"/dashboard/offers?id={counter.id}",
        metadata={"offer_id": str(counter.id), "parent_offer_id": str(original_offer.id)}
    )

    return counter


@router.post("/{offer_id}/withdraw")
def withdraw_offer(
    offer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Withdraw an offer (buyer action)."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can withdraw this offer")

    if offer.status != OfferStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Cannot withdraw offer with status {offer.status.value}")

    offer.status = OfferStatus.WITHDRAWN
    db.commit()

    return {"message": "Offer withdrawn successfully"}
