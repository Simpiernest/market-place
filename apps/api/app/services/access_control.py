from sqlalchemy.orm import Session
from app.models.domain import (
    Listing, DataAccessRequest, DataAccessRequestStatus,
    BuyerProfile, BuyerTier, UserVerification, VerificationCategory, VerificationStatus
)
from uuid import UUID

class AccessControlService:
    def __init__(self, db: Session):
        self.db = db

    def can_access_field(self, user_id: UUID, listing_id: UUID, field_level: int) -> bool:
        """Enforce institutional access policies."""
        if field_level == 0:
            return True

        listing = self.db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return False

        # Seller always has access to their own listing
        if listing.seller_id == user_id:
            return True

        request = self.db.query(DataAccessRequest).filter(
            DataAccessRequest.listing_id == listing_id,
            DataAccessRequest.buyer_id == user_id
        ).first()

        # Check configurable listing requirements
        if listing.require_nda:
            if not request or not request.nda_signature_id:
                return False

        if listing.require_seller_approval:
            if not request or request.status != DataAccessRequestStatus.APPROVED:
                return False

        if listing.require_verified_buyer:
            buyer = self.db.query(BuyerProfile).filter(BuyerProfile.user_id == user_id).first()
            if not buyer or buyer.tier == BuyerTier.BASIC:
                return False

        if listing.require_proof_of_funds:
            pof = self.db.query(UserVerification).filter(
                UserVerification.user_id == user_id,
                UserVerification.category == VerificationCategory.PROOF_OF_FUNDS,
                UserVerification.status == VerificationStatus.VERIFIED
            ).first()
            if not pof:
                return False

        return True

    def track_unlock(self, user_id: UUID, listing_id: UUID):
        buyer = self.db.query(BuyerProfile).filter(BuyerProfile.user_id == user_id).first()
        if buyer:
            if buyer.used_unlocks_this_month >= buyer.monthly_unlock_limit:
                return False
            buyer.used_unlocks_this_month += 1
            self.db.commit()
            return True
        return False
