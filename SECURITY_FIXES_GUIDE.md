# Security Configuration Fixes

## Critical Configuration Changes

### 1. JWT Secret Validation

**File:** `apps/api/app/core/config.py`

Add validation:

```python
from pydantic import field_validator, ValidationError

class Settings(BaseSettings):
    JWT_SECRET: str = Field(description="JWT signing secret - MUST be set via environment")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    
    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Enforce strong JWT secret."""
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        if v == "change-this-in-production":
            raise ValueError("JWT_SECRET cannot use default value in production")
        if v.lower() in ["secret", "password", "key", "token"]:
            raise ValueError("JWT_SECRET is too weak")
        return v
```

### 2. Rate Limiting Implementation

**File:** `apps/api/app/middleware/rate_limit.py`

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="redis://localhost:6379"
)

# Apply to FastAPI app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Apply to sensitive endpoints:**

```python
from app.middleware.rate_limit import limiter

@router.post("/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(...):
    ...

@router.post("/resend-verification")
@limiter.limit("3/hour")  # Max 3 resends per hour
async def resend_verification(...):
    ...

@router.post("/create-checkout")
@limiter.limit("10/hour")  # Max 10 checkouts per hour
async def create_checkout(...):
    ...
```

### 3. Audit Logging Service

**File:** `apps/api/app/services/audit.py`

```python
from datetime import datetime
from typing import Any, Dict
from uuid import UUID
import json
from sqlalchemy.orm import Session

class AuditLogger:
    def __init__(self, db: Session):
        self.db = db
    
    def log_security_event(
        self,
        event_type: str,
        user_id: UUID,
        severity: str,
        metadata: Dict[str, Any] = None
    ):
        """Log security-related events."""
        event = AuditLog(
            event_type=event_type,
            user_id=user_id,
            severity=severity,
            ip_address=get_client_ip(),
            user_agent=get_user_agent(),
            metadata=metadata or {},
            timestamp=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
        
        # Also log to external monitoring if HIGH/CRITICAL
        if severity in ["HIGH", "CRITICAL"]:
            self._send_to_siem(event)
    
    def log_financial_event(
        self,
        event_type: str,
        user_id: UUID,
        transaction_id: UUID,
        amount: float,
        metadata: Dict[str, Any] = None
    ):
        """Log all financial operations."""
        event = FinancialAuditLog(
            event_type=event_type,
            user_id=user_id,
            transaction_id=transaction_id,
            amount=amount,
            metadata=metadata or {},
            timestamp=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
        
        # Alert on large transactions
        if amount > 100000:
            self._send_alert(f"Large transaction: ${amount}")
    
    def log_business_event(
        self,
        event_type: str,
        user_id: UUID,
        metadata: Dict[str, Any]
    ):
        """Log business logic events."""
        event = BusinessAuditLog(
            event_type=event_type,
            user_id=user_id,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()

audit_logger = AuditLogger()
```

### 4. Add Missing Database Models

**File:** `apps/api/app/models/domain.py`

Add:

```python
class RefundAgreement(Base):
    __tablename__ = "refund_agreements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    buyer_agreed = Column(Boolean, default=False)
    seller_agreed = Column(Boolean, default=False)
    buyer_agreed_at = Column(DateTime, nullable=True)
    seller_agreed_at = Column(DateTime, nullable=True)
    reason = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String, default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    reason = Column(Text, nullable=False)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    severity = Column(String, default="INFO")  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    ip_address = Column(String)
    user_agent = Column(String)
    metadata = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class FinancialAuditLog(Base):
    __tablename__ = "financial_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    metadata = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
```

### 5. Secure Registration (Fix Account Enumeration)

**File:** `apps/api/app/api/v1/endpoints/auth.py`

Replace registration endpoint:

```python
@router.post("/register", status_code=status.HTTP_200_OK)
async def register_secure(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    SECURE: Register without leaking email existence.
    Fixed: CVE-2026-007 - Account enumeration
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    
    if existing_user:
        # ✅ Don't reveal email exists
        # ✅ Send "account exists" notification to that email
        await email_service.send_account_exists_notification(user_in.email)
        
        # ✅ Return same success message
        return {
            "message": "Registration successful. Please check your email to verify your account.",
            "email": user_in.email
        }
    
    # Create new user
    db_user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        email_verified=False
    )
    db.add(db_user)
    db.flush()
    
    # Assign role
    requested_role = user_in.role or UserRole.BUYER
    role_mapping = UserRoleMapping(user_id=db_user.id, role=requested_role)
    db.add(role_mapping)
    
    db.commit()
    db.refresh(db_user)
    
    # Send verification email
    verification_token = security.create_email_verification_token(db_user.email)
    await email_service.send_verification_email(
        db_user.email,
        db_user.full_name,
        verification_token
    )
    
    audit_logger.log_event(
        event_type="USER_REGISTERED",
        user_id=db_user.id,
        metadata={"email": db_user.email, "role": requested_role.value}
    )
    
    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "email": db_user.email
    }
```

## Database Migration

Create migration file:

```bash
alembic revision -m "Add security tables and audit logs"
```

Add to migration:

```python
def upgrade():
    # RefundAgreement table
    op.create_table(
        'refund_agreements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('buyer_agreed', sa.Boolean(), default=False),
        sa.Column('seller_agreed', sa.Boolean(), default=False),
        # ... rest of columns
    )
    
    # Dispute table
    op.create_table('disputes', ...)
    
    # AuditLog table
    op.create_table('audit_logs', ...)
    
    # FinancialAuditLog table
    op.create_table('financial_audit_logs', ...)
    
    # Add indexes
    op.create_index('idx_audit_event_type', 'audit_logs', ['event_type'])
    op.create_index('idx_audit_timestamp', 'audit_logs', ['timestamp'])
    op.create_index('idx_financial_audit_timestamp', 'financial_audit_logs', ['timestamp'])
```

## Environment Variables Required

Add to `.env`:

```bash
# Security
ENABLE_RATE_LIMITING=True
MAX_LOGIN_ATTEMPTS=5
LOGIN_COOLDOWN_MINUTES=15
REQUIRE_EMAIL_VERIFICATION=True
MIN_PASSWORD_LENGTH=12

# Audit
ENABLE_AUDIT_LOGGING=True
AUDIT_LOG_RETENTION_DAYS=90
SIEM_ENDPOINT=https://your-siem.com/api/events
ALERT_EMAIL=security@businessbridge.com

# Financial
MIN_INSPECTION_PERIOD_DAYS=7
MAX_TRANSACTION_AMOUNT=10000000
REQUIRE_MILESTONE_COMPLETION=True
```

## Testing the Fixes

Run security tests:

```bash
cd apps/api
pytest tests/security/ -v
```

Verify:
1. Email verification requires valid token
2. Fund release checks all milestones
3. Refund requires authorization
4. Offer acceptance prevents double-sale
5. User update only allows whitelisted fields
6. Rate limiting works on sensitive endpoints
7. Audit logs are created for all financial operations
