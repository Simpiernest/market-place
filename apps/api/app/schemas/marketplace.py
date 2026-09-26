from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from decimal import Decimal

from app.schemas.listing import ListingRead
from app.models.domain import Currency

class MarketplaceFilter(BaseModel):
    category_id: Optional[UUID] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    currency: Optional[Currency] = None
    search: Optional[str] = None

class MarketplaceResponse(BaseModel):
    items: List[ListingRead]
    total: int
    page: int
    size: int
