"""
Additional domain models for security features.
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4

from app.core.database import Base


class RefundAgreement(Base):
    """Track mutual refund agreements between parties."""
    __tablename__ = "refund_agreements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    buyer_agreed = Column(Boolean, default=False)
    seller_agreed = Column(Boolean, default=False)
    buyer_agreed_at = Column(DateTime, nullable=True)
    seller_agreed_at = Column(DateTime, nullable=True)
    reason = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Dispute(Base):
    """Track transaction disputes."""
    __tablename__ = "disputes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String, default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    reason = Column(Text, nullable=False)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    """General audit logging."""
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    severity = Column(String, default="INFO")  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    ip_address = Column(String)
    user_agent = Column(String)
    metadata = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class FinancialAuditLog(Base):
    """Audit logging for financial operations."""
    __tablename__ = "financial_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    metadata = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class WebhookEvent(Base):
    """Stores processed webhook events to prevent replay attacks."""
    __tablename__ = "webhook_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    provider = Column(String(50), nullable=False) # stripe, paystack
    provider_event_id = Column(String(255), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    payload_preview = Column(Text, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("provider", "provider_event_id", name="uq_webhook_provider_event"),
    )
