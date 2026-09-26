from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.core.database import get_db
from app.api import deps
from app.models.domain import Listing, ListingStatus, Category, Transaction, User, ListingVisibility, ListingAccess, OrganizationMember, Business, SavedSearch
from app.schemas.marketplace import MarketplaceResponse
from app.schemas.listing import ListingRead
from app.services.broker import AIBrokerService
from app.services.search import SearchService

router = APIRouter()


@router.get("/stats")
def get_marketplace_stats(db: Session = Depends(get_db)) -> Any:
    """Get aggregate marketplace statistics for the homepage."""
    active_listings = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE).count()

    # Calculate total volume from completed transactions
    total_volume = db.query(func.sum(Transaction.amount)).filter(
        Transaction.status == "COMPLETED"
    ).scalar() or 0

    verified_buyers = db.query(User).join(User.roles).filter(
        # This is a simplification for V1
        Listing.status == ListingStatus.ACTIVE
    ).count()

    return {
        "active_listings": active_listings,
        "total_volume": float(total_volume),
        "verified_buyers": verified_buyers,
        "avg_multiple": 3.4  # Hardcoded for V1 until we have more deal data
    }


@router.get("/", response_model=MarketplaceResponse)
async def get_marketplace_listings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    category_slug: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_profit: Optional[float] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    ai_match: Optional[bool] = Query(False)
) -> Any:
    """
    Get marketplace listings with filtering and search.
    Shows PUBLIC listings to everyone.
    Shows PRIVATE listings only to authorized users.
    If ai_match=True, returns personalized matches for the user.
    """
    # 1. Handle AI Matching / Natural Language Search
    if ai_match:
        broker = AIBrokerService(db)

        # If search text is provided, use AI to parse it into filters
        if search:
            ai_filters = await broker.parse_natural_language_search(search)
            # Override params with AI extracted filters
            min_price = ai_filters.get("min_price", min_price)
            max_price = ai_filters.get("max_price", max_price)
            category_slug = ai_filters.get("category_slug", category_slug)
            min_profit = ai_filters.get("min_profit", min_profit)
        elif current_user:
            # Otherwise, use existing matching logic based on Buyer Mandate
            matches = await broker.generate_facilitated_matches(current_user.id)
            listing_ids = [m["listing_id"] for m in matches]
            items = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()
            return {
                "items": items,
                "total": len(items),
                "page": 1,
                "size": len(items),
            }

    # 2. Standard Filter Logic
    # Base filter: Active listings
    base_filter = Listing.status == ListingStatus.ACTIVE

    if not current_user:
        # Anonymous users only see PUBLIC listings
        query = db.query(Listing).filter(
            base_filter,
            Listing.visibility == ListingVisibility.PUBLIC
        )
    else:
        # Logged in users see PUBLIC + those they have access to
        visibility_filter = or_(
            Listing.visibility == ListingVisibility.PUBLIC,
            Listing.seller_id == current_user.id,
            Listing.authorized_access.any(
                or_(
                    ListingAccess.user_id == current_user.id,
                    ListingAccess.organization_id.in_(
                        db.query(OrganizationMember.organization_id).filter(OrganizationMember.user_id == current_user.id)
                    )
                )
            )
        )
        query = db.query(Listing).filter(base_filter, visibility_filter)

    if category_id:
        query = query.filter(Listing.category_id == category_id)

    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    if min_price:
        query = query.filter(Listing.asking_price >= min_price)

    if max_price:
        query = query.filter(Listing.asking_price <= max_price)

    if min_profit:
        # Assuming profit is stored in the associated Business model
        query = query.join(Business).filter(Business.annual_profit >= (min_profit * 12))

    if search:
        search_filter = or_(
            Listing.title.ilike(f"%{search}%"),
            Listing.description.ilike(f"%{search}%"),
            Listing.tagline.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    # Sorting logic
    if sort == "Price (High to Low)":
        query = query.order_by(Listing.asking_price.desc())
    elif sort == "Price (Low to High)":
        query = query.order_by(Listing.asking_price.asc())
    elif sort == "Newest Listings":
        query = query.order_by(Listing.created_at.desc())
    else:
        query = query.order_by(Listing.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/by-slug/{slug}", response_model=ListingRead)
async def get_listing_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
) -> Any:
    """Fetch a single listing by its URL slug with permission checks."""
    listing = db.query(Listing).filter(Listing.slug == slug).first()
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
        from app.models.domain import DataAccessRequestStatus, DataAccessRequest
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

    return listing


@router.get("/categories", response_model=List[Any])
def get_categories(db: Session = Depends(get_db)) -> Any:
    """Get all active marketplace categories."""
    return db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()


@router.get("/featured", response_model=List[ListingRead])
def get_featured_listings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
) -> Any:
    """Get featured marketplace listings."""
    base_filter = Listing.status == ListingStatus.ACTIVE

    if not current_user:
        query = db.query(Listing).filter(
            base_filter,
            Listing.visibility == ListingVisibility.PUBLIC
        )
    else:
        visibility_filter = or_(
            Listing.visibility == ListingVisibility.PUBLIC,
            Listing.seller_id == current_user.id,
            Listing.authorized_access.any(
                or_(
                    ListingAccess.user_id == current_user.id,
                    ListingAccess.organization_id.in_(
                        db.query(OrganizationMember.organization_id).filter(OrganizationMember.user_id == current_user.id)
                    )
                )
            )
        )
        query = db.query(Listing).filter(base_filter, visibility_filter)

    return query.filter(Listing.is_featured == True).limit(6).all()


@router.get("/sitemap-slugs")
def get_sitemap_slugs(db: Session = Depends(get_db)) -> List[str]:
    """Returns all active listing slugs for SEO sitemap generation."""
    slugs = db.query(Listing.slug).filter(Listing.status == ListingStatus.ACTIVE).all()
    return [s[0] for s in slugs]


@router.get("/search", response_model=MarketplaceResponse)
def search_listings(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None),
    business_types: Optional[str] = Query(None),
    industries: Optional[str] = Query(None),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
    revenue_min: Optional[float] = Query(None),
    revenue_max: Optional[float] = Query(None),
    profit_min: Optional[float] = Query(None),
    profit_max: Optional[float] = Query(None),
    verified_only: bool = Query(False),
    sale_types: Optional[str] = Query(None),
    owner_involvement: Optional[str] = Query(None),
    countries: Optional[str] = Query(None),
    sort_by: str = Query("relevance"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> Any:
    """Full-text search across active listings using PostgreSQL GIN indexes."""
    service = SearchService(db)
    bt = business_types.split(",") if business_types else None
    ind = industries.split(",") if industries else None
    st = sale_types.split(",") if sale_types else None
    oi = owner_involvement.split(",") if owner_involvement else None
    co = countries.split(",") if countries else None

    return service.search_listings(
        query=q,
        business_types=bt,
        industries=ind,
        price_min=price_min,
        price_max=price_max,
        revenue_min=revenue_min,
        revenue_max=revenue_max,
        profit_min=profit_min,
        profit_max=profit_max,
        verified_only=verified_only,
        sale_types=st,
        owner_involvement=oi,
        countries=co,
        sort_by=sort_by,
        page=page,
        limit=size,
    )


@router.get("/search/categories")
def search_categories(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
) -> Any:
    """Full-text search across marketplace categories."""
    return SearchService(db).search_categories(q, limit)


@router.get("/search/sellers")
def search_sellers(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
) -> Any:
    """Search seller profiles by name or company."""
    return SearchService(db).search_sellers(q, limit)


@router.get("/search/suggestions")
def search_suggestions(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
) -> Any:
    """Return autocomplete suggestions for a partial query."""
    return SearchService(db).get_suggestions(q, limit)


@router.get("/saved-searches")
def get_saved_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get user's saved searches."""
    return db.query(SavedSearch).filter(SavedSearch.user_id == current_user.id).all()


@router.post("/saved-searches")
def save_search(
    name: str,
    filters: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Save a search for a buyer."""
    search = SavedSearch(
        user_id=current_user.id,
        name=name,
        filters=filters
    )
    db.add(search)
    db.commit()
    db.refresh(search)
    return search


@router.delete("/saved-searches/{search_id}")
def delete_saved_search(
    search_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Delete a saved search."""
    search = db.query(SavedSearch).filter(
        SavedSearch.id == search_id,
        SavedSearch.user_id == current_user.id
    ).first()
    if not search:
        raise HTTPException(status_code=404, detail="Search not found")
    db.delete(search)
    db.commit()
    return {"message": "Search deleted"}
