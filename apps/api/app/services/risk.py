from sqlalchemy.orm import Session
from app.models.domain import User, Listing, DataAccessRequest, AuditLog
from uuid import UUID
from datetime import datetime, timedelta

class RiskEngineService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_user_risk_score(self, user_id: UUID) -> dict:
        """
        Calculate a risk score from 0-100.
        Signals:
        - Excessive listing unlocks
        - Rapid listing creation
        - Failed verifications
        - Geographic anomalies
        """
        score = 0
        signals = []

        # 1. Excessive unlocks in last 24h
        day_ago = datetime.utcnow() - timedelta(days=1)
        unlock_count = self.db.query(DataAccessRequest).filter(
            DataAccessRequest.buyer_id == user_id,
            DataAccessRequest.created_at >= day_ago
        ).count()

        if unlock_count > 5:
            score += 30
            signals.append(f"High volume of access requests ({unlock_count} in 24h)")

        # 2. Failed verifications
        failed_count = self.db.query(UserVerification).filter(
            UserVerification.user_id == user_id,
            UserVerification.status == VerificationStatus.REJECTED
        ).count()
        if failed_count > 0:
            score += failed_count * 10
            signals.append(f"{failed_count} failed verification attempts")

        # 3. Sudden spikes in Listing Views (Bot detection)
        # ... logic ...

        # 4. Suspicious patterns from Audit Logs
        # ... logic ...

        risk_level = "LOW"
        if score >= 70:
            risk_level = "HIGH"
        elif score >= 30:
            risk_level = "MEDIUM"

        return {
            "score": score,
            "level": risk_level,
            "signals": signals
        }

    def flag_suspicious_activity(self, user_id: UUID, action: str, details: str):
        # Create a special notification for admins or log to a high-priority audit table
        pass
