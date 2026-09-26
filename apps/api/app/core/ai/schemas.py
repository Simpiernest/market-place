from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import enum

class EvidenceType(str, enum.Enum):
    VERIFIED_FACT = "VERIFIED_FACT"
    SELLER_CLAIM = "SELLER_CLAIM"
    EXTRACTED_DATA = "EXTRACTED_DATA"
    THIRD_PARTY_DATA = "THIRD_PARTY_DATA"
    AI_INFERENCE = "AI_INFERENCE"
    AI_RECOMMENDATION = "AI_RECOMMENDATION"

class AIEvidence(BaseModel):
    type: EvidenceType
    content: str
    source: Optional[str] = None
    confidence: float = 1.0

class AIResponse(BaseModel):
    content: str
    evidence: List[AIEvidence] = []
    metadata: Dict[str, Any] = {}

class AIToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]

class AIMessage(BaseModel):
    role: str # system, user, assistant, tool
    content: Optional[str] = None
    tool_calls: Optional[List[AIToolCall]] = None
    tool_call_id: Optional[str] = None
