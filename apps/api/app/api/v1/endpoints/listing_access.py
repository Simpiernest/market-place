from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.domain import Listing, ListingAccess, User, AccessGroup, AccessGroupMember
from app.schemas.listing_access import (
    ListingAccessCreate,
    ListingAccessRead,
    AccessGroupCreate,
    AccessGroupRead
)

router = APIRouter()

@router.post("/grant", response_model=ListingAccessRead)
def grant_listing_access(
    access_in: ListingAccessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Grant access to a private listing."""
    listing = db.query(Listing).filter(Listing.id == access_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can grant access")

    access = ListingAccess(
        **access_in.model_dump(),
        granted_by_id=current_user.id
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return access

@router.delete("/{access_id}")
def revoke_listing_access(
    access_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Revoke access to a private listing."""
    access = db.query(ListingAccess).filter(ListingAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Access record not found")

    listing = db.query(Listing).filter(Listing.id == access.listing_id).first()
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can revoke access")

    db.delete(access)
    db.commit()
    return {"status": "success"}

@router.post("/groups", response_model=AccessGroupRead)
def create_access_group(
    group_in: AccessGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Create a new access group."""
    group = AccessGroup(
        **group_in.model_dump(),
        owner_id=current_user.id
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

@router.post("/groups/{group_id}/members/{user_id}")
def add_group_member(
    group_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Add a member to an access group."""
    group = db.query(AccessGroup).filter(AccessGroup.id == group_id).first()
    if not group or group.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    member = AccessGroupMember(group_id=group_id, user_id=user_id)
    db.add(member)
    db.commit()
    return {"status": "success"}
