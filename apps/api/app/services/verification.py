from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.domain import UserVerification, VerificationCategory, VerificationStatus
from datetime import datetime

class BaseVerificationProvider(ABC):
    @abstractmethod
    async def create_session(self, user_id: UUID, category: VerificationCategory) -> Dict[str, Any]:
        """Create a verification session with the provider."""
        pass

    @abstractmethod
    async def get_status(self, session_id: str) -> VerificationStatus:
        """Fetch the current status of a verification session."""
        pass

class StripeIdentityStub(BaseVerificationProvider):
    async def create_session(self, user_id: UUID, category: VerificationCategory) -> Dict[str, Any]:
        # Placeholder for Stripe Identity API call
        return {
            "session_id": f"stub_{user_id}",
            "url": f"https://verify.businessbridge.com/session/{user_id}"
        }

    async def get_status(self, session_id: str) -> VerificationStatus:
        return VerificationStatus.VERIFIED

class VerificationService:
    def __init__(self, db: Session, provider: BaseVerificationProvider = StripeIdentityStub()):
        self.db = db
        self.provider = provider

    async def initiate_verification(self, user_id: UUID, category: VerificationCategory) -> Dict[str, Any]:
        # Check if already verified
        existing = self.db.query(UserVerification).filter(
            UserVerification.user_id == user_id,
            UserVerification.category == category
        ).first()

        if existing and existing.status == VerificationStatus.VERIFIED:
            return {"status": "ALREADY_VERIFIED"}

        session = await self.provider.create_session(user_id, category)

        if not existing:
            new_v = UserVerification(
                user_id=user_id,
                category=category,
                status=VerificationStatus.IN_PROGRESS,
                evidence={"provider_session_id": session["session_id"]}
            )
            self.db.add(new_v)
        else:
            existing.status = VerificationStatus.IN_PROGRESS
            existing.evidence = {"provider_session_id": session["session_id"]}

        self.db.commit()
        return session

    def update_verification_status(self, user_id: UUID, category: VerificationCategory, status: VerificationStatus, evidence: Optional[Dict[str, Any]] = None):
        v = self.db.query(UserVerification).filter(
            UserVerification.user_id == user_id,
            UserVerification.category == category
        ).first()

        if v:
            v.status = status
            if evidence:
                v.evidence = {**(v.evidence or {}), **evidence}
            if status == VerificationStatus.VERIFIED:
                v.verified_at = datetime.utcnow()
            self.db.commit()
