from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, BrokerProfile, ClientRepresentation, Listing
from app.schemas.broker import BrokerProfileRead, BrokerProfileCreate, ClientRepresentationRead

router = APIRouter()

@router.get("/me", response_model=BrokerProfileRead)
def get_my_broker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get the current user's broker profile."""
    profile = db.query(BrokerProfile).filter(BrokerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Broker profile not found")
    return profile

@router.post("/me", response_model=BrokerProfileRead)
def create_broker_profile(
    profile_in: BrokerProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Create or update broker profile."""
    profile = db.query(BrokerProfile).filter(BrokerProfile.user_id == current_user.id).first()
    if profile:
        # Update existing
        for field, value in profile_in.model_dump().items():
            setattr(profile, field, value)
    else:
        # Create new
        profile = BrokerProfile(
            **profile_in.model_dump(),
            user_id=current_user.id
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/clients", response_model=List[ClientRepresentationRead])
def get_my_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get all clients represented by this broker."""
    profile = db.query(BrokerProfile).filter(BrokerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Broker profile not found")

    reps = db.query(ClientRepresentation).filter(ClientRepresentation.broker_id == profile.id).all()

    # Hydrate for UI
    results = []
    for rep in reps:
        listing = db.query(Listing).filter(Listing.id == rep.listing_id).first() if rep.listing_id else None
        results.append({
            **rep.__dict__,
            "client_name": rep.client.full_name,
            "listing_title": listing.title if listing else "Direct Client"
        })

    return results

@router.post("/clients/request")
def request_client_representation(
    client_email: str,
    role: str = "SELLER_REP",
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Broker requests to represent a client."""
    profile = db.query(BrokerProfile).filter(BrokerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=403, detail="Only registered brokers can request representation")

    client = db.query(User).filter(User.email == client_email).first()
    if not client:
        raise HTTPException(status_code=404, detail="User not found")

    rep = ClientRepresentation(
        broker_id=profile.id,
        client_id=client.id,
        role=role,
        status="PENDING"
    )
    db.add(rep)
    db.commit()
    return {"status": "success", "message": "Representation request sent"}
