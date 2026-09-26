from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    accuracy_rating: Optional[int] = Field(None, ge=1, le=5)

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: UUID
    transaction_id: UUID
    reviewer_id: UUID
    reviewee_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
