from sqlalchemy.orm import Session
from app.models.domain import (
    User, UserRole, UserVerification, VerificationCategory, VerificationStatus,
    BuyerProfile, BuyerTier, Listing
)
from uuid import UUID

class ReputationService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_buyer_standing(self, user_id: UUID) -> int:
        """Calculate buyer standing score (0-100)."""
        # Factors: Verified ID, POF, successful acquisitions, no disputes
        score = 50 # Base score

        verifications = self.db.query(UserVerification).filter(
            UserVerification.user_id == user_id,
            UserVerification.status == VerificationStatus.VERIFIED
        ).all()

        categories = [v.category for v in verifications]
        if VerificationCategory.IDENTITY in categories: score += 20
        if VerificationCategory.PROOF_OF_FUNDS in categories: score += 20

        # Update buyer profile
        buyer = self.db.query(BuyerProfile).filter(BuyerProfile.user_id == user_id).first()
        if buyer:
            buyer.standing_score = min(100, score)

            # Auto-tiering
            if score >= 90:
                buyer.tier = BuyerTier.TRUSTED
            elif VerificationCategory.PROOF_OF_FUNDS in categories:
                buyer.tier = BuyerTier.FUNDED
            elif VerificationCategory.IDENTITY in categories:
                buyer.tier = BuyerTier.VERIFIED
            else:
                buyer.tier = BuyerTier.BASIC

        self.db.commit()
        return score

    def get_listing_badges(self, listing_id: UUID) -> list:
        """Determine which trust badges to display for a listing."""
        listing = self.db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return []

        badges = []
        # Identity Verified
        # Ownership Verified
        # Revenue Verified
        # Financials Reviewed
        # Vetted Listing

        if listing.is_verified:
            badges.append("IDENTITY_VERIFIED")

        if listing.status == "PUBLISHED":
            badges.append("VETTED_LISTING")

        # Additional verification logic
        from app.models.domain import UserVerification, VerificationCategory, VerificationStatus
        seller_verifs = self.db.query(UserVerification).filter(
            UserVerification.user_id == listing.seller_id,
            UserVerification.status == VerificationStatus.VERIFIED
        ).all()

        cats = [v.category for v in seller_verifs]
        if VerificationCategory.FINANCIAL in cats: badges.append("REVENUE_VERIFIED")
        if VerificationCategory.TRAFFIC in cats: badges.append("TRAFFIC_VERIFIED")
        if VerificationCategory.ASSET_OWNERSHIP in cats: badges.append("OWNERSHIP_VERIFIED")

        return badges
