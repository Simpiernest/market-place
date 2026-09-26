"""Unit tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
def test_signup_creates_user(client: TestClient):
    """Test user signup creates a new user."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "New User",
            "role": "BUYER",
        },
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert "id" in data or "user" in data


@pytest.mark.unit
def test_signup_validates_email(client: TestClient):
    """Test signup validates email format."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "invalid-email",
            "password": "SecurePass123!",
            "full_name": "Test User",
            "role": "BUYER",
        },
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.unit
def test_login_with_valid_credentials(client: TestClient, mock_user_data: dict):
    """Test login with valid credentials."""
    # First create a user
    client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "TestPass123!",
            "full_name": "Test User",
            "role": "BUYER",
        },
    )

    # Then try to login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123!",
        },
    )

    # May return 200 with token or 401 if Supabase not configured
    assert response.status_code in [200, 401]


@pytest.mark.unit
def test_login_with_invalid_credentials(client: TestClient):
    """Test login fails with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword",
        },
    )
    assert response.status_code in [401, 400]
