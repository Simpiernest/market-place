from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.domain import Currency, OfferStatus


class OfferBase(BaseModel):
    listing_id: UUID
    amount: float = Field(..., gt=0)
    currency: Currency
    terms: Optional[str] = None
    conditions: Optional[dict] = None
    financing_type: Optional[str] = None
    financing_details: Optional[dict] = None


class OfferCreate(OfferBase):
    pass


class OfferRead(OfferBase):
    id: UUID
    buyer_id: UUID
    buyer_name: Optional[str] = None
    buyer_tier: Optional[str] = None
    buyer_standing: Optional[int] = None
    seller_id: UUID
    parent_offer_id: Optional[UUID] = None
    status: OfferStatus
    expires_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OfferResponse(BaseModel):
    """Response when accepting an offer (includes transaction and deal room)."""
    offer: OfferRead
    transaction: dict
    deal_room: dict
    message: str
