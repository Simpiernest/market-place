from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.domain import VerificationStatus

class VerificationDocumentBase(BaseModel):
    document_type: str
    file_url: str
    filename: str

class VerificationDocumentRead(VerificationDocumentBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VerificationCaseBase(BaseModel):
    verification_type: str # identity, business, revenue, traffic
    status: VerificationStatus = VerificationStatus.IN_PROGRESS
    subject_type: Optional[str] = "USER" # USER, ASSET, LISTING
    subject_id: Optional[str] = None

class VerificationCaseCreate(VerificationCaseBase):
    listing_id: Optional[UUID] = None

class VerificationCaseRead(VerificationCaseBase):
    id: UUID
    user_id: UUID
    listing_id: Optional[UUID] = None
    reviewer_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    documents: List[VerificationDocumentRead] = []

    model_config = ConfigDict(from_attributes=True)
