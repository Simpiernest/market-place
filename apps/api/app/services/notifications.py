from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.domain import Notification
import json

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        user_id: UUID,
        type: str,
        title: str,
        content: str,
        link: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """Creates a new in-app notification for a user."""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            content=content,
            link=link,
            metadata_json=metadata if metadata else {}
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_user_notifications(self, user_id: UUID, limit: int = 20) -> List[Notification]:
        """Fetches latest notifications for a user."""
        return self.db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(limit)\
            .all()

    def mark_as_read(self, notification_id: UUID, user_id: UUID) -> bool:
        """Marks a specific notification as read."""
        notification = self.db.query(Notification)\
            .filter(Notification.id == notification_id, Notification.user_id == user_id)\
            .first()
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        return False

    def get_unread_count(self, user_id: UUID) -> int:
        """Returns the number of unread notifications for a user."""
        return self.db.query(Notification)\
            .filter(Notification.user_id == user_id, Notification.is_read == False)\
            .count()
