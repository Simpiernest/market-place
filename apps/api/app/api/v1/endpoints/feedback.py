"""Structured feedback after listing unlock."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, DataAccessRequest, DataAccessRequestStatus, AuditLog

router = APIRouter()

@router.post("/listing/{listing_id}/rejection-feedback")
async def submit_unlock_feedback(
    listing_id: UUID,
    feedback: dict, # { "reason": "valuation_too_high", "notes": "..." }
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Allow buyer to provide feedback if they pass after unlocking confidential info."""
    request = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing_id,
        DataAccessRequest.buyer_id == current_user.id,
        DataAccessRequest.status == DataAccessRequestStatus.APPROVED
    ).first()

    if not request:
        raise HTTPException(status_code=400, detail="Only approved buyers can provide feedback on confidential data")

    # Audit log the feedback (making it immutable and searchable for seller intel)
    from app.services.audit_logger import AuditLogger
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="SUBMIT_UNLOCK_FEEDBACK",
        resource_type="LISTING",
        resource_id=listing_id,
        changes=feedback
    )

    return {"status": "success", "message": "Feedback submitted. Thank you for helping improve the marketplace."}
