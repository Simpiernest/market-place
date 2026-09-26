"""Deal Room and Transaction migration management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.api import deps
from app.models.domain import (
    User, Listing, DealRoom, DealMilestone, AssetTransfer,
    DealStatus, DealMilestoneStatus, Offer, OfferStatus
)
from app.services.notifications import NotificationService

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_my_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List all active deals for the current user (buyer or seller)."""
    deals = db.query(DealRoom).filter(
        (DealRoom.buyer_id == current_user.id) | (DealRoom.seller_id == current_user.id)
    ).all()

    return [
        {
            "id": d.id,
            "listing_title": d.listing.title,
            "status": d.status,
            "role": "seller" if d.seller_id == current_user.id else "buyer",
            "partner_name": d.buyer.full_name if d.seller_id == current_user.id else d.seller.full_name,
            "updated_at": d.updated_at
        } for d in deals
    ]

@router.get("/{deal_id}", response_model=dict)
async def get_deal_detail(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get full details for a deal room."""
    deal = db.query(DealRoom).filter(DealRoom.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if current_user.id not in [deal.buyer_id, deal.seller_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": deal.id,
        "status": deal.status,
        "listing": {
            "id": deal.listing_id,
            "title": deal.listing.title,
            "asking_price": float(deal.listing.asking_price)
        },
        "buyer": {"id": deal.buyer_id, "name": deal.buyer.full_name},
        "seller": {"id": deal.seller_id, "name": deal.seller.full_name},
        "offer": {
            "amount": float(deal.offer.amount),
            "currency": deal.offer.currency
        },
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "status": m.status,
                "due_date": m.due_date,
                "completed_at": m.completed_at
            } for m in deal.milestones
        ],
        "asset_transfers": [
            {
                "id": t.id,
                "asset_type": t.asset_type,
                "asset_name": t.asset_name,
                "status": t.status,
                "completed_at": t.completed_at
            } for t in deal.asset_transfers
        ]
    }

@router.post("/{deal_id}/milestones/{milestone_id}/complete")
async def complete_milestone(
    deal_id: UUID,
    milestone_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Mark a deal milestone as completed."""
    milestone = db.query(DealMilestone).filter(
        DealMilestone.id == milestone_id,
        DealMilestone.deal_room_id == deal_id
    ).first()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    # In a real app, we'd check if the user is authorized to complete THIS specific milestone
    # e.g. only buyer can complete "Escrow Funding"

    milestone.status = DealMilestoneStatus.COMPLETED
    milestone.completed_at = datetime.utcnow()

    # Check if all milestones are done to advance deal status
    # ... logic here ...

    db.commit()
    return {"status": "success"}

@router.post("/initialize/{offer_id}")
async def initialize_deal_room(
    offer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Initialize a Deal Room after an offer is accepted."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer or offer.status != OfferStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Offer must be accepted to start a deal")

    # Check if deal room already exists
    existing = db.query(DealRoom).filter(DealRoom.offer_id == offer_id).first()
    if existing:
        return {"deal_id": existing.id}

    deal = DealRoom(
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        seller_id=offer.seller_id,
        offer_id=offer.id,
        status=DealStatus.INITIATED
    )
    db.add(deal)
    db.flush()

    # Create default milestones
    milestones = [
        "Purchase Agreement Signature",
        "Escrow Funding",
        "Asset Transfer",
        "Inspection Period",
        "Closing & Fund Release"
    ]
    for m_title in milestones:
        db.add(DealMilestone(deal_room_id=deal.id, title=m_title, status=DealMilestoneStatus.PENDING))

    # Create default asset transfers based on listing
    assets = ["Primary Domain", "Source Code Repository", "Customer Database"]
    for asset in assets:
        db.add(AssetTransfer(
            deal_room_id=deal.id,
            asset_type="DOMAIN" if "Domain" in asset else "CODE" if "Repo" in asset else "DATABASE",
            asset_name=asset,
            status="PENDING"
        ))

    db.commit()

    # Notify partner
    notification_service = NotificationService(db)
    notification_service.create_notification(
        user_id=offer.buyer_id if current_user.id == offer.seller_id else offer.seller_id,
        type="DEAL_INITIATED",
        title="Deal Room Opened",
        content=f"A new deal room has been opened for {offer.listing.title}. Please review the steps to closing.",
        link=f"/dashboard/deals/{deal.id}"
    )

    return {"deal_id": deal.id}

@router.get("/{deal_id}/transfers", response_model=List[dict])
async def get_deal_transfers(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all asset transfers for a deal."""
    transfers = db.query(AssetTransfer).filter(AssetTransfer.deal_room_id == deal_id).all()
    return [
        {
            "id": str(t.id),
            "asset_type": t.asset_type,
            "asset_name": t.asset_name,
            "status": t.status,
            "completed_at": t.completed_at
        } for t in transfers
    ]

@router.post("/{deal_id}/transfers", response_model=dict)
async def add_deal_transfer(
    deal_id: UUID,
    transfer_in: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Add a new asset transfer task (Seller only)."""
    deal = db.query(DealRoom).filter(DealRoom.id == deal_id).first()
    if not deal or deal.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can manage transfers")

    t = AssetTransfer(
        deal_room_id=deal_id,
        asset_type=transfer_in["asset_type"],
        asset_name=transfer_in["asset_name"],
        status="PENDING"
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return {
        "id": str(t.id),
        "asset_type": t.asset_type,
        "asset_name": t.asset_name,
        "status": t.status
    }

@router.post("/transfers/{transfer_id}/verify", response_model=dict)
async def verify_transfer(
    transfer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Verify an asset transfer (Buyer only)."""
    t = db.query(AssetTransfer).filter(AssetTransfer.id == transfer_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transfer not found")

    deal = db.query(DealRoom).filter(DealRoom.id == t.deal_room_id).first()
    if deal.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can verify transfers")

    t.status = "COMPLETED"
    t.completed_at = datetime.utcnow()
    db.commit()
    return {"status": "success"}
