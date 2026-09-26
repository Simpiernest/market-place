from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.domain import DealMilestoneStatus


class MilestoneBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneRead(MilestoneBase):
    id: UUID
    deal_room_id: UUID
    status: DealMilestoneStatus
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssetTransferBase(BaseModel):
    asset_type: str = Field(..., max_length=50)
    asset_name: str = Field(..., max_length=255)
    verification_method: Optional[str] = None
    handover_data: Optional[dict] = None


class AssetTransferCreate(AssetTransferBase):
    pass


class AssetTransferRead(AssetTransferBase):
    id: UUID
    deal_room_id: UUID
    status: str
    evidence_url: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DealRoomRead(BaseModel):
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    offer_id: UUID
    status: str
    milestones: List[MilestoneRead] = []
    asset_transfers: List[AssetTransferRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
