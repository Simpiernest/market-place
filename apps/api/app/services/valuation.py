from decimal import Decimal
from typing import Dict, Any, List
from app.models.domain import Business, Category

class DeterministicValuationEngine:
    """Calculates business valuation ranges based on verified data and industry multiples."""

    @staticmethod
    def calculate_valuation(
        asset_type: str,
        annual_profit: Decimal,
        growth_rate: Decimal,
        owner_involvement: str, # 'high', 'medium', 'low'
        revenue_recurring: bool = True
    ) -> Dict[str, Any]:

        # Base multiples by asset type (Simplified for V5)
        multiples = {
            "SaaS": 3.5,
            "Ecommerce": 2.5,
            "Mobile App": 3.0,
            "Content Site": 2.0,
            "Agency": 1.5,
            "Newsletter": 2.2,
            "AI Business": 4.0,
            "Plugin": 2.8,
            "Marketplace": 3.2
        }

        base_multiple = multiples.get(asset_type, 2.5)

        # Growth adjustments
        if growth_rate > 50: base_multiple += 0.5
        elif growth_rate > 20: base_multiple += 0.2
        elif growth_rate < 0: base_multiple -= 0.5

        # Owner involvement adjustments
        if owner_involvement == 'low': base_multiple += 0.3
        elif owner_involvement == 'high': base_multiple -= 0.5

        # Recurring revenue bonus
        if revenue_recurring: base_multiple += 0.2

        # Calculate range
        low_val = annual_profit * Decimal(str(base_multiple - 0.2))
        high_val = annual_profit * Decimal(str(base_multiple + 0.3))

        return {
            "valuation_range": [float(low_val), float(high_val)],
            "estimated_multiple": float(base_multiple),
            "confidence": 0.85,
            "comparable_multiples": [base_multiple - 0.5, base_multiple + 0.5],
            "factors": {
                "growth": "Strong" if growth_rate > 20 else "Stable",
                "operations": owner_involvement.capitalize(),
                "yield": "High" if annual_profit > 100000 else "Standard"
            }
        }
