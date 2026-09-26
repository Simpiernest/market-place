"""Payment provider orchestration and integration."""

from typing import Optional, Dict, Any
from abc import ABC, abstractmethod
import stripe
import httpx
from decimal import Decimal

from app.core.config import settings


class PaymentProvider(ABC):
    """Abstract base class for payment providers."""

    @abstractmethod
    async def create_checkout_session(
        self,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
        success_url: str,
        cancel_url: str,
    ) -> Dict[str, Any]:
        """Create a checkout session."""
        pass

    @abstractmethod
    async def verify_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Verify and parse a webhook event."""
        pass

    @abstractmethod
    async def create_payout(
        self,
        recipient_id: str,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create a payout to a recipient."""
        pass


class StripeProvider(PaymentProvider):
    """Stripe payment provider implementation."""

    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    async def create_checkout_session(
        self,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
        success_url: str,
        cancel_url: str,
    ) -> Dict[str, Any]:
        """Create a Stripe Checkout session."""
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency.lower(),
                        "product_data": {
                            "name": metadata.get("description", "Business Acquisition Payment"),
                        },
                        "unit_amount": int(amount * 100),  # Convert to cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
            payment_intent_data={"metadata": metadata},
        )

        return {
            "session_id": session.id,
            "url": session.url,
            "provider": "stripe",
            "status": session.status,
        }

    async def verify_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Verify Stripe webhook signature and return event."""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event
        except ValueError:
            return None
        except stripe.error.SignatureVerificationError:
            return None

    async def create_payout(
        self,
        recipient_id: str,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create a Stripe payout (requires Stripe Connect)."""
        # For connected accounts (sellers)
        transfer = stripe.Transfer.create(
            amount=int(amount * 100),
            currency=currency.lower(),
            destination=recipient_id,  # Connected account ID
            metadata=metadata,
        )

        return {
            "transfer_id": transfer.id,
            "provider": "stripe",
            "status": transfer.status,
            "amount": amount,
            "currency": currency,
        }

    async def create_connected_account(self, email: str, country: str = "US") -> Dict[str, Any]:
        """Create a Stripe Connect account for a seller."""
        account = stripe.Account.create(
            type="express",
            country=country,
            email=email,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True},
            },
        )

        account_link = stripe.AccountLink.create(
            account=account.id,
            refresh_url=f"{settings.FRONTEND_URL}/dashboard/settings/payouts?refresh=true",
            return_url=f"{settings.FRONTEND_URL}/dashboard/settings/payouts?success=true",
            type="account_onboarding",
        )

        return {
            "account_id": account.id,
            "onboarding_url": account_link.url,
            "provider": "stripe",
        }


class PaystackProvider(PaymentProvider):
    """Paystack payment provider implementation (for African markets)."""

    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
        self.base_url = "https://api.paystack.co"

    async def create_checkout_session(
        self,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
        success_url: str,
        cancel_url: str,
    ) -> Dict[str, Any]:
        """Initialize a Paystack transaction."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/transaction/initialize",
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "amount": int(amount * 100),  # Convert to kobo/cents
                    "currency": currency.upper(),
                    "email": metadata.get("email"),
                    "callback_url": success_url,
                    "metadata": metadata,
                },
            )
            data = response.json()

            if response.status_code == 200 and data.get("status"):
                return {
                    "session_id": data["data"]["reference"],
                    "url": data["data"]["authorization_url"],
                    "provider": "paystack",
                    "status": "pending",
                }
            else:
                raise Exception(f"Paystack initialization failed: {data.get('message')}")

    async def verify_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Verify Paystack webhook signature."""
        import hmac
        import hashlib

        computed_signature = hmac.new(
            self.secret_key.encode("utf-8"),
            payload,
            hashlib.sha512,
        ).hexdigest()

        if computed_signature == signature:
            import json
            return json.loads(payload)
        return None

    async def create_payout(
        self,
        recipient_id: str,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create a Paystack transfer."""
        async with httpx.AsyncClient() as client:
            # First, create a transfer recipient if needed
            response = await client.post(
                f"{self.base_url}/transfer",
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "source": "balance",
                    "amount": int(amount * 100),
                    "recipient": recipient_id,
                    "reason": metadata.get("description", "Payout"),
                },
            )
            data = response.json()

            if response.status_code == 200 and data.get("status"):
                return {
                    "transfer_id": data["data"]["reference"],
                    "provider": "paystack",
                    "status": data["data"]["status"],
                    "amount": amount,
                    "currency": currency,
                }
            else:
                raise Exception(f"Paystack transfer failed: {data.get('message')}")

    async def create_transfer_recipient(
        self,
        account_number: str,
        bank_code: str,
        name: str,
        currency: str = "NGN"
    ) -> Dict[str, Any]:
        """Create a transfer recipient for payouts."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/transferrecipient",
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "type": "nuban",
                    "name": name,
                    "account_number": account_number,
                    "bank_code": bank_code,
                    "currency": currency,
                },
            )
            data = response.json()

            if response.status_code == 201 and data.get("status"):
                return {
                    "recipient_code": data["data"]["recipient_code"],
                    "provider": "paystack",
                }
            else:
                raise Exception(f"Recipient creation failed: {data.get('message')}")


class PaymentOrchestrator:
    """Orchestrate payments across multiple providers."""

    def __init__(self):
        self.providers = {
            "stripe": StripeProvider(),
            "paystack": PaystackProvider(),
        }

    def get_provider(self, provider_name: str) -> PaymentProvider:
        """Get a payment provider by name."""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown payment provider: {provider_name}")
        return self.providers[provider_name]

    def select_provider_for_region(self, currency: str, country: str = None) -> str:
        """Select the best payment provider based on region/currency."""
        # Use Paystack for African currencies
        if currency.upper() in ["NGN", "GHS", "ZAR", "KES"]:
            return "paystack"
        # Use Stripe for everything else
        return "stripe"

    async def create_checkout(
        self,
        amount: Decimal,
        currency: str,
        metadata: Dict[str, Any],
        success_url: str,
        cancel_url: str,
        provider: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a checkout session with the appropriate provider."""
        if not provider:
            provider = self.select_provider_for_region(currency, metadata.get("country"))

        payment_provider = self.get_provider(provider)
        return await payment_provider.create_checkout_session(
            amount, currency, metadata, success_url, cancel_url
        )


# Global instance
payment_orchestrator = PaymentOrchestrator()
