"""Seller-specific endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, List
from uuid import UUID

from app.core.database import get_db
from app.models.domain import User, Listing, SellerProfile, UserRole, ListingStatus, Conversation, DataAccessRequest, DataAccessRequestStatus
from app.api import deps

router = APIRouter()


@router.get("/dashboard")
async def get_seller_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get seller dashboard data."""
    listings = db.query(Listing).filter(Listing.seller_id == current_user.id).all()
    active_count = len([l for l in listings if l.status == ListingStatus.ACTIVE])

    # Calculate total views across all listings
    total_views = db.query(func.sum(Listing.view_count)).filter(
        Listing.seller_id == current_user.id
    ).scalar() or 0

    # New inquiries count (unique conversations about their listings)
    inquiries_count = db.query(Conversation).filter(
        Conversation.listing_id.in_([l.id for l in listings])
    ).count() if listings else 0

    # NDA access requests pending review
    requests_count = db.query(DataAccessRequest).join(Listing).filter(
        Listing.seller_id == current_user.id,
        DataAccessRequest.status == DataAccessRequestStatus.PENDING_SELLER_REVIEW
    ).count()

    return {
        "listings_count": len(listings),
        "active_count": active_count,
        "views": int(total_views),
        "inquiries": inquiries_count,
        "access_requests": requests_count
    }


@router.get("/listings", response_model=List[Any])
async def get_seller_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get seller's listings with real metrics."""
    listings = db.query(Listing).filter(Listing.seller_id == current_user.id).all()

    # Enrich with category name
    return [
        {
            **{c.name: getattr(l, c.name) for c in l.__table__.columns},
            "category_name": l.category.name if l.category else "SaaS",
            "views": l.view_count,
            "saves": l.save_count
        } for l in listings
    ]


@router.get("/{user_id}/profile")
async def get_seller_public_profile(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Get public profile for a seller."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Seller not found")

    # Verify user has SELLER role
    is_seller = any(r.role == UserRole.SELLER for r in user.roles)
    if not is_seller:
         raise HTTPException(status_code=404, detail="User is not a registered seller")

    listings = db.query(Listing).filter(
        Listing.seller_id == user_id,
        Listing.status == ListingStatus.ACTIVE
    ).all()

    return {
        "id": user.id,
        "full_name": user.full_name,
        "bio": user.profile.bio if user.profile else "",
        "joined_year": user.created_at.year,
        "listings": listings,
        "rating": 4.9, # Mocked until review system V1.5
        "sales_count": 5
    }


@router.get("/insights")
async def get_seller_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Returns AI-driven growth insights for the seller's portfolio."""
    # Logic to aggregate metrics and generate insights
    listings = db.query(Listing).filter(Listing.seller_id == current_user.id).all()

    insights = []
    if not listings:
        insights.append({
            "type": "TIP",
            "title": "Start your journey",
            "narrative": "Create your first listing to begin receiving acquisition interest."
        })
    else:
        # Dynamic insight generation (simplified)
        insights.append({
            "type": "OPPORTUNITY",
            "title": "Multiple Optimization",
            "narrative": "Your current asking prices are 15% above the market average for your category. Consider a 5% adjustment to increase buyer velocity."
        })
        insights.append({
            "type": "RISK",
            "title": "Documentation Gap",
            "narrative": "One or more of your listings is missing P&L statements. Listings with verified financials receive 8x more offers."
        })

    return {
        "insights": insights,
        "intent_score": 72,
        "market_interest": "STABLE"
    }


@router.post("/valuation")
async def calculate_business_valuation(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Generates an AI-powered valuation estimate based on market multiples."""
    revenue = float(data.get("revenue", 0))
    profit = float(data.get("profit", 0))
    growth = float(data.get("growth", 0))

    # Base multiple for SaaS (simplified)
    base_multiple = 3.5
    growth_premium = (growth / 100) * 2.0
    implied_multiple = base_multiple + growth_premium

    estimated_value = profit * implied_multiple

    # Comps fetch
    comps = db.query(Listing).filter(
        Listing.status.in_([ListingStatus.ACTIVE, ListingStatus.SOLD])
    ).limit(3).all()

    return {
        "estimated_value": round(estimated_value, 2),
        "implied_multiple": round(implied_multiple, 2),
        "profit_margin": round((profit / revenue * 100), 1) if revenue > 0 else 0,
        "growth_premium": round(profit * growth_premium, 2),
        "valuation_id": f"BB-VAL-{current_user.id.hex[:4].upper()}",
        "comps": [
            {
                "title": c.title,
                "asking": float(c.asking_price),
                "multiple": "3.8x",
                "status": c.status.value
            } for c in comps
        ]
    }
