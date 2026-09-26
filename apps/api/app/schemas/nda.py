from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.domain import DataAccessRequestStatus

class NDABase(BaseModel):
    listing_id: UUID
    content: str

class NDARead(NDABase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NDASignatureCreate(BaseModel):
    full_legal_name: str
    email: EmailStr
    company: Optional[str] = None
    signature_data: str # Base64 image or SVG path
    signature_type: str # "DRAWN" or "TYPED"

class NDASignatureRead(BaseModel):
    id: UUID
    user_id: UUID
    signed_at: datetime
    full_legal_name: str
    email: str
    company: Optional[str]
    signature_data: str
    signature_type: str

    model_config = ConfigDict(from_attributes=True)

class DataAccessRequestBase(BaseModel):
    listing_id: UUID

class DataAccessRequestCreate(DataAccessRequestBase):
    pass

class DataAccessRequestUpdate(BaseModel):
    status: DataAccessRequestStatus
    rejection_reason: Optional[str] = None

class DataAccessRequestRead(DataAccessRequestBase):
    id: UUID
    buyer_id: UUID
    status: DataAccessRequestStatus
    nda_signature_id: Optional[UUID]
    rejection_reason: Optional[str]
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DataAccessRequestDetail(DataAccessRequestRead):
    buyer_name: str
    buyer_company: Optional[str]
    buyer_verification_status: str = "PENDING"
    buyer_proof_of_funds: str = "PENDING"
    buyer_tier: str = "BASIC"
    listing_title: str
    signature: Optional[NDASignatureRead] = None

    model_config = ConfigDict(from_attributes=True)
