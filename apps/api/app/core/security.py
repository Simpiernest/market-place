from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.JWT_ALGORITHM

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_email_verification_token(email: str) -> str:
    """Create a secure email verification token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode = {
        "exp": expire,
        "email": email,
        "type": "email_verification",
        "nonce": secrets.token_urlsafe(16)
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def verify_email_verification_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify email verification token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "email_verification":
            return None
        return payload
    except JWTError:
        return None

def create_email_change_token(user_id: str, new_email: str) -> str:
    """Create a secure email change token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode = {
        "exp": expire,
        "user_id": str(user_id),
        "new_email": new_email,
        "type": "email_change",
        "nonce": secrets.token_urlsafe(16)
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def verify_email_change_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify email change token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "email_change":
            return None
        return payload
    except JWTError:
        return None
