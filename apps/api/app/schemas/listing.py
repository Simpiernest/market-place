from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

from app.models.domain import ListingVettingStatus, Currency, SaleType

class ListingBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str
    tagline: Optional[str] = None
    asking_price: Decimal = Field(..., gt=0)
    price_currency: Currency = Currency.USD
    negotiable: bool = True
    category_id: Optional[UUID] = None
    sale_type: SaleType = SaleType.NEGOTIATION

    # Auction fields
    starting_price: Optional[Decimal] = None
    reserve_price: Optional[Decimal] = None
    auction_ends_at: Optional[datetime] = None

class ListingCreate(ListingBase):
    business_id: Optional[UUID] = None
    highlights: Optional[List[str]] = None
    reason_for_sale: Optional[str] = None
    # Support wizard fields
    revenue: Optional[Decimal] = None
    profit: Optional[Decimal] = None
    tech_stack: Optional[str] = None
    hosting: Optional[str] = None
    mau: Optional[int] = None
    traffic_sources: Optional[dict] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    asking_price: Optional[Decimal] = None
    status: Optional[ListingVettingStatus] = None
    negotiable: Optional[bool] = None

class ListingMediaRead(BaseModel):
    id: UUID
    url: str
    thumbnail_url: Optional[str] = None
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

class ListingRead(ListingBase):
    id: UUID
    seller_id: UUID
    status: ListingVettingStatus
    is_verified: bool
    view_count: int
    created_at: datetime
    media: List[ListingMediaRead] = []

    # Live auction data
    current_bid: Optional[Decimal] = None
    bid_count: int = 0

    # Financial normalization
    verified_revenue: Optional[Decimal] = None
    verified_expenses: Optional[Decimal] = None
    normalized_profit: Optional[Decimal] = None
    verification_badges: List[str] = []

    model_config = ConfigDict(from_attributes=True)
