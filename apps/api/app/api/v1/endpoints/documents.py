"""Document management endpoints."""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.config import settings
from app.api import deps
from app.models.domain import User, Document, Listing, NDASignature, NDA, DataAccessRequest, DataAccessRequestStatus
from app.services.storage import storage_service
from app.api.auth_helpers import ResourceOwnershipValidator
from app.services.audit_logger import AuditLogger

router = APIRouter()


@router.get("/listings/{listing_id}", response_model=List[Any])
async def get_listing_documents(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List documents for a specific listing with permission checks."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Permission check for sensitive documents
    # 1. Is the user the seller?
    is_seller = listing.seller_id == current_user.id

    # 2. Has the user been approved for confidential access?
    has_approved_access = False
    access_request = db.query(DataAccessRequest).filter(
        DataAccessRequest.listing_id == listing_id,
        DataAccessRequest.buyer_id == current_user.id
    ).first()

    if access_request and access_request.status == DataAccessRequestStatus.APPROVED:
        has_approved_access = True

    # Filter documents based on permissions
    docs = db.query(Document).filter(Document.listing_id == listing_id).all()

    allowed_docs = []
    for doc in docs:
        if doc.is_public:
            allowed_docs.append(doc)
        elif is_seller:
            allowed_docs.append(doc)
        elif doc.requires_nda and has_approved_access:
            allowed_docs.append(doc)
        elif not doc.requires_nda: # Private but doesn't require NDA? (Maybe deal room only)
            # For now, if it's not public and requires NDA, buyer needs NDA
            # If it's private but doesn't require NDA, maybe it's deal-room specific.
            # We'll allow it if the buyer has an active offer/deal later.
            pass

    return allowed_docs


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Download a document (with authorization check)."""
    if not settings.ENABLE_DOCUMENTS:
        raise HTTPException(status_code=403, detail="Documents feature is disabled")

    # SECURITY FIX: Use comprehensive authorization validator
    doc = ResourceOwnershipValidator.validate_document_access(
        document_id, current_user, db
    )

    # Audit log document access for data room compliance
    audit_logger = AuditLogger(db)
    audit_logger.log_document_access(
        user=current_user,
        document_id=document_id,
        document_title=doc.title,
        listing_id=doc.listing_id
    )

    # Generate signed URL with short expiration (1 hour)
    bucket = settings.STORAGE_BUCKET_PRIVATE if not doc.is_public else settings.STORAGE_BUCKET_PUBLIC

    # SECURITY FIX: Use shorter expiration time for sensitive documents
    expiration_seconds = 3600 if not doc.is_public else 86400  # 1 hour private, 24 hours public
    signed_url = storage_service.generate_signed_url(bucket, doc.filename, expiration_seconds)

    if not signed_url:
         raise HTTPException(status_code=500, detail="Failed to generate download link")

    return {"download_url": signed_url, "expires_in": expiration_seconds}
