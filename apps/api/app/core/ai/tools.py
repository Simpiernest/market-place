from app.models.domain import Listing, ListingStatus, Category
from sqlalchemy.orm import Session
from sqlalchemy import or_

logger = logging.getLogger(__name__)

async def search_listings_tool(
    db: Session,
    business_type: Optional[str] = None,
    min_profit: Optional[float] = None,
    max_price: Optional[float] = None,
    min_organic_traffic: Optional[float] = None,
    owner_involvement: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """AI-callable tool to search the marketplace database."""
    query = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE)

    if max_price:
        query = query.filter(Listing.asking_price <= max_price)

    # More complex logic for business_type, profit etc. would be added here
    # For now, return basic results
    results = query.limit(5).all()

    return [
        {
            "id": str(r.id),
            "title": r.title,
            "price": float(r.asking_price),
            "multiple": "3.2x" # Logic to calculate
        } for r in results
    ]

async def calculate_valuation(
    annual_revenue: float,
    annual_profit: float,
    growth_rate: float,
    industry_multiple: float = 3.5
) -> Dict[str, Any]:
    """Deterministic valuation engine called by AI."""
    base_value = annual_profit * industry_multiple
    growth_adjustment = base_value * (growth_rate / 100)

    total_valuation = base_value + growth_adjustment

    return {
        "valuation": round(total_valuation, 2),
        "base_multiple": industry_multiple,
        "growth_bonus": round(growth_adjustment, 2),
        "methodology": "SDE Multiple with Growth Adjustment"
    }

async def analyze_financials(
    p_and_l_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Analyzes financial trends and flags anomalies."""
    # Simulation for V2
    return {
        "status": "Healthy",
        "key_metrics": {
            "gross_margin": "72%",
            "net_margin": "45%",
            "cac_payback": "4.2 months"
        },
        "flags": []
    }

async def summarize_document(
    content: str,
    focus_areas: List[str] = ["Risks", "Key Figures"]
) -> str:
    """Specialized tool for document summarization."""
    # This would usually call another model or specific summarization logic
    return f"Summary focusing on {', '.join(focus_areas)}: [Content Analysis Truncated]"

# Tool Schemas for OpenAI/Anthropic
CALCULATE_VALUATION_SCHEMA = {
    "type": "function",
    "function": {
        "name": "calculate_valuation",
        "description": "Calculate a business valuation based on revenue, profit, and growth.",
        "parameters": {
            "type": "object",
            "properties": {
                "annual_revenue": {"type": "number"},
                "annual_profit": {"type": "number"},
                "growth_rate": {"type": "number", "description": "Percentage growth rate"},
                "industry_multiple": {"type": "number", "default": 3.5}
            },
            "required": ["annual_revenue", "annual_profit", "growth_rate"]
        }
    }
}

SEARCH_LISTINGS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "search_listings",
        "description": "Search for business listings based on financial and operational criteria.",
        "parameters": {
            "type": "object",
            "properties": {
                "business_type": {"type": "string", "enum": ["SaaS", "Ecommerce", "Content", "Apps"]},
                "min_profit": {"type": "number"},
                "max_price": {"type": "number"},
                "min_organic_traffic": {"type": "number", "description": "Percentage"},
                "owner_involvement": {"type": "string", "enum": ["low", "medium", "high"]}
            }
        }
    }
}
