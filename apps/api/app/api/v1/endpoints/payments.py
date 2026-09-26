from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.payment import payment_orchestrator
from app.services.transaction_service import TransactionService
from app.models.domain import Transaction, DealRoom, DealMilestone, DealMilestoneStatus, User
from app.api import deps
from uuid import UUID
from decimal import Decimal
import json

router = APIRouter()


@router.post("/create-checkout")
async def create_checkout_session(
    transaction_id: UUID,
    provider: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a payment checkout session for a transaction."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can initiate payment")

    # Create checkout session
    session = await payment_orchestrator.create_checkout(
        amount=transaction.amount,
        currency=transaction.currency.value,
        metadata={
            "transaction_id": str(transaction.id),
            "listing_id": str(transaction.listing_id),
            "buyer_id": str(transaction.buyer_id),
            "email": current_user.email,
            "description": f"Business acquisition payment - Transaction {transaction.id}",
        },
        success_url=f"{settings.FRONTEND_URL}/dashboard/transactions/{transaction.id}?payment=success",
        cancel_url=f"{settings.FRONTEND_URL}/dashboard/transactions/{transaction.id}?payment=cancelled",
        provider=provider,
    )

    # Update transaction with provider info
    txn_service = TransactionService(db)
    txn_service.initiate_payment(
        transaction_id=transaction.id,
        provider=session["provider"],
        provider_id=session["session_id"],
    )

    return session


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """Receive and process Stripe webhook events."""
    payload = await request.body()

    # Verify webhook signature
    provider = payment_orchestrator.get_provider("stripe")
    event = await provider.verify_webhook(payload, stripe_signature)

    if not event:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # SECURITY FIX: Replay Protection (Phase 15/16)
    from app.models.security import WebhookEvent
    existing = db.query(WebhookEvent).filter(
        WebhookEvent.provider == "stripe",
        WebhookEvent.provider_event_id == event["id"]
    ).first()
    if existing:
        return {"status": "already_processed"}

    # Handle event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        transaction_id_str = session.get("metadata", {}).get("transaction_id")

        if transaction_id_str:
            transaction_id = UUID(transaction_id_str)
            txn_service = TransactionService(db)

            # Confirm payment
            txn_service.confirm_payment(
                transaction_id=transaction_id,
                provider_reference=session["payment_intent"],
            )

            # Record event
            webhook_log = WebhookEvent(
                provider="stripe",
                provider_event_id=event["id"],
                event_type=event["type"],
                transaction_id=transaction_id,
                payload_preview=json.dumps(session)[:1000]
            )
            db.add(webhook_log)
            db.commit()

    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        transaction_id = payment_intent.get("metadata", {}).get("transaction_id")
        # Notify buyer logic...

    return {"status": "success"}


@router.post("/webhook/paystack")
async def paystack_webhook(
    request: Request,
    x_paystack_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """Receive and process Paystack webhook events."""
    payload = await request.body()

    # Verify webhook signature
    provider = payment_orchestrator.get_provider("paystack")
    event = await provider.verify_webhook(payload, x_paystack_signature)

    if not event:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # SECURITY FIX: Replay Protection
    from app.models.security import WebhookEvent
    event_id = event.get("data", {}).get("id") or event.get("reference") # Paystack event id
    if not event_id:
        raise HTTPException(status_code=400, detail="Missing event reference")

    existing = db.query(WebhookEvent).filter(
        WebhookEvent.provider == "paystack",
        WebhookEvent.provider_event_id == str(event_id)
    ).first()
    if existing:
        return {"status": "already_processed"}

    # Handle event
    if event.get("event") == "charge.success":
        data = event.get("data", {})
        metadata = data.get("metadata", {})
        transaction_id_str = metadata.get("transaction_id")

        if transaction_id_str:
            transaction_id = UUID(transaction_id_str)
            txn_service = TransactionService(db)

            # Confirm payment
            txn_service.confirm_payment(
                transaction_id=transaction_id,
                provider_reference=data["reference"],
            )

            # Record event
            webhook_log = WebhookEvent(
                provider="paystack",
                provider_event_id=str(event_id),
                event_type=event["event"],
                transaction_id=transaction_id,
                payload_preview=json.dumps(data)[:1000]
            )
            db.add(webhook_log)
            db.commit()

    return {"status": "success"}


@router.post("/transactions/{transaction_id}/release")
def release_transaction_funds(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    SECURE: Release funds with proper authorization and business rules.
    Fixed: Unauthorized fund release vulnerability.
    """
    from app.services.audit import audit_logger

    # Lock transaction to prevent race conditions
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).with_for_update().first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Check user authorization
    user_roles = [r.role for r in current_user.roles]
    is_admin = any(role.value in ['ADMIN', 'SUPER_ADMIN'] for role in user_roles)
    is_buyer = transaction.buyer_id == current_user.id

    if not (is_buyer or is_admin):
        audit_logger.log_security_event(
            event_type="UNAUTHORIZED_FUND_RELEASE_ATTEMPT",
            user_id=current_user.id,
            severity="HIGH",
            metadata={"transaction_id": str(transaction_id)}
        )
        raise HTTPException(status_code=403, detail="Not authorized to release funds")

    # Validate transaction state
    if transaction.status.value != "FUNDS_IN_ESCROW":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot release funds: transaction status is {transaction.status.value}"
        )

    # Check all milestones completed
    deal_room = db.query(DealRoom).filter(
        DealRoom.offer_id == transaction.offer_id
    ).first()

    if deal_room:
        pending_milestones = db.query(DealMilestone).filter(
            DealMilestone.deal_room_id == deal_room.id,
            DealMilestone.status != DealMilestoneStatus.COMPLETED
        ).count()

        if pending_milestones > 0 and not is_admin:
            raise HTTPException(
                status_code=400,
                detail=f"{pending_milestones} milestone(s) must be completed before releasing funds"
            )

    # Check inspection period (7 days default)
    if transaction.created_at:
        from datetime import datetime
        days_elapsed = (datetime.utcnow() - transaction.created_at).days
        if days_elapsed < 7 and not is_admin:
            raise HTTPException(
                status_code=400,
                detail=f"Inspection period not expired ({7 - days_elapsed} days remaining)"
            )

    # Check no active disputes
    from app.models.security import Dispute
    active_dispute = db.query(Dispute).filter(
        Dispute.transaction_id == transaction.id,
        Dispute.status.in_(["OPEN", "UNDER_REVIEW"])
    ).first()

    if active_dispute:
        raise HTTPException(
            status_code=400,
            detail="Cannot release funds: active dispute exists"
        )

    # Audit log with admin override tracking
    audit_logger.log_financial_event(
        event_type="FUNDS_RELEASED",
        user_id=current_user.id,
        transaction_id=transaction.id,
        amount=float(transaction.amount),
        metadata={
            "admin_override": is_admin and not is_buyer,
            "pending_milestones_count": pending_milestones if deal_room else 0
        }
    )

    # Release funds through secure service
    txn_service = TransactionService(db)
    updated_txn = txn_service.release_funds(transaction_id)

    return {
        "message": "Funds released successfully",
        "transaction": updated_txn,
        "released_amount": float(transaction.seller_proceeds) if hasattr(transaction, 'seller_proceeds') else float(transaction.amount)
    }


@router.post("/transactions/{transaction_id}/refund")
def refund_transaction(
    transaction_id: UUID,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    SECURE: Refund with proper authorization.
    Fixed: Unauthorized refund vulnerability.
    """
    from app.services.audit import audit_logger
    from app.models.security import RefundAgreement

    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).with_for_update().first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Check authorization
    user_roles = [r.role for r in current_user.roles]
    is_admin = any(role.value in ['ADMIN', 'SUPER_ADMIN'] for role in user_roles)

    if not is_admin:
        # Check mutual refund agreement exists
        from datetime import datetime
        refund_agreement = db.query(RefundAgreement).filter(
            RefundAgreement.transaction_id == transaction_id,
            RefundAgreement.buyer_agreed == True,
            RefundAgreement.seller_agreed == True,
            RefundAgreement.expires_at > datetime.utcnow()
        ).first()

        if not refund_agreement:
            audit_logger.log_security_event(
                event_type="UNAUTHORIZED_REFUND_ATTEMPT",
                user_id=current_user.id,
                severity="HIGH",
                metadata={"transaction_id": str(transaction_id)}
            )
            raise HTTPException(
                status_code=403,
                detail="Refund requires both parties' agreement or admin approval"
            )

    # Validate refund is possible
    valid_statuses = ["FUNDS_IN_ESCROW", "DISPUTED"]
    if transaction.status.value not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot refund transaction in {transaction.status.value} status"
        )

    # Audit log
    audit_logger.log_financial_event(
        event_type="REFUND_INITIATED",
        user_id=current_user.id,
        transaction_id=transaction.id,
        amount=float(transaction.amount),
        metadata={
            "reason": reason,
            "admin_initiated": is_admin,
            "original_status": transaction.status.value
        }
    )

    # Process refund
    txn_service = TransactionService(db)
    updated_txn = txn_service.refund_payment(transaction_id, reason)

    return {
        "message": "Refund processed successfully",
        "transaction": updated_txn,
        "refund_amount": float(transaction.amount)
    }


@router.get("/transactions/{transaction_id}/ledger")
def get_transaction_ledger(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get complete ledger history for a transaction."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    txn_service = TransactionService(db)
    ledger = txn_service.get_transaction_history(transaction_id)

    return {"transaction_id": transaction_id, "ledger": ledger}


@router.post("/connect/stripe/create")
async def create_stripe_connect_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a Stripe Connect account for seller payouts."""
    provider = payment_orchestrator.get_provider("stripe")

    result = await provider.create_connected_account(
        email=current_user.email,
        country="US",  # TODO: Get from user profile
    )

    # Store account_id in user's seller_profile
    # TODO: Update SellerProfile with stripe_account_id

    return result


@router.post("/connect/paystack/create")
async def create_paystack_recipient(
    account_number: str,
    bank_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a Paystack transfer recipient for seller payouts."""
    provider = payment_orchestrator.get_provider("paystack")

    result = await provider.create_transfer_recipient(
        account_number=account_number,
        bank_code=bank_code,
        name=current_user.full_name,
        currency="NGN",
    )

    # Store recipient_code in user's seller_profile
    # TODO: Update SellerProfile with paystack_recipient_code

    return result
