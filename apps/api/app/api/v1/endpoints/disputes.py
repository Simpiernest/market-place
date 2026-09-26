from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Any

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, Dispute, DisputeStatus, DealRoom, Transaction, UserRole
from app.services.audit_logger import AuditLogger

router = APIRouter()

@router.post("/", response_model=Any, status_code=status.HTTP_201_CREATED)
async def open_dispute(
    deal_id: UUID,
    reason: str,
    description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Open a formal dispute for an active deal."""
    deal = db.query(DealRoom).filter(DealRoom.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if current_user.id not in [deal.buyer_id, deal.seller_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    transaction = db.query(Transaction).filter(Transaction.offer_id == deal.offer_id).first()

    dispute = Dispute(
        deal_room_id=deal_id,
        transaction_id=transaction.id if transaction else None,
        creator_id=current_user.id,
        reason=reason,
        description=description,
        status=DisputeStatus.OPEN
    )
    db.add(dispute)

    # Audit Log
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="OPEN_DISPUTE",
        resource_type="DEAL",
        resource_id=deal_id,
        changes={"reason": reason}
    )

    db.commit()
    db.refresh(dispute)
    return dispute

@router.get("/my-disputes", response_model=List[Any])
async def get_my_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List disputes I am involved in."""
    return db.query(Dispute).filter(Dispute.creator_id == current_user.id).all()
