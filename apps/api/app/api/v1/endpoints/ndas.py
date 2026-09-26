"""NDA and Data Access management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.api import deps
from app.models.domain import (
    User, Listing, NDA, NDASignature,
    DataAccessRequest, DataAccessRequestStatus, UserRole, AuditLog
)
from app.schemas.nda import (
    NDARead, NDASignatureCreate, NDASignatureRead,
    DataAccessRequestRead, DataAccessRequestUpdate, DataAccessRequestDetail
)
from app.services.notifications import NotificationService
from app.services.audit_logger import AuditLogger
from app.services.access_control import AccessControlService

router = APIRouter()


@router.get("/listing/{listing_id}", response_model=dict)
async def get_listing_nda_status(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get the NDA content and access request status for a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    access_request = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing_id,
        DataAccessRequest.buyer_id == current_user.id
    ).first()

    nda = listing.nda
    if not nda:
        # If no NDA is defined for the listing, create a default one or return error
        # In a real app, every listing might have a default NDA template.
        raise HTTPException(status_code=404, detail="NDA template not found for this listing")

    return {
        "nda": NDARead.model_validate(nda),
        "request_status": access_request.status if access_request else None,
        "request_id": access_request.id if access_request else None,
        "is_signed": access_request is not None and access_request.nda_signature_id is not None
    }


@router.post("/request-access/{listing_id}", response_model=DataAccessRequestRead)
async def request_data_access(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Step 1: Buyer requests access to sensitive info."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing_id,
        DataAccessRequest.buyer_id == current_user.id
    ).first()

    if existing:
        return existing

    # Check unlock limits
    access_service = AccessControlService(db)
    if not access_service.track_unlock(current_user.id, listing_id):
        raise HTTPException(status_code=403, detail="Monthly confidential unlock limit reached.")

    request = DataAccessRequest(
        listing_id=listing_id,
        buyer_id=current_user.id,
        status=DataAccessRequestStatus.PENDING_NDA
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.post("/listing/{listing_id}/sign", response_model=DataAccessRequestRead)
async def sign_listing_nda(
    listing_id: UUID,
    signature_in: NDASignatureCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Step 2: Buyer signs the NDA and submits for seller review."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if not listing.nda:
        raise HTTPException(status_code=400, detail="No NDA required for this listing")

    access_request = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing_id,
        DataAccessRequest.buyer_id == current_user.id
    ).first()

    if not access_request:
        access_request = DataAccessRequest(
            listing_id=listing_id,
            buyer_id=current_user.id,
            status=DataAccessRequestStatus.PENDING_NDA
        )
        db.add(access_request)
        db.flush()

    # Create signature
    signature = NDASignature(
        nda_id=listing.nda.id,
        user_id=current_user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        **signature_in.model_dump()
    )
    db.add(signature)
    db.flush()

    # Update request
    access_request.nda_signature_id = signature.id
    access_request.status = DataAccessRequestStatus.PENDING_SELLER_REVIEW

    db.commit()
    db.refresh(access_request)

    # Audit log the signature
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="SIGN_NDA",
        resource_type="NDA",
        resource_id=listing.nda.id,
        changes={"listing_id": str(listing.id), "signer": signature_in.full_legal_name}
    )

    # Notify Seller
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=listing.seller_id,
        type="NDA_SIGNED",
        title="New Confidential Access Request",
        content=f"{current_user.full_name} has signed the NDA for {listing.title} and is awaiting your review.",
        link=f"/dashboard/seller/access-requests/{access_request.id}"
    )

    return access_request


@router.get("/seller/requests", response_model=List[DataAccessRequestDetail])
async def get_seller_access_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Seller Dashboard: List all requests for my businesses."""
    requests = db.query(DataAccessRequest).join(Listing).filter(
        Listing.seller_id == current_user.id
    ).all()

    result = []
    for r in requests:
        detail = DataAccessRequestDetail.model_validate(r)
        detail.buyer_name = r.buyer.full_name
        detail.buyer_company = r.buyer.buyer_profile.company if r.buyer.buyer_profile else None

        # Hydrate verification status
        if r.buyer.buyer_profile:
            detail.buyer_verification_status = "VERIFIED" if r.buyer.buyer_profile.identity_verified else "PENDING"
            detail.buyer_tier = r.buyer.buyer_profile.tier.value

            # Check for POF specifically
            from app.models.domain import UserVerification, VerificationCategory, VerificationStatus
            pof = db.query(UserVerification).filter(
                UserVerification.user_id == r.buyer_id,
                UserVerification.category == VerificationCategory.PROOF_OF_FUNDS,
                UserVerification.status == VerificationStatus.VERIFIED
            ).first()
            detail.buyer_proof_of_funds = "VERIFIED" if pof else "PENDING"

        detail.listing_title = r.listing.title
        result.append(detail)

    return result


@router.get("/requests/{request_id}", response_model=DataAccessRequestDetail)
async def get_access_request_detail(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Seller/Buyer Detail View: See full request info including signature."""
    r = db.query(DataAccessRequest).filter(DataAccessRequest.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")

    # Access control: only buyer or seller of the listing
    if r.buyer_id != current_user.id and r.listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    detail = DataAccessRequestDetail.model_validate(r)
    detail.buyer_name = r.buyer.full_name
    detail.buyer_company = r.buyer.buyer_profile.company if r.buyer.buyer_profile else None

    if r.buyer.buyer_profile:
        detail.buyer_verification_status = "VERIFIED" if r.buyer.buyer_profile.identity_verified else "PENDING"
        detail.buyer_tier = r.buyer.buyer_profile.tier.value

        from app.models.domain import UserVerification, VerificationCategory, VerificationStatus
        pof = db.query(UserVerification).filter(
            UserVerification.user_id == r.buyer_id,
            UserVerification.category == VerificationCategory.PROOF_OF_FUNDS,
            UserVerification.status == VerificationStatus.VERIFIED
        ).first()
        detail.buyer_proof_of_funds = "VERIFIED" if pof else "PENDING"

    detail.listing_title = r.listing.title
    if r.signature:
        detail.signature = NDASignatureRead.model_validate(r.signature)

    return detail


@router.patch("/requests/{request_id}", response_model=DataAccessRequestRead)
async def update_access_request_status(
    request_id: UUID,
    update_in: DataAccessRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Seller Decision: Approve or Reject a request."""
    r = db.query(DataAccessRequest).filter(DataAccessRequest.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")

    if r.listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can review requests")

    if update_in.status not in [DataAccessRequestStatus.APPROVED, DataAccessRequestStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid status transition")

    r.status = update_in.status
    r.rejection_reason = update_in.rejection_reason
    r.reviewed_at = datetime.utcnow()
    r.reviewed_by_id = current_user.id

    db.commit()
    db.refresh(r)

    # Audit log the decision
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="VET_ACCESS_REQUEST",
        resource_type="DATA_ACCESS_REQUEST",
        resource_id=request_id,
        changes={"status": update_in.status, "reason": update_in.rejection_reason}
    )

    # Notify Buyer
    notification_service = NotificationService(db)
    if r.status == DataAccessRequestStatus.APPROVED:
        notification_service.create_notification(
            user_id=r.buyer_id,
            type="ACCESS_APPROVED",
            title="Confidential Access Approved",
            content=f"Your request to access confidential info for {r.listing.title} has been approved.",
            link=f"/marketplace/businesses/{r.listing.slug}" # Link back to listing which should now be unlocked
        )
    else:
        notification_service.create_notification(
            user_id=r.buyer_id,
            type="ACCESS_REJECTED",
            title="Access Request Declined",
            content=f"The seller has declined your request for {r.listing.title}. Reason: {r.rejection_reason or 'No reason provided.'}",
            link=f"/marketplace/businesses/{r.listing.slug}"
        )

    return r
