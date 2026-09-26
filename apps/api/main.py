"""
Business Bridge API - Main Application Entry Point
FastAPI backend for the Business Bridge marketplace platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router
from app.services.security import RateLimitMiddleware, SecurityHeadersMiddleware, rate_limiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Business Bridge API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Create database tables (in production, use Alembic migrations)
    if settings.ENVIRONMENT == "development":
        logger.info("Creating database tables...")
        # Base.metadata.create_all(bind=engine)

    yield

    # Shutdown
    logger.info("Shutting down Business Bridge API...")


# Initialize FastAPI application
app = FastAPI(
    title="Business Bridge API",
    description="Global online business acquisition marketplace API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, limiter=rate_limiter)


# Health check endpoints
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "business-bridge-api"}


@app.get("/ready", tags=["health"])
async def readiness_check():
    """Readiness check endpoint."""
    # TODO: Check database connection, Redis, etc.
    return {"status": "ready"}


# Include API router
app.include_router(api_router, prefix="/api/v1")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
            }
        },
    )


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8005))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG,
        log_level="info",
    )
