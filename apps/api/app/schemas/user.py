from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from app.models.domain import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    id: Optional[UUID] = None
    password: str
    role: Optional[UserRole] = UserRole.BUYER

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    bio: Optional[str] = None

    # Settings fields
    two_factor_enabled: Optional[bool] = None
    login_notifications: Optional[bool] = None
    notification_preferences: Optional[dict] = None
    privacy_settings: Optional[dict] = None
    preferred_currency: Optional[str] = None
    language: Optional[str] = None

class UserRoleRead(BaseModel):
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class UserRead(UserBase):
    id: UUID
    email_verified: bool
    is_active: bool
    created_at: datetime
    roles: List[UserRoleRead]
    bio: Optional[str] = None

    # Settings from profile
    two_factor_enabled: Optional[bool] = None
    login_notifications: Optional[bool] = None
    notification_preferences: Optional[dict] = None
    privacy_settings: Optional[dict] = None
    preferred_currency: Optional[str] = None
    language: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserSessionRead(BaseModel):
    id: UUID
    device_info: Optional[str]
    ip_address: Optional[str]
    location: Optional[str]
    is_active: bool
    last_activity_at: datetime

    model_config = ConfigDict(from_attributes=True)
