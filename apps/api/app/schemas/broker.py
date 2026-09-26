from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime

class BrokerProfileBase(BaseModel):
    company_name: Optional[str] = None
    license_number: Optional[str] = None
    specialties: Optional[List[str]] = None
    years_experience: int = 0
    bio: Optional[str] = None
    commission_rate: Decimal = Decimal("0.10")

class BrokerProfileCreate(BrokerProfileBase):
    pass

class BrokerProfileRead(BrokerProfileBase):
    id: UUID
    user_id: UUID
    verified_broker: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ClientRepresentationRead(BaseModel):
    id: UUID
    broker_id: UUID
    client_id: UUID
    listing_id: Optional[UUID] = None
    role: str
    status: str
    commission_agreement: Optional[Decimal] = None
    client_name: Optional[str] = None
    listing_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
