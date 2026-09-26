from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Dict
from uuid import UUID

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, UserRole
from app.services.broker import AIBrokerService
from app.services.ai import ai_provider
from app.utils.validation import InputValidator
from app.services.audit_logger import AuditLogger

router = APIRouter()


@router.get("/matches", response_model=List[Any])
async def get_facilitated_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Returns AI-facilitated matches for a buyer.
    This includes narratives and action items beyond simple matching scores.
    """
    broker = AIBrokerService(db)
    matches = await broker.generate_facilitated_matches(current_user.id)
    return matches


@router.post("/listings/{listing_id}/analyze")
async def analyze_listing_with_broker(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    The AI Broker provides a deep-dive analysis of a specific listing.
    SECURE: Validates that the user has permission to view the listing details.
    """
    # 1. Permission Check (re-using logic from get_listing)
    from app.api.v1.endpoints.marketplace import get_listing_by_slug
    from app.models.domain import Listing

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check authorization for private listings
    from app.models.domain import ListingVisibility, DataAccessRequest, DataAccessRequestStatus
    if listing.visibility != ListingVisibility.PUBLIC:
        is_owner = listing.seller_id == current_user.id
        has_approved_access = db.query(DataAccessRequest).filter(
            DataAccessRequest.listing_id == listing.id,
            DataAccessRequest.buyer_id == current_user.id,
            DataAccessRequest.status == DataAccessRequestStatus.APPROVED
        ).first() is not None

        if not (is_owner or has_approved_access):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Approved access required to run deep-scan on private listings"
            )

    broker = AIBrokerService(db)
    analysis = await broker.deep_scan_financials(listing_id)
    return analysis

@router.post("/chat")
async def chat_with_broker(
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Primary interface for the Business Bridge AI Broker.
    Handles Natural Language Search and acquisition advice.
    """
    # SECURITY FIX: Validate message length to prevent abuse
    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="Message too long (max 4000 characters)")

    # SECURITY FIX: Detect and sanitize prompt injection attempts
    if InputValidator.detect_prompt_injection(message):
        # Audit log the attempt
        audit_logger = AuditLogger(db)
        audit_logger.log_ai_interaction(
            user=current_user,
            interaction_type="PROMPT_INJECTION_ATTEMPT",
            prompt=message[:500],  # Store first 500 chars only
            model_name="ai_broker"
        )
        raise HTTPException(
            status_code=400,
            detail="Invalid input detected. Please rephrase your message."
        )

    # SECURITY FIX: Sanitize user input before sending to AI
    sanitized_message = InputValidator.sanitize_ai_input(message)

    # SECURITY FIX: Add system context to prevent jailbreak attempts
    system_message = {
        "role": "system",
        "content": "You are the Business Bridge AI Broker. You help users find and evaluate business acquisition opportunities. You ONLY provide advice about business acquisitions, financial analysis, and marketplace navigation. You do NOT execute actions, access external systems, or provide information outside your domain."
    }

    messages = [
        system_message,
        {"role": "user", "content": sanitized_message}
    ]

    response = await ai_provider.chat_completion(messages)

    # Audit log the AI interaction
    audit_logger = AuditLogger(db)
    audit_logger.log_ai_interaction(
        user=current_user,
        interaction_type="BROKER_CHAT",
        prompt=sanitized_message[:500],
        model_name="ai_broker"
    )

    # If structured search is returned, we hit the marketplace
    if "structured_search" in response:
        # Internal redirect or logic to return search results
        pass

    return response

@router.post("/listings/generate-draft")
async def generate_listing_draft(
    business_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Generates a high-conversion listing draft based on provided business metrics.
    """
    # SECURITY FIX: Sanitize all user-provided business data
    sanitized_data = {}
    for key, value in business_data.items():
        if isinstance(value, str):
            # Check for prompt injection in text fields
            if InputValidator.detect_prompt_injection(value):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid input detected in field '{key}'"
                )
            sanitized_data[key] = InputValidator.sanitize_ai_input(value)
        else:
            sanitized_data[key] = value

    # Audit log the AI generation request
    audit_logger = AuditLogger(db)
    audit_logger.log_ai_interaction(
        user=current_user,
        interaction_type="LISTING_GENERATION",
        prompt=str(sanitized_data)[:500],
        model_name="listing_generator"
    )

    # In production, this would use the AI provider with a specific prompt
    # Simulation for V4
    return {
        "title": f"Premium {sanitized_data.get('industry', 'Technology')} Acquisition",
        "summary": f"A scalable {sanitized_data.get('business_model', 'SaaS')} operation with proven profitability and established market presence.",
        "highlights": [
            "Consistent LTM revenue growth",
            "Highly automated operational workflows",
            "Diverse customer base with low churn",
            "Clean financial history and audit-ready data"
        ]
    }

@router.post("/listings/{listing_id}/fraud-audit")
async def run_fraud_audit(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    V2: AI-driven fraud detection for business listings.
    SECURE: Restricted to listing owner or platform admin.
    """
    from app.models.domain import Listing
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    user_roles = [r.role for r in current_user.roles]
    is_admin = UserRole.ADMIN in user_roles or UserRole.SUPER_ADMIN in user_roles
    is_owner = listing.seller_id == current_user.id

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing owner or administrator can run fraud audits"
        )

    broker = AIBrokerService(db)
    result = await broker.run_fraud_audit(listing_id)
    return result
