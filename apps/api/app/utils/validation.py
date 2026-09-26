"""
Input validation and sanitization utilities.
Provides security-focused validation for user inputs.
"""

import re
from typing import Optional, List, Any
from decimal import Decimal, InvalidOperation
from fastapi import HTTPException
from uuid import UUID


class InputValidator:
    """Validates and sanitizes user inputs for security."""

    # Validation patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    SLUG_PATTERN = re.compile(r'^[a-z0-9-]+$')
    URL_PATTERN = re.compile(r'^https?://[^\s<>"{}|\\^`\[\]]+$')
    SAFE_FILENAME_PATTERN = re.compile(r'^[a-zA-Z0-9_.-]+$')

    # Dangerous patterns
    SQL_INJECTION_PATTERNS = [
        r"(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)",
        r"(--|#|/\*|\*/)",
        r"(\bOR\b.*=.*|'\s*OR\s*'|\bAND\b.*=.*)",
        r"(\bEXEC\b|\bEXECUTE\b|\bsp_executesql\b)",
    ]

    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ]

    AI_PROMPT_INJECTION_PATTERNS = [
        r"ignore\s+(previous|all|above)\s+instructions?",
        r"system\s+prompt",
        r"forget\s+(everything|all|previous)",
        r"you\s+are\s+now",
        r"disregard\s+",
        r"new\s+instructions?:",
    ]

    @classmethod
    def validate_amount(
        cls,
        amount: Any,
        min_value: float = 0.01,
        max_value: float = 1_000_000_000.00,
        field_name: str = "amount"
    ) -> Decimal:
        """Validate and convert monetary amount."""
        try:
            decimal_amount = Decimal(str(amount))
        except (InvalidOperation, ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: must be a valid number"
            )

        if decimal_amount < Decimal(str(min_value)):
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} must be at least {min_value}"
            )

        if decimal_amount > Decimal(str(max_value)):
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} cannot exceed {max_value}"
            )

        # Check for reasonable decimal places (max 2 for currency)
        if abs(decimal_amount.as_tuple().exponent) > 2:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} can have at most 2 decimal places"
            )

        return decimal_amount

    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate email format."""
        if not email or len(email) > 255:
            raise HTTPException(status_code=400, detail="Invalid email address")

        if not cls.EMAIL_PATTERN.match(email):
            raise HTTPException(status_code=400, detail="Invalid email format")

        return email.lower().strip()

    @classmethod
    def validate_url(cls, url: str, allow_empty: bool = True) -> Optional[str]:
        """Validate URL format and check for SSRF risks."""
        if not url:
            if allow_empty:
                return None
            raise HTTPException(status_code=400, detail="URL is required")

        url = url.strip()

        # Check length
        if len(url) > 2048:
            raise HTTPException(status_code=400, detail="URL too long")

        # Basic URL pattern check
        if not cls.URL_PATTERN.match(url):
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Check for SSRF attempts
        dangerous_hosts = [
            'localhost', '127.0.0.1', '0.0.0.0',
            '169.254.169.254',  # AWS metadata
            '[::]', '::1',  # IPv6 localhost
        ]

        url_lower = url.lower()
        for host in dangerous_hosts:
            if host in url_lower:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid URL: localhost/internal hosts not allowed"
                )

        # Check for private IP ranges in URL
        private_ip_patterns = [
            r'10\.\d{1,3}\.\d{1,3}\.\d{1,3}',
            r'172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}',
            r'192\.168\.\d{1,3}\.\d{1,3}',
        ]

        for pattern in private_ip_patterns:
            if re.search(pattern, url):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid URL: private IP addresses not allowed"
                )

        return url

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitize filename to prevent path traversal."""
        if not filename:
            raise HTTPException(status_code=400, detail="Filename is required")

        # Remove path separators
        filename = filename.replace('/', '').replace('\\', '').replace('..', '')

        # Remove potentially dangerous characters
        filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

        if not filename or len(filename) > 255:
            raise HTTPException(status_code=400, detail="Invalid filename")

        return filename

    @classmethod
    def detect_sql_injection(cls, text: str) -> bool:
        """Detect potential SQL injection attempts."""
        if not text:
            return False

        text_upper = text.upper()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_upper, re.IGNORECASE):
                return True

        return False

    @classmethod
    def detect_xss(cls, text: str) -> bool:
        """Detect potential XSS attempts."""
        if not text:
            return False

        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True

        return False

    @classmethod
    def detect_prompt_injection(cls, text: str) -> bool:
        """Detect AI prompt injection attempts."""
        if not text:
            return False

        text_lower = text.lower()
        for pattern in cls.AI_PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True

        return False

    @classmethod
    def sanitize_ai_input(cls, text: str, max_length: int = 10000) -> str:
        """Sanitize input for AI systems."""
        if not text:
            return ""

        # Truncate to max length
        text = text[:max_length]

        # Check for prompt injection
        if cls.detect_prompt_injection(text):
            raise HTTPException(
                status_code=400,
                detail="Invalid input: potential prompt injection detected"
            )

        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    @classmethod
    def validate_listing_price(cls, price: Any) -> Decimal:
        """Validate listing asking price."""
        return cls.validate_amount(
            price,
            min_value=100.00,  # Minimum listing price
            max_value=1_000_000_000.00,  # 1 billion max
            field_name="asking_price"
        )

    @classmethod
    def validate_offer_amount(cls, amount: Any, listing_price: Decimal) -> Decimal:
        """Validate offer amount against listing price."""
        validated_amount = cls.validate_amount(amount, field_name="offer_amount")

        # Offer should be reasonable relative to asking price (10% - 150%)
        min_offer = listing_price * Decimal("0.10")
        max_offer = listing_price * Decimal("1.50")

        if validated_amount < min_offer or validated_amount > max_offer:
            raise HTTPException(
                status_code=400,
                detail=f"Offer amount must be between {min_offer} and {max_offer}"
            )

        return validated_amount

    @classmethod
    def validate_commission_rate(cls, rate: Any) -> Decimal:
        """Validate commission rate (0-1)."""
        try:
            decimal_rate = Decimal(str(rate))
        except (InvalidOperation, ValueError):
            raise HTTPException(status_code=400, detail="Invalid commission rate")

        if decimal_rate < 0 or decimal_rate > Decimal("1.0"):
            raise HTTPException(
                status_code=400,
                detail="Commission rate must be between 0 and 1"
            )

        return decimal_rate

    @classmethod
    def validate_uuid(cls, value: Any, field_name: str = "ID") -> UUID:
        """Validate UUID format."""
        try:
            return UUID(str(value))
        except (ValueError, AttributeError, TypeError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: must be a valid UUID"
            )

    @classmethod
    def validate_text_length(
        cls,
        text: Optional[str],
        min_length: int = 0,
        max_length: int = 10000,
        field_name: str = "text"
    ) -> Optional[str]:
        """Validate text length."""
        if text is None:
            if min_length > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{field_name} is required"
                )
            return None

        text = text.strip()

        if len(text) < min_length:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} must be at least {min_length} characters"
            )

        if len(text) > max_length:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} cannot exceed {max_length} characters"
            )

        return text

    @classmethod
    def validate_list_items(
        cls,
        items: Optional[List[Any]],
        min_items: int = 0,
        max_items: int = 100,
        field_name: str = "items"
    ) -> Optional[List[Any]]:
        """Validate list length."""
        if items is None:
            if min_items > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{field_name} is required"
                )
            return None

        if len(items) < min_items:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} must contain at least {min_items} items"
            )

        if len(items) > max_items:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} cannot exceed {max_items} items"
            )

        return items

    @classmethod
    def validate_bank_account(cls, account: str) -> bool:
        """Validate bank account number format."""
        return bool(re.match(r'^[0-9]{8,20}$', account))

    @classmethod
    def validate_routing_number(cls, routing: str) -> bool:
        """Validate US routing number format (9 digits)."""
        return bool(re.match(r'^[0-9]{9}$', routing))
