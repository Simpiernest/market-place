from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class MessageBase(BaseModel):
    content: str
    conversation_id: UUID

class MessageCreate(MessageBase):
    pass

class MessageRead(MessageBase):
    id: UUID
    sender_id: UUID
    is_system_message: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationRead(BaseModel):
    id: UUID
    listing_id: Optional[UUID]
    listing_title: Optional[str] = None
    subject: Optional[str]
    last_message_at: datetime
    participant_name: Optional[str] = None
    participant_id: Optional[UUID] = None
    participant_role: Optional[str] = None
    last_message_content: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
