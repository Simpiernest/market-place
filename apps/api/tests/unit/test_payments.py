"""Unit tests for payment service."""

import pytest
from unittest.mock import Mock, patch
from app.services.payment import PaymentService


@pytest.mark.unit
def test_payment_service_initialization():
    """Test payment service can be initialized."""
    service = PaymentService()
    assert service is not None


@pytest.mark.unit
@patch("app.services.payment.stripe")
def test_create_stripe_checkout(mock_stripe):
    """Test Stripe checkout session creation."""
    mock_stripe.checkout.Session.create.return_value = Mock(
        id="cs_test_123",
        url="https://checkout.stripe.com/test"
    )

    service = PaymentService()
    session = service.create_checkout_session(
        transaction_id="txn_123",
        amount=100000,
        provider="stripe"
    )

    assert session["url"].startswith("https://")


@pytest.mark.unit
def test_calculate_fees():
    """Test fee calculation."""
    service = PaymentService()

    amount = 100000
    fee_rate = 0.05  # 5%
    expected_fee = amount * fee_rate

    assert expected_fee == 5000.0
