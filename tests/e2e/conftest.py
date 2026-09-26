import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api")))

from main import app
from app.core.database import Base, get_db
from app.core.config import settings

# Use SQLite for testing if possible, but models use JSONB/UUID (Postgres)
# For E2E logic testing, we'll assume a test postgres URL or mock where needed.
# Here we'll use a standard structure that overrides the DB dependency.

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db" # Fallback for logic check

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db(db_engine) -> Generator:
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db) -> Generator:
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(client):
    # Create a test user for auth
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "id": "00000000-0000-0000-0000-000000000001"
    }
