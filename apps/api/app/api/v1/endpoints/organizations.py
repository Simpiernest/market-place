"""Institutional organization management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from app.core.database import get_db
from app.api import deps
from app.models.domain import User, Organization, OrganizationMember, OrganizationRole

router = APIRouter()


@router.get("/", response_model=List[Any])
async def get_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all organizations (admin) or user's organizations."""
    from app.models.domain import UserRole
    user_roles = [r.role for r in current_user.roles]
    if UserRole.ADMIN in user_roles or UserRole.SUPER_ADMIN in user_roles:
        return db.query(Organization).all()

    return db.query(Organization).join(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).all()


@router.post("/", response_model=Any, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: Any, # Should use schema
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Create a new institutional organization."""
    # Simplified creation
    org = Organization(
        name=org_in.name,
        slug=org_in.name.lower().replace(" ", "-"),
    )
    db.add(org)
    db.flush()

    # Add creator as Owner
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role=OrganizationRole.OWNER
    )
    db.add(member)
    db.commit()
    db.refresh(org)
    return org


@router.get("/{org_id}/members", response_model=List[Any])
async def get_organization_members(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List members of an organization (requires membership)."""
    # Check if user is member
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")

    return db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id
    ).all()


@router.get("/me/stats")
async def get_my_org_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Aggregate stats for the user's primary organization."""
    org_member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()

    if not org_member:
        return {
            "aum": 0,
            "active_deals": 0,
            "team_size": 1,
            "markets": 0
        }

    org_id = org_member.organization_id
    team_count = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id
    ).count()

    return {
        "aum": 12400000.0, # Placeholder until Phase 25
        "active_deals": 8,
        "team_size": team_count,
        "markets": 4
    }
