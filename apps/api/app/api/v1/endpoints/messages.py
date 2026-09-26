from typing import Any, List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Conversation, Message, ConversationParticipant
from app.schemas.message import MessageRead, MessageCreate, ConversationRead
from app.api import deps
from app.models.domain import User, Listing, Conversation, Message, ConversationParticipant
from app.services.notifications import NotificationService

router = APIRouter()


@router.get("/conversations", response_model=List[ConversationRead])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all conversations for the current user."""
    conversations = (
        db.query(Conversation)
        .join(ConversationParticipant)
        .filter(ConversationParticipant.user_id == current_user.id)
        .order_by(Conversation.last_message_at.desc())
        .all()
    )

    result = []
    for conv in conversations:
        read = ConversationRead.model_validate(conv)

        # Find the other participant
        other = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conv.id,
            ConversationParticipant.user_id != current_user.id
        ).first()

        if other:
            read.participant_name = other.user.full_name
            read.participant_id = other.user.id
            read.participant_role = other.user.roles[0].role.value if other.user.roles else "USER"

        # Last message
        last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
        if last_msg:
            read.last_message_content = last_msg.content

        # Listing title
        if conv.listing_id:
            listing = db.query(Listing).filter(Listing.id == conv.listing_id).first()
            if listing:
                read.listing_title = listing.title

        result.append(read)

    return result


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageRead])
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get all messages in a conversation."""
    # Check if user is a participant
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id
    ).first()

    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )


@router.post("/conversations", response_model=ConversationRead)
def create_conversation(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Start a new conversation regarding a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check if conversation already exists
    existing = db.query(Conversation).join(ConversationParticipant).filter(
        Conversation.listing_id == listing_id,
        ConversationParticipant.user_id == current_user.id
    ).first()

    if existing:
        return existing

    conversation = Conversation(listing_id=listing_id, subject=f"Inquiry: {listing.title}")
    db.add(conversation)
    db.flush()

    # Add participants
    buyer = ConversationParticipant(conversation_id=conversation.id, user_id=current_user.id)
    seller = ConversationParticipant(conversation_id=conversation.id, user_id=listing.seller_id)
    db.add_all([buyer, seller])

    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/conversations/{conversation_id}/poll")
def poll_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Poll for new messages in a conversation (for real-time updates)."""
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id
    ).first()
    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant")
    latest = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).first()
    return {"last_message_at": latest.created_at if latest else None, "new_message": False}


@router.post("/messages", response_model=MessageRead)
def send_message(
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Send a message in a conversation."""
    # Check if user is a participant
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == message_in.conversation_id,
        ConversationParticipant.user_id == current_user.id
    ).first()

    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    message = Message(
        **message_in.model_dump(),
        sender_id=current_user.id
    )
    db.add(message)

    # Update conversation last_message_at
    conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()
    if conversation:
        conversation.last_message_at = datetime.utcnow()

        # Notify other participants
        notification_service = NotificationService(db)
        other_participants = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conversation.id,
            ConversationParticipant.user_id != current_user.id
        ).all()

        for p in other_participants:
            notification_service.create_notification(
                user_id=p.user_id,
                type="NEW_MESSAGE",
                title="New Message",
                content=f"{current_user.full_name} sent you a message regarding {conversation.subject}.",
                link=f"/dashboard/messages?id={conversation.id}",
                metadata={"conversation_id": str(conversation.id)}
            )

    db.commit()
    db.refresh(message)
    return message
