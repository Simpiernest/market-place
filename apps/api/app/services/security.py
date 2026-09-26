"""Security middleware and utilities for rate limiting, CSRF, CSP."""

from typing import Optional, Callable
from datetime import datetime, timedelta
from collections import defaultdict
import secrets
import hashlib
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import Headers

try:
    from redis import Redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from app.core.config import settings


class RateLimiter:
    """Simple in-memory rate limiter with Redis fallback."""

    def __init__(self, redis_url: Optional[str] = None):
        self.memory_store = defaultdict(list)

        if REDIS_AVAILABLE and redis_url:
            self.redis = Redis.from_url(redis_url)
            self.use_redis = True
        else:
            self.redis = None
            self.use_redis = False

    def is_allowed(
        self,
        key: str,
        max_requests: int = 100,
        window_seconds: int = 60,
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limit.

        Returns:
            (allowed, info_dict)
        """
        if self.use_redis:
            return self._check_redis(key, max_requests, window_seconds)
        else:
            return self._check_memory(key, max_requests, window_seconds)

    def _check_memory(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, dict]:
        """In-memory rate limit check."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)

        # Clean old entries
        self.memory_store[key] = [
            ts for ts in self.memory_store[key]
            if ts > window_start
        ]

        current_count = len(self.memory_store[key])

        if current_count >= max_requests:
            reset_at = min(self.memory_store[key]) + timedelta(seconds=window_seconds)
            return False, {
                "limit": max_requests,
                "remaining": 0,
                "reset": int(reset_at.timestamp()),
            }

        self.memory_store[key].append(now)

        return True, {
            "limit": max_requests,
            "remaining": max_requests - current_count - 1,
            "reset": int((now + timedelta(seconds=window_seconds)).timestamp()),
        }

    def _check_redis(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, dict]:
        """Redis-based rate limit check (sliding window)."""
        now = datetime.utcnow().timestamp()
        window_start = now - window_seconds

        pipe = self.redis.pipeline()

        # Remove old entries
        pipe.zremrangebyscore(key, 0, window_start)

        # Count requests in window
        pipe.zcard(key)

        # Add current request
        pipe.zadd(key, {str(now): now})

        # Set expiry
        pipe.expire(key, window_seconds)

        results = pipe.execute()
        current_count = results[1]

        if current_count >= max_requests:
            return False, {
                "limit": max_requests,
                "remaining": 0,
                "reset": int(now + window_seconds),
            }

        return True, {
            "limit": max_requests,
            "remaining": max_requests - current_count - 1,
            "reset": int(now + window_seconds),
        }


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware for FastAPI."""

    def __init__(self, app, limiter: RateLimiter = None):
        super().__init__(app)
        self.limiter = limiter or RateLimiter(redis_url=settings.REDIS_URL)

    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for health checks and tests
        if request.url.path in ["/health", "/ready"] or settings.ENVIRONMENT == "test":
            return await call_next(request)

        # Use IP address as rate limit key
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"

        # Category-based rate limiting (Phase 47)
        if request.url.path.startswith("/api/v1/auth"):
            max_requests, window = 5, 60  # 5 requests per minute for login/register
        elif request.url.path.startswith("/api/v1/admin"):
            max_requests, window = 20, 60
        elif any(p in request.url.path for p in ["/payments/", "/payouts/request", "/offers/"]):
            max_requests, window = 10, 60 # 10 financial ops per minute
        elif "/ai-broker/" in request.url.path:
            max_requests, window = 15, 60 # Limit expensive AI calls
        else:
            max_requests, window = 100, 60  # 100 requests per minute general

        allowed, info = self.limiter.is_allowed(key, max_requests, window)

        if not allowed:
            return Response(
                content='{"error": "Rate limit exceeded"}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": str(info["remaining"]),
                    "X-RateLimit-Reset": str(info["reset"]),
                    "Retry-After": str(window),
                },
            )

        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset"])

        return response


class CSRFProtection:
    """CSRF token generation and validation."""

    def __init__(self, secret_key: str = None):
        self.secret_key = secret_key or settings.SECRET_KEY

    def generate_token(self) -> str:
        """Generate a new CSRF token."""
        return secrets.token_urlsafe(32)

    def validate_token(self, token: str, session_token: str) -> bool:
        """Validate CSRF token matches session token."""
        return secrets.compare_digest(token, session_token)

    def get_token_from_request(self, request: Request) -> Optional[str]:
        """Extract CSRF token from request headers or form."""
        # Check header first
        token = request.headers.get("X-CSRF-Token")
        if token:
            return token

        # Check form data
        if hasattr(request, "form"):
            form = request.form()
            return form.get("csrf_token")

        return None


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)

        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.stripe.com https://api.paystack.co; "
            "frame-src https://js.stripe.com; "
        )

        # Other security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # HSTS (HTTP Strict Transport Security)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class IPWhitelist:
    """IP whitelist for admin endpoints."""

    def __init__(self, allowed_ips: list[str] = None):
        self.allowed_ips = set(allowed_ips or [])

    def is_allowed(self, ip: str) -> bool:
        """Check if IP is whitelisted."""
        if not self.allowed_ips:
            return True  # No whitelist configured
        return ip in self.allowed_ips

    def add_ip(self, ip: str):
        """Add IP to whitelist."""
        self.allowed_ips.add(ip)

    def remove_ip(self, ip: str):
        """Remove IP from whitelist."""
        self.allowed_ips.discard(ip)


class RequestValidator:
    """Validate and sanitize incoming requests."""

    @staticmethod
    def validate_content_length(
        request: Request,
        max_size_mb: int = 10,
    ) -> bool:
        """Check if request body size is within limit."""
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Request body too large. Maximum {max_size_mb}MB allowed.",
            )
        return True

    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """Basic input sanitization."""
        # Trim whitespace
        text = text.strip()

        # Limit length
        if len(text) > max_length:
            text = text[:max_length]

        # Remove null bytes
        text = text.replace("\x00", "")

        return text


# Global instances
rate_limiter = RateLimiter(redis_url=settings.REDIS_URL if hasattr(settings, "REDIS_URL") else None)
csrf_protection = CSRFProtection()
ip_whitelist = IPWhitelist()
