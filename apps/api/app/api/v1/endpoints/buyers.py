"""Buyer-specific endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from app.api import deps
from app.services.reputation import ReputationService
from app.core.database import get_db
from app.models.domain import User, SavedListing, BuyerProfile, Offer, ConversationParticipant, Listing, BuyerMandate
from app.schemas.buyer import BuyerMandateRead, BuyerMandateCreate, BuyerMandateUpdate

router = APIRouter()


@router.get("/dashboard")
async def get_buyer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get buyer dashboard statistics."""
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()

    saved_count = db.query(SavedListing).filter(SavedListing.buyer_id == buyer.id).count() if buyer else 0
    active_offers = db.query(Offer).filter(Offer.buyer_id == current_user.id, Offer.status == "PENDING").count()
    messages = db.query(ConversationParticipant).filter(ConversationParticipant.user_id == current_user.id).count()

    # Refresh reputation
    reputation_service = ReputationService(db)
    standing = reputation_service.calculate_buyer_standing(current_user.id)

    return {
        "saved": saved_count,
        "offers": active_offers,
        "messages": messages,
        "matches": 28,
        "standing": standing,
        "tier": buyer.tier if buyer else "BASIC"
    }


@router.get("/{user_id}/profile")
async def get_buyer_public_profile(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Get public profile for a buyer (for sellers to review)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Buyer not found")

    profile = user.buyer_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Buyer profile not found")

    # Verification status for trust
    from app.models.domain import UserVerification, VerificationCategory, VerificationStatus
    verifications = db.query(UserVerification).filter(
        UserVerification.user_id == user_id,
        UserVerification.status == VerificationStatus.VERIFIED
    ).all()

    cats = [v.category for v in verifications]

    return {
        "id": user.id,
        "full_name": user.full_name,
        "bio": user.profile.bio if user.profile else "",
        "joined_year": user.created_at.year,
        "tier": profile.tier.value,
        "standing_score": profile.standing_score,
        "identity_verified": VerificationCategory.IDENTITY in cats,
        "proof_of_funds_verified": VerificationCategory.PROOF_OF_FUNDS in cats,
        "acquisitions_count": 3, # Mocked
        "budget_range": f"{float(profile.budget_min or 0)} - {float(profile.budget_max or 0)}"
    }


@router.get("/saved-listings")
async def get_saved_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get buyer's saved listings."""
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not buyer:
        return {"items": []}

    saved = db.query(Listing).join(SavedListing).filter(SavedListing.buyer_id == buyer.id).all()
    return {"items": saved}


@router.post("/saved-listings")
async def save_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Save a listing for a buyer."""
    # Ensure buyer profile exists
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not buyer:
        buyer = BuyerProfile(user_id=current_user.id)
        db.add(buyer)
        db.flush()

    # Check if already saved
    existing = db.query(SavedListing).filter(
        SavedListing.buyer_id == buyer.id,
        SavedListing.listing_id == listing_id
    ).first()

    if existing:
        return {"message": "Listing already saved"}

    saved = SavedListing(buyer_id=buyer.id, listing_id=listing_id)
    db.add(saved)
    db.commit()

    return {"message": "Listing saved successfully"}


@router.delete("/saved-listings/{listing_id}")
async def unsave_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Remove a saved listing."""
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not buyer:
        return {"message": "Listing not saved"}

    existing = db.query(SavedListing).filter(
        SavedListing.buyer_id == buyer.id,
        SavedListing.listing_id == listing_id
    ).first()

    if not existing:
        return {"message": "Listing not saved"}

    db.delete(existing)
    db.commit()

    return {"message": "Listing removed from saved list"}


@router.get("/mandates", response_model=List[BuyerMandateRead])
async def get_my_mandates(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List buyer's acquisition mandates."""
    return db.query(BuyerMandate).filter(BuyerMandate.user_id == current_user.id).all()


@router.post("/mandates", response_model=BuyerMandateRead)
async def create_mandate(
    mandate_in: BuyerMandateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Create a new acquisition mandate."""
    mandate = BuyerMandate(
        user_id=current_user.id,
        **mandate_in.model_dump()
    )
    db.add(mandate)
    db.commit()
    db.refresh(mandate)
    return mandate


@router.get("/recent")
async def get_recently_viewed_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Returns listings recently viewed by the user."""
    # In production, this would use a 'ListingView' model or Redis.
    # For V4, we'll return some active listings as a fallback for the UI wire.
    listings = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE).limit(4).all()
    return listings
