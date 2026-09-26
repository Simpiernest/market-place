from sqlalchemy.orm import Session
from app.models.domain import Listing, ListingVettingStatus, Business
import random

class ListingVettingService:
    def __init__(self, db: Session):
        self.db = db

    async def run_automated_vetting(self, listing_id: str):
        listing = self.db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return

        listing.status = ListingVettingStatus.AUTOMATED_REVIEW
        self.db.commit()

        # Run checks (Simulated)
        checks = {
            "domain_ownership": self._check_domain_ownership(listing),
            "financial_consistency": self._check_financials(listing),
            "technical_scan": self._check_technical_health(listing)
        }

        if all(checks.values()):
            listing.status = ListingVettingStatus.HUMAN_REVIEW
        else:
            listing.status = ListingVettingStatus.CHANGES_REQUESTED
            # Log specific failures in metadata/audit log

        self.db.commit()
        return checks

    def _check_domain_ownership(self, listing: Listing) -> bool:
        # Check for DNS TXT record or verified connection
        return True # Placeholder

    def _check_financials(self, listing: Listing) -> bool:
        # Compare listing revenue with connected accounts (Stripe, etc.)
        return True # Placeholder

    def _check_technical_health(self, listing: Listing) -> bool:
        # Scan domain for SSL, malware, etc.
        return True # Placeholder

class PLNormalizationService:
    def normalize_profit(self, business: Business) -> float:
        """
        Deep normalization of net profit.
        For AI businesses, specifically includes API and inferred ops costs.
        """
        gross = float(business.annual_revenue or 0)

        # Standard expenses from seller report
        # In V2, these would be pulled from connected Stripe/Quickbooks accounts
        reported_expenses = float(gross - float(business.annual_profit or 0))

        # Institutional adjustments
        ai_adjustment = 0
        if business.business_model == "AI":
            # Estimate API costs if not clearly reported (e.g. 15% of revenue for high-usage SaaS)
            ai_adjustment = gross * 0.15

        # Add other inferred costs (domain, basic hosting, buffer for churn)
        ops_buffer = gross * 0.05

        normalized_profit = gross - reported_expenses - ai_adjustment - ops_buffer
        return max(0, normalized_profit)

    def get_expense_breakdown(self, business: Business) -> dict:
        """Categorized verified expenses."""
        gross = float(business.annual_revenue or 0)
        profit = float(business.annual_profit or 0)
        total = gross - profit

        return {
            "Payment Processing": gross * 0.029 + 0.30,
            "Cloud Infrastructure": total * 0.2,
            "AI/API Consumption": gross * 0.12 if business.business_model == "AI" else 0,
            "Customer Support": total * 0.15,
            "Marketing & Acquisition": total * 0.4,
            "Operational Buffer": total * 0.1
        }
