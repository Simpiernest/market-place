from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import Listing, BuyerMandate, ListingStatus

class MatchingService:
    """Scours the marketplace to find listings that match buyer mandates."""

    def __init__(self, db: Session):
        self.db = db

    def score_listing_against_mandate(self, listing: Listing, mandate: BuyerMandate) -> float:
        """
        Scores a listing from 0.0 to 1.0 based on how well it fits a mandate.
        1.0 = perfect match.
        """
        score = 0.0
        weights = {
            "industry": 0.3,
            "budget": 0.3,
            "financials": 0.3,
            "location": 0.1
        }

        # 1. Industry Match
        if mandate.industries and listing.category.name in mandate.industries:
            score += weights["industry"]
        elif not mandate.industries:
            score += weights["industry"] # Neutral

        # 2. Budget Match
        asking_price = float(listing.asking_price)
        if mandate.budget_min and mandate.budget_max:
            if float(mandate.budget_min) <= asking_price <= float(mandate.budget_max):
                score += weights["budget"]
            elif asking_price <= float(mandate.budget_max):
                score += (weights["budget"] * 0.7) # Slightly over min but under max
        else:
            score += weights["budget"]

        # 3. Financials (Revenue/Profit)
        # Simplified for V2 demo
        score += weights["financials"]

        # 4. Location
        if mandate.preferred_locations and listing.business.country in mandate.preferred_locations:
            score += weights["location"]
        elif not mandate.preferred_locations:
            score += weights["location"]

        return round(score, 2)

    def find_matches_for_buyer(self, user_id: Any, limit: int = 10) -> List[Dict[str, Any]]:
        """Finds top scoring active listings for all mandates of a user."""
        mandates = self.db.query(BuyerMandate).filter(BuyerMandate.user_id == user_id, BuyerMandate.is_active == True).all()
        if not mandates:
            return []

        active_listings = self.db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE).all()

        matches = []
        for listing in active_listings:
            best_score = 0.0
            for mandate in mandates:
                score = self.score_listing_against_mandate(listing, mandate)
                if score > best_score:
                    best_score = score

            if best_score >= 0.5: # Only include decent matches
                matches.append({
                    "listing": listing,
                    "score": best_score,
                    "match_reason": "Fits your industry and budget preferences."
                })

        # Sort by score descending
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]
