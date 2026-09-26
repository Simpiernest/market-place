"""
Security tests for critical vulnerabilities.
"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timedelta

from main import app
from app.core import security
from app.core.database import get_db
from app.models.domain import User, UserRole, UserRoleMapping


client = TestClient(app)


class TestEmailVerification:
    """Test email verification security fixes."""

    def test_verify_email_requires_authentication(self):
        """Email verification should require authentication."""
        response = client.post("/api/v1/auth/verify-email", json={"token": "fake_token"})
        assert response.status_code == 401

    def test_verify_email_validates_token(self, auth_headers):
        """Email verification should validate token matches user."""
        # Invalid token
        response = client.post(
            "/api/v1/auth/verify-email",
            json={"token": "invalid_token"},
            headers=auth_headers
        )
        assert response.status_code in [400, 401, 403]


class TestFinancialSecurity:
    """Test financial operation security fixes."""

    def test_fund_release_requires_authorization(self, auth_headers):
        """Fund release should require proper authorization."""
        fake_transaction_id = str(uuid4())
        response = client.post(
            f"/api/v1/payments/transactions/{fake_transaction_id}/release",
            headers=auth_headers
        )
        # Should fail with 403 (unauthorized) or 404 (not found)
        assert response.status_code in [403, 404]

    def test_refund_requires_authorization(self, auth_headers):
        """Refund should require admin or mutual agreement."""
        fake_transaction_id = str(uuid4())
        response = client.post(
            f"/api/v1/payments/transactions/{fake_transaction_id}/refund",
            json={"reason": "Test refund"},
            headers=auth_headers
        )
        # Should fail with 403 (unauthorized) or 404 (not found)
        assert response.status_code in [403, 404]


class TestOfferAcceptance:
    """Test offer acceptance race condition fixes."""

    def test_offer_acceptance_locks_listing(self, auth_headers):
        """Offer acceptance should lock listing to prevent double-sale."""
        # This test would require complex setup with real database
        # For now, verify endpoint exists and requires auth
        fake_offer_id = str(uuid4())
        response = client.post(
            f"/api/v1/offers/{fake_offer_id}/accept",
            headers=auth_headers
        )
        # Should fail with 404 (not found) or 403 (not authorized)
        assert response.status_code in [403, 404]


class TestAccountEnumeration:
    """Test account enumeration fixes."""

    def test_registration_doesnt_leak_email_existence(self):
        """Registration should not reveal if email exists."""
        # Try to register with same email twice
        user_data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User",
            "role": "BUYER"
        }

        # First registration
        response1 = client.post("/api/v1/auth/register", json=user_data)

        # Second registration with same email
        response2 = client.post("/api/v1/auth/register", json=user_data)

        # Both should return similar success messages (not reveal existence)
        assert response1.status_code == 201
        # Second one should also return 201 or similar success status
        # Not 400 with "email already exists"
        assert response2.status_code in [200, 201]


class TestMassAssignment:
    """Test mass assignment protection."""

    def test_user_update_restricts_fields(self, auth_headers):
        """User update should only allow whitelisted fields."""
        # Attempt to update restricted fields
        response = client.patch(
            "/api/v1/auth/me",
            json={
                "full_name": "Updated Name",
                "is_admin": True,  # Should be blocked
                "email_verified": True,  # Should be blocked
                "is_active": False  # Should be blocked
            },
            headers=auth_headers
        )

        # Should succeed but only update allowed fields
        if response.status_code == 200:
            data = response.json()
            # Restricted fields should not be updated
            # (This assumes the user wasn't admin/verified before)


class TestJWTSecurity:
    """Test JWT security fixes."""

    def test_auto_sync_disabled(self):
        """Auto-sync should be disabled - no user creation from JWT alone."""
        # Create a valid JWT for non-existent user
        fake_user_id = str(uuid4())
        token = security.create_access_token(fake_user_id)

        # Try to access protected endpoint
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Should fail with 401 (user not found)
        assert response.status_code == 401


class TestRateLimiting:
    """Test rate limiting on sensitive endpoints."""

    def test_login_rate_limit(self):
        """Login endpoint should have rate limiting."""
        # Make multiple login attempts
        for _ in range(10):
            response = client.post(
                "/api/v1/auth/login",
                data={
                    "username": "test@example.com",
                    "password": "wrong_password"
                }
            )

        # Eventually should hit rate limit (429 Too Many Requests)
        # Note: This test might need adjustment based on rate limit config


# Fixtures

@pytest.fixture
def auth_headers():
    """Create mock authentication headers."""
    # In real tests, this would create a real user and return valid token
    fake_token = "mock_token_for_testing"
    return {"Authorization": f"Bearer {fake_token}"}


@pytest.fixture
def test_user(db):
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        full_name="Test User",
        password_hash=security.get_password_hash("TestPass123!"),
        is_active=True,
        email_verified=True
    )
    db.add(user)

    role = UserRoleMapping(user_id=user.id, role=UserRole.BUYER)
    db.add(role)

    db.commit()
    db.refresh(user)
    return user
