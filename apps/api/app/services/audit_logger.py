"""
Audit logging service for security-sensitive operations.
Tracks all administrative actions and sensitive operations.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from uuid import UUID
import json

from app.models.domain import AuditLog, User


class AuditLogger:
    """Service for logging security-sensitive operations."""

    def __init__(self, db: Session):
        self.db = db

    def log_action(
        self,
        user_id: Optional[UUID],
        actor_type: str,
        action: str,
        resource_type: str,
        resource_id: Optional[UUID] = None,
        changes: Optional[Dict[str, Any]] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        """
        Log a security-sensitive action.

        Args:
            user_id: User who performed the action
            actor_type: Type of actor (USER, ADMIN, SYSTEM, AI)
            action: Action performed (CREATE, UPDATE, DELETE, APPROVE, etc.)
            resource_type: Type of resource affected
            resource_id: ID of affected resource
            changes: Dictionary of changes made
            success: Whether the action succeeded
            error_message: Error message if failed
            ip_address: IP address of requester
            user_agent: User agent string
        """
        audit_log = AuditLog(
            user_id=user_id,
            actor_type=actor_type,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            changes=changes,
            success=success,
            error_message=error_message,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.utcnow()
        )

        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)

        return audit_log

    def log_admin_action(
        self,
        admin: User,
        action: str,
        resource_type: str,
        resource_id: Optional[UUID] = None,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Helper for logging admin actions."""
        return self.log_action(
            user_id=admin.id,
            actor_type="ADMIN",
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            changes=changes,
            ip_address=ip_address
        )

    def log_listing_approval(
        self,
        admin: User,
        listing_id: UUID,
        approved: bool,
        reason: Optional[str] = None
    ) -> AuditLog:
        """Log listing approval/rejection."""
        return self.log_admin_action(
            admin=admin,
            action="APPROVE_LISTING" if approved else "REJECT_LISTING",
            resource_type="LISTING",
            resource_id=listing_id,
            changes={"approved": approved, "reason": reason}
        )

    def log_transaction_milestone(
        self,
        user: User,
        transaction_id: UUID,
        milestone_id: UUID,
        milestone_title: str
    ) -> AuditLog:
        """Log transaction milestone completion."""
        return self.log_action(
            user_id=user.id,
            actor_type="USER",
            action="COMPLETE_MILESTONE",
            resource_type="TRANSACTION",
            resource_id=transaction_id,
            changes={"milestone_id": str(milestone_id), "milestone": milestone_title}
        )

    def log_payment_event(
        self,
        transaction_id: UUID,
        event_type: str,
        provider: str,
        amount: float,
        success: bool = True,
        error: Optional[str] = None
    ) -> AuditLog:
        """Log payment-related events."""
        return self.log_action(
            user_id=None,
            actor_type="SYSTEM",
            action=event_type,
            resource_type="PAYMENT",
            resource_id=transaction_id,
            changes={"provider": provider, "amount": amount},
            success=success,
            error_message=error
        )

    def log_payout_request(
        self,
        seller: User,
        amount: float,
        destination: str
    ) -> AuditLog:
        """Log payout request."""
        return self.log_action(
            user_id=seller.id,
            actor_type="USER",
            action="REQUEST_PAYOUT",
            resource_type="PAYOUT",
            changes={"amount": amount, "destination": destination}
        )

    def log_failed_login(
        self,
        email: str,
        ip_address: Optional[str] = None,
        reason: str = "Invalid credentials"
    ) -> AuditLog:
        """Log failed login attempt."""
        return self.log_action(
            user_id=None,
            actor_type="ANONYMOUS",
            action="LOGIN_FAILED",
            resource_type="AUTH",
            changes={"email": email, "reason": reason},
            success=False,
            ip_address=ip_address
        )

    def log_successful_login(
        self,
        user: User,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Log successful login."""
        return self.log_action(
            user_id=user.id,
            actor_type="USER",
            action="LOGIN_SUCCESS",
            resource_type="AUTH",
            ip_address=ip_address
        )

    def log_password_change(
        self,
        user: User,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Log password change."""
        return self.log_action(
            user_id=user.id,
            actor_type="USER",
            action="PASSWORD_CHANGED",
            resource_type="AUTH",
            ip_address=ip_address
        )

    def log_document_access(
        self,
        user: User,
        document_id: UUID,
        document_title: str,
        listing_id: Optional[UUID] = None
    ) -> AuditLog:
        """Log document access for data room audit trail."""
        return self.log_action(
            user_id=user.id,
            actor_type="USER",
            action="ACCESS_DOCUMENT",
            resource_type="DOCUMENT",
            resource_id=document_id,
            changes={"title": document_title, "listing_id": str(listing_id) if listing_id else None}
        )

    def log_ai_interaction(
        self,
        user: User,
        action: str,
        prompt: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        sensitive_data_accessed: bool = False
    ) -> AuditLog:
        """Log AI system interactions for security monitoring."""
        return self.log_action(
            user_id=user.id,
            actor_type="USER",
            action=f"AI_{action}",
            resource_type="AI_INTERACTION",
            resource_id=resource_id,
            changes={
                "prompt_length": len(prompt) if prompt else 0,
                "sensitive_data": sensitive_data_accessed
            }
        )
