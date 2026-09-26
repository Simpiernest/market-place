"""User management endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()


@router.get("/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID."""
    return {"message": f"Get user {user_id} - to be implemented"}


@router.put("/{user_id}")
async def update_user(user_id: str, db: Session = Depends(get_db)):
    """Update user profile."""
    return {"message": f"Update user {user_id} - to be implemented"}


@router.get("/{user_id}/profile")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Get user profile."""
    return {"message": f"Get user profile {user_id} - to be implemented"}
