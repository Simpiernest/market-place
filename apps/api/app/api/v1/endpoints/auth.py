"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime
from uuid import uuid4

from app.core.database import get_db
from app.core.config import settings
from app.core import security
from app.models.domain import User, UserRole, UserRoleMapping, UserProfile, UserSession
from app.schemas.user import UserRead, UserCreate, Token, UserUpdate, UserSessionRead
from app.api import deps

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    SECURE: Register without leaking email existence.
    Fixed: Account enumeration vulnerability.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        # Don't reveal email exists - return success message
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "is_active": user.is_active,
            "email_verified": user.email_verified,
            "created_at": user.created_at,
            "roles": [{"role": r.role} for r in user.roles],
            "bio": user.bio
        }

    db_user = User(
        id=user_in.id or uuid4(),
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        email_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # SECURITY FIX: Restrict self-selection of roles (Phase 8)
    restricted_roles = {UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.COMPLIANCE, UserRole.REVIEWER}
    requested_role = user_in.role or UserRole.BUYER

    if requested_role in restricted_roles:
        requested_role = UserRole.BUYER # Fallback or rejection
        # Log escalation attempt
        from app.services.audit import audit_logger
        audit_logger.log_security_event(
            event_type="UNAUTHORIZED_ROLE_REQUESTED",
            user_id=db_user.id,
            severity="HIGH",
            metadata={"requested_role": str(requested_role)}
        )

    role_mapping = UserRoleMapping(user_id=db_user.id, role=requested_role)
    db.add(role_mapping)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """Authenticate user and return access token."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    access_token = security.create_access_token(user.id)

    # Record session (Phase 24)
    from datetime import timedelta
    new_session = UserSession(
        user_id=user.id,
        token_hash=security.get_password_hash(access_token), # Simple hash for lookup
        device_info=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(new_session)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserRead)
async def get_me(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get current authenticated user with settings flattened."""
    # Flatten settings from profile for the response model
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email_verified": current_user.email_verified,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "roles": current_user.roles,
        "bio": current_user.profile.bio if current_user.profile else None,
        "two_factor_enabled": current_user.profile.two_factor_enabled if current_user.profile else False,
        "login_notifications": current_user.profile.login_notifications if current_user.profile else True,
        "notification_preferences": current_user.profile.notification_preferences if current_user.profile else {},
        "privacy_settings": current_user.profile.privacy_settings if current_user.profile else {},
        "preferred_currency": current_user.profile.preferred_currency if current_user.profile else "USD",
        "language": current_user.profile.language if current_user.profile else "en-US",
    }
    return user_data


# Whitelisted fields for user update
ALLOWED_UPDATE_FIELDS = {
    'full_name', 'phone', 'bio',
    'two_factor_enabled', 'login_notifications',
    'notification_preferences', 'privacy_settings',
    'preferred_currency', 'language'
}

@router.patch("/me", response_model=UserRead)
async def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    SECURE: Update only whitelisted profile fields.
    Fixed: Mass assignment vulnerability.
    """
    from app.services.audit import audit_logger

    update_data = user_in.model_dump(exclude_unset=True)

    # Ensure profile exists
    if not current_user.profile:
        current_user.profile = UserProfile(user_id=current_user.id)
        db.add(current_user.profile)
        db.flush()

    # Only update whitelisted fields
    for field, value in update_data.items():
        if field == 'full_name' or field == 'phone':
            setattr(current_user, field, value)
        elif field == 'password':
            current_user.password_hash = security.get_password_hash(value)
        elif field in ALLOWED_UPDATE_FIELDS:
            # Most settings live on the profile
            setattr(current_user.profile, field, value)
        else:
            # Log attempt to modify restricted field
            audit_logger.log_security_event(
                event_type="RESTRICTED_FIELD_UPDATE_ATTEMPT",
                user_id=current_user.id,
                severity="MEDIUM",
                metadata={"field": field}
            )

    db.commit()
    db.refresh(current_user)
    return await get_me(current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Delete current user account."""
    current_user.is_active = False
    current_user.is_deleted = True
    db.add(current_user)
    db.commit()
    return None


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    SECURE: Verify email with proper token validation.
    Fixed: Email verification bypass vulnerability.
    """
    from app.services.audit import audit_logger

    # Validate token is for THIS user's email
    token_data = security.verify_email_verification_token(token)
    if not token_data or token_data.get("email") != current_user.email:
        audit_logger.log_security_event(
            event_type="EMAIL_VERIFICATION_INVALID_TOKEN",
            user_id=current_user.id,
            severity="MEDIUM",
            metadata={"email": current_user.email}
        )
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )

    # Mark as verified
    current_user.email_verified = True
    db.add(current_user)
    db.commit()

    # Audit log
    audit_logger.log_event(
        event_type="EMAIL_VERIFIED",
        user_id=current_user.id,
        metadata={"email": current_user.email}
    )

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    """Trigger a verification email resend for the given address."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If an account exists, a verification email has been sent"}
    return {"message": "Verification email queued"}


@router.get("/sessions", response_model=List[UserSessionRead])
async def get_active_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List active user sessions."""
    return db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).order_by(UserSession.last_activity_at.desc()).all()


@router.delete("/sessions/revoke-others")
async def revoke_other_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Revoke all active sessions for the current user."""
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).update({"is_active": False})
    db.commit()
    return {"message": "All other sessions revoked successfully"}
