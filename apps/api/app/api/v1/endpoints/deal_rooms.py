from typing import Any, List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import DealRoom, DealMilestone, AssetTransfer, DealMilestoneStatus, AuditLog
from app.schemas.deal_room import DealRoomRead, MilestoneCreate, MilestoneRead, AssetTransferCreate, AssetTransferRead
from app.api import deps
from app.models.domain import User
from app.services.notifications import NotificationService
from app.services.audit_logger import AuditLogger

router = APIRouter()


@router.get("/", response_model=List[DealRoomRead])
def get_my_deal_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all deal rooms where the current user is buyer or seller."""
    return db.query(DealRoom).filter(
        (DealRoom.buyer_id == current_user.id) | (DealRoom.seller_id == current_user.id)
    ).order_by(DealRoom.created_at.desc()).all()


@router.get("/{deal_room_id}", response_model=DealRoomRead)
def get_deal_room(
    deal_room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get a specific deal room."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this deal room")

    return deal_room


@router.post("/{deal_room_id}/milestones", response_model=MilestoneRead, status_code=201)
def create_milestone(
    deal_room_id: UUID,
    milestone_in: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Create a milestone in a deal room."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    milestone = DealMilestone(
        **milestone_in.model_dump(),
        deal_room_id=deal_room_id,
        status=DealMilestoneStatus.PENDING
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    # Notify other party
    other_user_id = deal_room.seller_id if current_user.id == deal_room.buyer_id else deal_room.buyer_id
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=other_user_id,
        type="MILESTONE_CREATED",
        title="New Milestone Added",
        content=f"A new milestone was added: {milestone.title}",
        link=f"/dashboard/deal-rooms/{deal_room_id}",
        metadata={"deal_room_id": str(deal_room_id), "milestone_id": str(milestone.id)}
    )

    return milestone


@router.get("/{deal_room_id}/milestones", response_model=List[MilestoneRead])
def get_milestones(
    deal_room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all milestones for a deal room."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(DealMilestone).filter(DealMilestone.deal_room_id == deal_room_id).order_by(DealMilestone.created_at).all()


@router.patch("/milestones/{milestone_id}/complete", response_model=MilestoneRead)
def complete_milestone(
    milestone_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark a milestone as completed."""
    milestone = db.query(DealMilestone).filter(DealMilestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    deal_room = db.query(DealRoom).filter(DealRoom.id == milestone.deal_room_id).first()
    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    milestone.status = DealMilestoneStatus.COMPLETED
    milestone.completed_at = datetime.utcnow()

    # Audit log the completion
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="COMPLETE_MILESTONE",
        resource_type="DEAL_MILESTONE",
        resource_id=milestone_id,
        changes={"title": milestone.title, "deal_id": str(deal_room.id)}
    )

    db.commit()
    db.refresh(milestone)

    # Notify other party
    other_user_id = deal_room.seller_id if current_user.id == deal_room.buyer_id else deal_room.buyer_id
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=other_user_id,
        type="MILESTONE_COMPLETED",
        title="Milestone Completed",
        content=f"Milestone completed: {milestone.title}",
        link=f"/dashboard/deal-rooms/{deal_room.id}",
        metadata={"deal_room_id": str(deal_room.id), "milestone_id": str(milestone.id)}
    )

    return milestone


@router.post("/{deal_room_id}/asset-transfers", response_model=AssetTransferRead, status_code=201)
def create_asset_transfer(
    deal_room_id: UUID,
    transfer_in: AssetTransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Create an asset transfer task in a deal room."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only seller can initiate asset transfers")

    transfer = AssetTransfer(
        **transfer_in.model_dump(),
        deal_room_id=deal_room_id,
        status="PENDING"
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    # Notify buyer
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=deal_room.buyer_id,
        type="ASSET_TRANSFER_INITIATED",
        title="Asset Transfer Initiated",
        content=f"Asset transfer started: {transfer.asset_name} ({transfer.asset_type})",
        link=f"/dashboard/deal-rooms/{deal_room_id}",
        metadata={"deal_room_id": str(deal_room_id), "transfer_id": str(transfer.id)}
    )

    return transfer


@router.get("/{deal_room_id}/asset-transfers", response_model=List[AssetTransferRead])
def get_asset_transfers(
    deal_room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all asset transfers for a deal room."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(AssetTransfer).filter(AssetTransfer.deal_room_id == deal_room_id).order_by(AssetTransfer.created_at).all()


@router.patch("/asset-transfers/{transfer_id}/verify", response_model=AssetTransferRead)
def verify_asset_transfer(
    transfer_id: UUID,
    evidence_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Verify an asset transfer (buyer action)."""
    transfer = db.query(AssetTransfer).filter(AssetTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Asset transfer not found")

    deal_room = db.query(DealRoom).filter(DealRoom.id == transfer.deal_room_id).first()
    if deal_room.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can verify asset transfers")

    transfer.status = "COMPLETED"
    transfer.completed_at = datetime.utcnow()
    if evidence_url:
        transfer.evidence_url = evidence_url

    # Audit log the verification
    audit_logger = AuditLogger(db)
    audit_logger.log_action(
        user_id=current_user.id,
        actor_type="USER",
        action="VERIFY_ASSET_TRANSFER",
        resource_type="ASSET_TRANSFER",
        resource_id=transfer_id,
        changes={"asset_name": transfer.asset_name, "deal_id": str(deal_room.id), "evidence": evidence_url}
    )

    db.commit()
    db.refresh(transfer)

    # Notify seller
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=deal_room.seller_id,
        type="ASSET_TRANSFER_VERIFIED",
        title="Asset Transfer Verified",
        content=f"Asset transfer verified: {transfer.asset_name}",
        link=f"/dashboard/deal-rooms/{deal_room.id}",
        metadata={"deal_room_id": str(deal_room.id), "transfer_id": str(transfer.id)}
    )

    return transfer


@router.patch("/{deal_room_id}/close")
def close_deal_room(
    deal_room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Close a deal room (both parties must agree)."""
    deal_room = db.query(DealRoom).filter(DealRoom.id == deal_room_id).first()
    if not deal_room:
        raise HTTPException(status_code=404, detail="Deal room not found")

    if deal_room.buyer_id != current_user.id and deal_room.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if all milestones and transfers are completed
    pending_milestones = db.query(DealMilestone).filter(
        DealMilestone.deal_room_id == deal_room_id,
        DealMilestone.status != DealMilestoneStatus.COMPLETED
    ).count()

    pending_transfers = db.query(AssetTransfer).filter(
        AssetTransfer.deal_room_id == deal_room_id,
        AssetTransfer.status != "COMPLETED"
    ).count()

    if pending_milestones > 0 or pending_transfers > 0:
        raise HTTPException(status_code=400, detail="Cannot close: pending milestones or transfers remain")

    deal_room.status = "closed"
    db.commit()

    return {"message": "Deal room closed successfully"}
