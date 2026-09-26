from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, VerificationCase, VerificationDocument, VerificationStatus
from app.schemas.verification import VerificationCaseRead, VerificationCaseCreate
from app.services.storage import storage_service

router = APIRouter()

@router.get("/", response_model=List[VerificationCaseRead])
def get_my_verification_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get all verification cases for the current user."""
    return db.query(VerificationCase).filter(VerificationCase.user_id == current_user.id).all()

@router.post("/cases", response_model=VerificationCaseRead)
def submit_verification(
    case_in: VerificationCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Submit a new verification request."""
    # Check if a pending case of this type already exists
    existing = db.query(VerificationCase).filter(
        VerificationCase.user_id == current_user.id,
        VerificationCase.verification_type == case_in.verification_type,
        VerificationCase.status.in_([VerificationStatus.IN_PROGRESS, VerificationStatus.UNDER_REVIEW])
    ).first()

    if existing:
        return existing

    case = VerificationCase(
        **case_in.model_dump(),
        user_id=current_user.id
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # Audit log the submission
    from app.services.audit_logger import AuditLogger
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="SUBMIT_VERIFICATION",
        resource_type="VERIFICATION_CASE",
        resource_id=case.id,
        changes={"type": case.verification_type}
    )

    return case

@router.get("/{verification_id}", response_model=VerificationCaseRead)
def get_verification_status(
    verification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get status of a specific verification case."""
    case = db.query(VerificationCase).filter(VerificationCase.id == verification_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Verification case not found")

    if case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return case

@router.post("/{verification_id}/documents")
async def upload_verification_document(
    verification_id: UUID,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Upload a supporting document for a verification case."""
    case = db.query(VerificationCase).filter(VerificationCase.id == verification_id).first()
    if not case or case.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Verification case not found")

    content = await file.read()
    file_path = f"verifications/{verification_id}/{file.filename}"

    # Upload to storage
    file_url = storage_service.upload_file(
        bucket="private",
        path=file_path,
        file_content=content,
        content_type=file.content_type
    )

    if not file_url:
        # For demo purposes, if storage is not configured, we'll use a mock URL
        file_url = f"https://mock-storage.com/{file_path}"

    doc = VerificationDocument(
        verification_case_id=verification_id,
        document_type=document_type,
        file_url=file_url,
        filename=file.filename
    )
    db.add(doc)

    # Automatically move case to UNDER_REVIEW
    case.status = VerificationStatus.UNDER_REVIEW

    db.commit()
    return {"status": "success", "file_url": file_url}
