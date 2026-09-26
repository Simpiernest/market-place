"""Email notification service using Resend or SendGrid."""

from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
import httpx
from jinja2 import Template

from app.core.config import settings


class EmailProvider(ABC):
    """Abstract email provider."""

    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        from_email: str = None,
        reply_to: str = None,
    ) -> Dict[str, Any]:
        """Send an email."""
        pass


class ResendProvider(EmailProvider):
    """Resend email provider (modern, developer-friendly)."""

    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.base_url = "https://api.resend.com"
        self.default_from = settings.EMAIL_FROM or "Business Bridge <noreply@businessbridge.com>"

    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        from_email: str = None,
        reply_to: str = None,
    ) -> Dict[str, Any]:
        """Send email via Resend."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/emails",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_email or self.default_from,
                    "to": [to],
                    "subject": subject,
                    "html": html_content,
                    "reply_to": reply_to,
                },
            )

            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": response.text}


class SendGridProvider(EmailProvider):
    """SendGrid email provider (enterprise option)."""

    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.base_url = "https://api.sendgrid.com/v3"
        self.default_from = settings.EMAIL_FROM or "noreply@businessbridge.com"

    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        from_email: str = None,
        reply_to: str = None,
    ) -> Dict[str, Any]:
        """Send email via SendGrid."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/mail/send",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": from_email or self.default_from},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html_content}],
                    "reply_to": {"email": reply_to} if reply_to else None,
                },
            )

            if response.status_code == 202:
                return {"success": True}
            else:
                return {"success": False, "error": response.text}


class EmailService:
    """Email service with templating and batching."""

    def __init__(self, provider: str = "resend"):
        if provider == "resend" or provider == "NOT_CONFIGURED":
            self.provider = ResendProvider()
        elif provider == "sendgrid":
            self.provider = SendGridProvider()
        else:
            raise ValueError(f"Unknown email provider: {provider}")

    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        from_email: str = None,
        reply_to: str = None,
    ) -> Dict[str, Any]:
        """Send a single email."""
        return await self.provider.send_email(to, subject, html_content, from_email, reply_to)

    async def send_template_email(
        self,
        to: str,
        subject: str,
        template_name: str,
        template_data: Dict[str, Any],
        from_email: str = None,
    ) -> Dict[str, Any]:
        """Send an email using a template."""
        html_content = self.render_template(template_name, template_data)
        return await self.send_email(to, subject, html_content, from_email)

    def render_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """Render an email template."""
        template_content = self.get_template(template_name)
        template = Template(template_content)
        return template.render(**data)

    def get_template(self, name: str) -> str:
        """Get email template by name."""
        templates = {
            "welcome": """
                <h1>Welcome to Business Bridge, {{ user_name }}!</h1>
                <p>Thank you for joining the global marketplace for online business acquisitions.</p>
                <p>Get started by:</p>
                <ul>
                    <li>Browsing verified listings</li>
                    <li>Setting up your buyer or seller profile</li>
                    <li>Connecting with our AI broker for personalized matches</li>
                </ul>
                <a href="{{ dashboard_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a>
            """,
            "verify_email": """
                <h1>Verify Your Email</h1>
                <p>Hi {{ user_name }},</p>
                <p>Please verify your email address to complete your registration:</p>
                <a href="{{ verification_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
                <p>This link expires in 24 hours.</p>
            """,
            "new_offer": """
                <h1>New Offer Received</h1>
                <p>Hi {{ seller_name }},</p>
                <p>You received an offer on your listing <strong>{{ listing_title }}</strong>:</p>
                <ul>
                    <li><strong>Amount:</strong> {{ offer_amount }} {{ currency }}</li>
                    <li><strong>From:</strong> {{ buyer_name }}</li>
                </ul>
                <a href="{{ offer_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Offer</a>
            """,
            "offer_accepted": """
                <h1>Your Offer Was Accepted!</h1>
                <p>Hi {{ buyer_name }},</p>
                <p>Great news! Your offer on <strong>{{ listing_title }}</strong> has been accepted.</p>
                <p><strong>Next steps:</strong></p>
                <ol>
                    <li>Complete payment to fund escrow</li>
                    <li>Access your deal room to track progress</li>
                    <li>Review asset transfer checklist</li>
                </ol>
                <a href="{{ deal_room_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Deal Room</a>
            """,
            "payment_confirmed": """
                <h1>Payment Confirmed</h1>
                <p>Hi {{ user_name }},</p>
                <p>Your payment of <strong>{{ amount }} {{ currency }}</strong> has been confirmed and secured in escrow.</p>
                <p>The seller will now proceed with asset transfer.</p>
                <a href="{{ transaction_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Transaction</a>
            """,
            "new_message": """
                <h1>New Message</h1>
                <p>Hi {{ user_name }},</p>
                <p><strong>{{ sender_name }}</strong> sent you a message regarding <strong>{{ subject }}</strong>:</p>
                <blockquote style="border-left: 3px solid #0066cc; padding-left: 16px; color: #666;">
                    {{ message_preview }}
                </blockquote>
                <a href="{{ message_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reply</a>
            """,
            "milestone_completed": """
                <h1>Milestone Completed</h1>
                <p>Hi {{ user_name }},</p>
                <p>A milestone was completed in your deal for <strong>{{ listing_title }}</strong>:</p>
                <p><strong>{{ milestone_title }}</strong></p>
                <a href="{{ deal_room_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Deal Room</a>
            """,
            "funds_released": """
                <h1>Funds Released</h1>
                <p>Hi {{ seller_name }},</p>
                <p>Great news! Your payment of <strong>{{ amount }} {{ currency }}</strong> has been released from escrow.</p>
                <p>Funds will arrive in your account within 2-5 business days.</p>
                <a href="{{ payout_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Payout Details</a>
            """,
            "saved_search_alert": """
                <h1>New Listings Match Your Search</h1>
                <p>Hi {{ user_name }},</p>
                <p>{{ count }} new listings match your saved search <strong>{{ search_name }}</strong>:</p>
                <ul>
                {% for listing in listings %}
                    <li><strong>{{ listing.title }}</strong> - {{ listing.price }}</li>
                {% endfor %}
                </ul>
                <a href="{{ marketplace_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Listings</a>
            """,
            "new_nda_request": """
                <h1>New Confidential Access Request</h1>
                <p>Hi {{ seller_name }},</p>
                <p><strong>{{ buyer_name }}</strong> has signed the NDA for <strong>{{ listing_title }}</strong> and is requesting access to your confidential Data Room.</p>
                <a href="{{ review_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Request</a>
            """,
            "access_approved": """
                <h1>Confidential Access Approved!</h1>
                <p>Hi {{ buyer_name }},</p>
                <p>Great news! Your request to access the confidential Data Room for <strong>{{ listing_title }}</strong> has been approved by the seller.</p>
                <p>You can now view sensitive financials and operational documents.</p>
                <a href="{{ data_room_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Open Data Room</a>
            """,
            "access_rejected": """
                <h1>Data Access Request Update</h1>
                <p>Hi {{ buyer_name }},</p>
                <p>The seller has declined your request to access the confidential Data Room for <strong>{{ listing_title }}</strong>.</p>
                {% if reason %}
                <p><strong>Reason provided:</strong> {{ reason }}</p>
                {% endif %}
                <a href="{{ listing_url }}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Return to Listing</a>
            """,
        }
        return templates.get(name, "<p>Email template not found.</p>")

    async def send_batch(self, emails: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Send multiple emails (for bulk notifications)."""
        results = []
        for email in emails:
            result = await self.send_email(
                to=email["to"],
                subject=email["subject"],
                html_content=email.get("html_content") or self.render_template(
                    email["template_name"],
                    email["template_data"]
                ),
            )
            results.append(result)
        return results


# Global instance
email_service = EmailService(provider=settings.EMAIL_PROVIDER or "resend")
