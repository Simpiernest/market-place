from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ListingAccessBase(BaseModel):
    listing_id: UUID
    user_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    access_group_id: Optional[UUID] = None

class ListingAccessCreate(ListingAccessBase):
    pass

class ListingAccessRead(ListingAccessBase):
    id: UUID
    granted_by_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AccessGroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class AccessGroupCreate(AccessGroupBase):
    pass

class AccessGroupRead(AccessGroupBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
