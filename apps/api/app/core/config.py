"""
Core configuration settings for Business Bridge API.
Uses Pydantic settings management with environment variables.
"""

from typing import List, Optional, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

    # Environment
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # Application URLs
    APP_URL: str = Field(default="http://localhost:3000")
    API_URL: str = Field(default="http://localhost:8000")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/business_bridge"
    )

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379")

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = Field(default="change-this-in-production")

    # JWT Authentication
    JWT_SECRET: str = Field(
        description="JWT signing secret - MUST be set via environment variable"
    )
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Enforce strong JWT secret."""
        if not v or len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        if v == "change-this-in-production":
            raise ValueError("JWT_SECRET cannot use default value")
        return v

    # Storage
    STORAGE_BUCKET_PUBLIC: str = Field(default="public")
    STORAGE_BUCKET_PRIVATE: str = Field(default="private")

    # Email Provider
    EMAIL_PROVIDER: str = Field(default="NOT_CONFIGURED")
    EMAIL_FROM: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Payment Provider
    PAYMENT_PROVIDER: str = Field(default="NOT_CONFIGURED")

    # Stripe (if configured)
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Paystack (if configured)
    PAYSTACK_PUBLIC_KEY: Optional[str] = None
    PAYSTACK_SECRET_KEY: Optional[str] = None
    PAYSTACK_WEBHOOK_SECRET: Optional[str] = None

    # AI Providers
    AI_PROVIDER: str = Field(default="OPENAI")
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # Commission Settings
    DEFAULT_COMMISSION_RATE: float = Field(default=0.05)

    # File Upload
    MAX_FILE_SIZE_MB: int = Field(default=50)
    ALLOWED_FILE_TYPES: str = Field(default="pdf,doc,docx,xls,xlsx,jpg,jpeg,png,webp")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)

    # Security
    CORS_ORIGINS: Any = Field(default=["*"])
    ALLOWED_HOSTS: Any = Field(default=["*"])

    # Feature Flags (V1 only)
    ENABLE_VERIFICATION: bool = Field(default=True)
    ENABLE_MESSAGING: bool = Field(default=True)
    ENABLE_OFFERS: bool = Field(default=True)
    ENABLE_DOCUMENTS: bool = Field(default=True)
    ENABLE_NOTIFICATIONS: bool = Field(default=True)

    # Future Features (NOW ENABLED)
    ENABLE_AI_FEATURES: bool = Field(default=True)
    ENABLE_DATA_ROOMS: bool = Field(default=True)
    ENABLE_DEAL_ROOMS: bool = Field(default=True)
    ENABLE_VALUATION: bool = Field(default=True)
    ENABLE_REVIEWS: bool = Field(default=True)
    ENABLE_AI_BROKER: bool = Field(default=True)

    @field_validator("CORS_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_comma_separated_list(cls, v: Any) -> List[str]:
        """Parse comma-separated string into a list of strings."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @property
    def allowed_file_extensions(self) -> List[str]:
        """Get list of allowed file extensions."""
        return [ext.strip() for ext in self.ALLOWED_FILE_TYPES.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


# Create global settings instance
settings = Settings()
