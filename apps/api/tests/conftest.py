"""Pytest configuration and shared fixtures."""

import pytest
from typing import Generator, AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from app.core.database import Base, get_db
from app.core.config import settings
from main import app


# Test database URL (in-memory SQLite for unit tests)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_engine():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with dependency overrides."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_client(db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers() -> dict:
    """Generate mock authentication headers."""
    return {"Authorization": "Bearer mock_token_for_testing"}


@pytest.fixture
def mock_user_data() -> dict:
    """Mock user data for testing."""
    return {
        "id": "test-user-123",
        "email": "test@businessbridge.com",
        "full_name": "Test User",
        "role": "BUYER",
        "is_active": True,
        "is_verified": True,
    }


@pytest.fixture
def mock_listing_data() -> dict:
    """Mock listing data for testing."""
    return {
        "title": "Test SaaS Business",
        "description": "A profitable SaaS business for sale",
        "price": 100000.00,
        "revenue": 50000.00,
        "category": "SAAS",
        "industry": "Technology",
        "location": "United States",
        "status": "ACTIVE",
    }


@pytest.fixture
def mock_offer_data() -> dict:
    """Mock offer data for testing."""
    return {
        "listing_id": "listing-123",
        "amount": 95000.00,
        "terms": "Cash payment, 30-day close",
        "contingencies": "Due diligence period",
    }
