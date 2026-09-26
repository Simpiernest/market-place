from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.config import settings
from app.core.database import get_db
from app.models.domain import User, UserRole, UserRoleMapping

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_URL}/api/v1/auth/login"
)

reusable_oauth2_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_URL}/api/v1/auth/login",
    auto_error=False
)

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    """
    SECURE: Get current user with proper JWT validation (Local or Supabase).
    """
    from app.services.audit import audit_logger
    from supabase import create_client, Client

    user_id = None

    # 1. Try local JWT decoding first
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
    except (JWTError, ValidationError):
        # 2. If local fails, try Supabase validation
        try:
            if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
                supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                # This will verify the token and return user info
                supabase_user = supabase.auth.get_user(token)
                if supabase_user and supabase_user.user:
                    user_id = str(supabase_user.user.id)
        except Exception as e:
            print(f"Supabase auth failed: {e}")
            pass

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user = db.query(User).filter(User.id == UUID(user_id)).first()

    # SECURITY FIX: Auto-sync user if found in Supabase but not in our DB
    # (Happens during initial onboarding after Supabase signup)
    if not user:
        # Check if we can get user info from Supabase to create local record
        try:
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            res = supabase.auth.get_user(token)
            if res and res.user:
                # Create user in local DB
                user = User(
                    id=UUID(res.user.id),
                    email=res.user.email,
                    full_name=res.user.user_metadata.get("full_name", "New User"),
                    email_verified=res.user.email_confirmed_at is not None
                )
                db.add(user)

                # Add default role
                from app.models.domain import UserRoleMapping, UserRole
                role = res.user.user_metadata.get("role", "BUYER").upper()
                role_mapping = UserRoleMapping(user_id=user.id, role=UserRole(role))
                db.add(role_mapping)

                db.commit()
                db.refresh(user)
        except Exception as e:
            print(f"Failed to auto-sync Supabase user: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found and sync failed."
            )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in database."
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return user

async def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2_optional)
) -> Optional[User]:
    if not token:
        return None
    try:
        return await get_current_user(db, token)
    except HTTPException:
        return None

class PermissionChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        user_roles = [r.role for r in user.roles]

        # Super admin always has access
        if UserRole.SUPER_ADMIN in user_roles:
            return True

        for role in self.allowed_roles:
            if role in user_roles:
                return True

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

# Example usage: Depends(PermissionChecker([UserRole.ADMIN]))
