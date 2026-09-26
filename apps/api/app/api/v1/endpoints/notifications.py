from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api import deps
from app.models.domain import User
from app.services.notifications import NotificationService

router = APIRouter()

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get user notifications."""
    service = NotificationService(db)
    notifications = service.get_user_notifications(current_user.id)
    return notifications

@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Mark notification as read."""
    service = NotificationService(db)
    success = service.mark_as_read(notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get unread notification count."""
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    return {"count": count}
