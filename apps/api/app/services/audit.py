"""
Audit logging service for security and financial events.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)


class AuditLogger:
    """Centralized audit logging for security and financial events."""

    def __init__(self, db: Session = None):
        self.db = db

    def log_security_event(
        self,
        event_type: str,
        user_id: Optional[UUID],
        severity: str,
        metadata: Dict[str, Any] = None,
        ip_address: str = None,
        user_agent: str = None
    ):
        """Log security-related events."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": str(user_id) if user_id else None,
            "severity": severity,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "metadata": metadata or {}
        }

        # Log to application logger
        if severity in ["HIGH", "CRITICAL"]:
            logger.error(f"SECURITY EVENT: {event_type}", extra=log_entry)
        else:
            logger.warning(f"Security event: {event_type}", extra=log_entry)

        # Store in database if available
        if self.db:
            try:
                from app.models.domain import AuditLog
                audit_log = AuditLog(
                    event_type=event_type,
                    user_id=user_id,
                    severity=severity,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata=metadata or {},
                    timestamp=datetime.utcnow()
                )
                self.db.add(audit_log)
                self.db.commit()
            except Exception as e:
                logger.error(f"Failed to write audit log to database: {e}")

    def log_financial_event(
        self,
        event_type: str,
        user_id: UUID,
        transaction_id: UUID,
        amount: float,
        metadata: Dict[str, Any] = None
    ):
        """Log all financial operations."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": str(user_id),
            "transaction_id": str(transaction_id),
            "amount": amount,
            "metadata": metadata or {}
        }

        logger.info(f"FINANCIAL EVENT: {event_type}", extra=log_entry)

        # Alert on large transactions
        if amount > 100000:
            logger.warning(f"Large transaction detected: ${amount}", extra=log_entry)

        if self.db:
            try:
                from app.models.domain import FinancialAuditLog
                financial_log = FinancialAuditLog(
                    event_type=event_type,
                    user_id=user_id,
                    transaction_id=transaction_id,
                    amount=amount,
                    metadata=metadata or {},
                    timestamp=datetime.utcnow()
                )
                self.db.add(financial_log)
                self.db.commit()
            except Exception as e:
                logger.error(f"Failed to write financial audit log to database: {e}")

    def log_event(
        self,
        event_type: str,
        user_id: Optional[UUID],
        metadata: Dict[str, Any] = None
    ):
        """Log general application events."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": str(user_id) if user_id else None,
            "metadata": metadata or {}
        }

        logger.info(f"EVENT: {event_type}", extra=log_entry)


# Global instance
audit_logger = AuditLogger()
