from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BuyerMandateBase(BaseModel):
    title: str
    industries: List[str] = []
    business_models: List[str] = []
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    min_revenue: Optional[float] = None
    min_profit: Optional[float] = None
    preferred_locations: List[str] = []
    specific_requirements: Optional[str] = None

class BuyerMandateCreate(BuyerMandateBase):
    pass

class BuyerMandateUpdate(BuyerMandateBase):
    title: Optional[str] = None
    is_active: Optional[bool] = None

class BuyerMandateRead(BuyerMandateBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
