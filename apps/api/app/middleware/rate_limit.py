"""
Rate limiting middleware using slowapi.
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Initialize limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="memory://"  # Use redis:// in production
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Custom rate limiting middleware."""

    async def dispatch(self, request: Request, call_next):
        # Rate limits are applied via decorator on endpoints
        # This middleware just ensures the limiter is available
        response = await call_next(request)
        return response


def setup_rate_limiting(app):
    """Setup rate limiting for FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    return limiter
