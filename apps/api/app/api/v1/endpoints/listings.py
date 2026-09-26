from typing import Any, List, Dict, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.core.database import get_db
from app.models.domain import Listing, ListingStatus, Business, UserRole, ListingVisibility, DataAccessRequestStatus, DataAccessRequest
from app.schemas.listing import ListingRead, ListingCreate, ListingUpdate
from app.api import deps
from app.api.auth_helpers import ResourceOwnershipValidator
from app.utils.validation import InputValidator
from app.services.search_trigger import update_listing_search_vector

router = APIRouter()


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[any] = Depends(deps.get_current_user_optional),
) -> Any:
    """
    Get a specific listing by ID.
    Increment view count on every access.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # SECURITY FIX: Check visibility and authorization for PRIVATE listings
    if listing.visibility != ListingVisibility.PUBLIC:
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authentication required for private listings"
            )

        # Check if user has explicit access
        is_owner = listing.seller_id == current_user.id

        has_approved_access = False
        access_request = db.query(DataAccessRequest).filter(
            DataAccessRequest.listing_id == listing.id,
            DataAccessRequest.buyer_id == current_user.id
        ).first()

        if access_request and access_request.status == DataAccessRequestStatus.APPROVED:
            has_approved_access = True

        if not (is_owner or has_approved_access):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this private listing"
            )

    # Increment view count
    listing.view_count += 1
    db.commit()
    db.refresh(listing)

    # Populate verified/normalized data
    from app.services.reputation import ReputationService
    from app.services.vetting import PLNormalizationService

    reputation_service = ReputationService(db)
    normalization_service = PLNormalizationService()

    badges = reputation_service.get_listing_badges(listing.id)
    normalized_profit = normalization_service.normalize_profit(listing.business)
    expense_breakdown = normalization_service.get_expense_breakdown(listing.business)

    return {
        **{c.name: getattr(listing, c.name) for c in listing.__table__.columns},
        "verified_revenue": float(listing.business.annual_revenue) if listing.is_verified else None,
        "verified_expenses": float(listing.business.annual_revenue - listing.business.annual_profit) if listing.is_verified else None,
        "normalized_profit": normalized_profit,
        "expense_breakdown": expense_breakdown,
        "verification_badges": badges
    }


@router.post("/", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: any = Depends(deps.get_current_user),
) -> Any:
    """Create a new business listing with associated wizard data."""

    # 1. Create or Find Business
    business_id = listing_in.business_id
    if not business_id:
        business = Business(
            owner_id=current_user.id,
            name=listing_in.title,
            description=listing_in.description,
            monthly_revenue=listing_in.revenue,
            monthly_profit=listing_in.profit,
            technology_stack=listing_in.tech_stack,
            hosting_platform=listing_in.hosting,
            monthly_traffic=listing_in.mau
        )
        db.add(business)
        db.flush() # Get business.id
        business_id = business.id

    # 2. Create Listing
    listing_data = listing_in.model_dump(exclude={
        "business_id", "revenue", "profit", "tech_stack", "hosting", "mau", "traffic_sources"
    })

    # Auto-generate slug if missing
    slug = listing_in.title.lower().replace(" ", "-")

    listing = Listing(
        **listing_data,
        business_id=business_id,
        seller_id=current_user.id,
        slug=slug,
        current_bid=listing_in.starting_price if listing_in.sale_type == "AUCTION" else None
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Update search vector for full-text search
    update_listing_search_vector(
        db,
        listing.id,
        listing.title,
        listing.description,
        listing.tagline
    )

    return listing


@router.post("/generate", response_model=Dict[str, Any])
async def generate_listing_content(
    business_info: dict,
    current_user: any = Depends(deps.get_current_user)
):
    """AI-powered listing content generation."""
    # In V2, this would call the AIOrchestrator with a specific prompt
    # For now, simulate high-quality generation
    name = business_info.get("name", "Target Business")

    return {
        "title": f"Premium {name} with High Recurring Revenue",
        "tagline": "The future of automated digital acquisitions.",
        "description": f"This high-performance {name} has seen consistent growth. Built on modern tech stack with a lean operational model.",
        "highlights": [
            "High net profit margin",
            "Minimal owner involvement (< 5hrs/week)",
            "Strong organic traffic profile"
        ],
        "meta_title": f"Buy {name} - Verified Digital Asset",
        "meta_description": f"Exclusive opportunity to acquire a profitable {name}. Low churn and high scalability."
    }


@router.patch("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: UUID,
    listing_in: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: any = Depends(deps.get_current_user),
) -> Any:
    """Update an existing listing."""
    # SECURITY FIX: Validate ownership and seller role
    listing = ResourceOwnershipValidator.validate_listing_ownership(
        listing_id, current_user, db
    )

    # SECURITY FIX: Whitelist allowed fields to prevent mass assignment
    allowed_fields = {
        'title', 'tagline', 'description', 'highlights',
        'asking_price', 'negotiable', 'reason_for_sale',
        'included_assets', 'excluded_assets', 'visibility',
        'meta_title', 'meta_description'
    }

    update_data = listing_in.model_dump(exclude_unset=True)

    # SECURITY FIX: Validate asking price if being updated
    if 'asking_price' in update_data:
        update_data['asking_price'] = InputValidator.validate_listing_price(
            update_data['asking_price']
        )

    # SECURITY FIX: Only update whitelisted fields
    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing


@router.post("/{listing_id}/bid")
async def place_bid(
    listing_id: UUID,
    amount: Decimal,
    db: Session = Depends(get_db),
    current_user: any = Depends(deps.get_current_user)
):
    """Place a bid on an auction listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).with_for_update().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.sale_type != "AUCTION":
        raise HTTPException(status_code=400, detail="This listing is not an auction")

    if listing.auction_ends_at and listing.auction_ends_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Auction has ended")

    min_bid = (listing.current_bid or listing.starting_price or 0) + Decimal("100")
    if amount < min_bid:
        raise HTTPException(status_code=400, detail=f"Minimum bid is {min_bid}")

    listing.current_bid = amount
    listing.bid_count += 1

    # Track bid history in audit log
    from app.services.audit_logger import AuditLogger
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="PLACE_BID",
        resource_type="LISTING",
        resource_id=listing_id,
        changes={"amount": float(amount)}
    )

    db.commit()
    return {"message": "Bid placed successfully", "current_bid": float(amount)}
