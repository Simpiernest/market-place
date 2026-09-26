from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

from app.models.domain import TransactionStatus, Currency, DealMilestoneStatus

class DealMilestoneRead(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    status: DealMilestoneStatus
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DealRoomRead(BaseModel):
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    offer_id: UUID
    status: str
    milestones: List[DealMilestoneRead]

    model_config = ConfigDict(from_attributes=True)

class TransactionBase(BaseModel):
    amount: Decimal
    currency: Currency
    commission_rate: Decimal
    commission_amount: Decimal
    seller_proceeds: Decimal
    status: TransactionStatus

class TransactionCreate(BaseModel):
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    offer_id: Optional[UUID] = None
    amount: Decimal
    currency: Currency
    commission_rate: Decimal = Decimal("0.05")

class TransactionRead(TransactionBase):
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    offer_id: Optional[UUID] = None
    payment_provider: Optional[str] = None
    payment_provider_id: Optional[str] = None
    created_at: datetime

    # We'll include basic deal info for the UI
    listing_title: Optional[str] = None
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    progress: int = 0
    milestones: List[DealMilestoneRead] = []

    model_config = ConfigDict(from_attributes=True)
