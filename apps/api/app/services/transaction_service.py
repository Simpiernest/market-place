"""Transaction management and ledger service."""

from uuid import UUID
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from typing import Optional

from app.models.domain import (
    Transaction,
    TransactionStatus,
    LedgerEntry,
    LedgerEntryType,
    DealMilestone,
    DealMilestoneStatus,
    Currency,
)
from app.services.notifications import NotificationService


class TransactionService:
    """Service for managing transactions and ledger entries."""

    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

    def create_transaction(
        self,
        listing_id: UUID,
        buyer_id: UUID,
        seller_id: UUID,
        offer_id: UUID,
        amount: Decimal,
        currency: Currency,
        commission_rate: Decimal,
    ) -> Transaction:
        """Create a new transaction."""
        commission_amount = amount * commission_rate
        seller_proceeds = amount - commission_amount

        transaction = Transaction(
            listing_id=listing_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
            offer_id=offer_id,
            amount=amount,
            currency=currency,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            seller_proceeds=seller_proceeds,
            status=TransactionStatus.DRAFT,
        )

        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)

        return transaction

    def initiate_payment(
        self,
        transaction_id: UUID,
        provider: str,
        provider_id: str,
    ) -> Transaction:
        """Mark transaction as payment initiated."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")

        transaction.status = TransactionStatus.DRAFT
        transaction.payment_provider = provider
        transaction.payment_provider_id = provider_id

        # Create ledger entry for payment initiation
        ledger_entry = LedgerEntry(
            transaction_id=transaction.id,
            entry_type=LedgerEntryType.PAYMENT_RECEIVED,
            amount=transaction.amount,
            currency=transaction.currency,
            provider_reference=provider_id,
            description=f"Payment initiated via {provider}",
            metadata_json={"provider": provider, "status": "initiated"},
        )
        self.db.add(ledger_entry)

        self.db.commit()
        self.db.refresh(transaction)

        # Notify seller
        self.notification_service.create_notification(
            user_id=transaction.seller_id,
            type="PAYMENT_INITIATED",
            title="Payment Initiated",
            content=f"Buyer has initiated payment of {transaction.amount} {transaction.currency.value}.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        return transaction

    def confirm_payment(
        self,
        transaction_id: UUID,
        provider_reference: str,
    ) -> Transaction:
        """Confirm payment has been received (escrow funded)."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")

        transaction.status = TransactionStatus.ESCROW_FUNDED

        # Create ledger entry for confirmed payment
        ledger_entry = LedgerEntry(
            transaction_id=transaction.id,
            entry_type=LedgerEntryType.ESCROW_DEPOSIT,
            amount=transaction.amount,
            currency=transaction.currency,
            provider_reference=provider_reference,
            description="Payment confirmed and held in escrow",
            metadata_json={"status": "confirmed"},
        )
        self.db.add(ledger_entry)

        self.db.commit()
        self.db.refresh(transaction)

        # Notify both parties
        self.notification_service.create_notification(
            user_id=transaction.buyer_id,
            type="PAYMENT_CONFIRMED",
            title="Payment Confirmed",
            content="Your payment is confirmed and held securely in escrow.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        self.notification_service.create_notification(
            user_id=transaction.seller_id,
            type="PAYMENT_CONFIRMED",
            title="Payment Confirmed",
            content="Buyer's payment is confirmed. Proceed with asset transfer.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        return transaction

    async def complete_milestone(
        self,
        transaction_id: UUID,
        milestone_id: UUID,
    ) -> DealMilestone:
        """Mark a milestone as completed and potentially release funds."""
        milestone = self.db.query(DealMilestone).filter(DealMilestone.id == milestone_id).first()
        if not milestone:
            raise ValueError("Milestone not found")

        milestone.status = DealMilestoneStatus.COMPLETED
        milestone.completed_at = datetime.utcnow()

        # Check if this was the inspection milestone
        if milestone.title.upper() == "INSPECTION PERIOD" or milestone.title.upper() == "ASSET VERIFICATION":
            # If everything is verified, release funds
            self.release_funds(transaction_id)

        self.db.commit()
        self.db.refresh(milestone)

        return milestone

    def release_funds(
        self,
        transaction_id: UUID,
    ) -> Transaction:
        """Release funds from escrow to seller."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")

        if transaction.status != TransactionStatus.ESCROW_FUNDED:
            raise ValueError(f"Cannot release funds. Transaction status: {transaction.status.value}")

        transaction.status = TransactionStatus.COMPLETED

        # Create ledger entries for fund distribution
        # Platform commission
        commission_entry = LedgerEntry(
            transaction_id=transaction.id,
            entry_type=LedgerEntryType.PLATFORM_FEE,
            amount=transaction.commission_amount,
            currency=transaction.currency,
            description="Platform commission",
            metadata_json={"rate": str(transaction.commission_rate)},
        )
        self.db.add(commission_entry)

        # Seller payout
        payout_entry = LedgerEntry(
            transaction_id=transaction.id,
            entry_type=LedgerEntryType.SELLER_PAYOUT,
            amount=transaction.seller_proceeds,
            currency=transaction.currency,
            description="Seller proceeds released from escrow",
            metadata_json={"status": "released"},
        )
        self.db.add(payout_entry)

        self.db.commit()
        self.db.refresh(transaction)

        # Notify both parties
        self.notification_service.create_notification(
            user_id=transaction.seller_id,
            type="FUNDS_RELEASED",
            title="Funds Released",
            content=f"Your payment of {transaction.seller_proceeds} {transaction.currency.value} has been released.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        self.notification_service.create_notification(
            user_id=transaction.buyer_id,
            type="TRANSACTION_COMPLETED",
            title="Transaction Completed",
            content="The transaction has been completed successfully.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        return transaction

    def refund_payment(
        self,
        transaction_id: UUID,
        reason: str,
    ) -> Transaction:
        """Refund payment to buyer (if deal falls through)."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")

        if transaction.status not in [TransactionStatus.DRAFT, TransactionStatus.ESCROW_FUNDED]:
            raise ValueError(f"Cannot refund. Transaction status: {transaction.status.value}")

        transaction.status = TransactionStatus.REFUNDED

        # Create ledger entry for refund
        refund_entry = LedgerEntry(
            transaction_id=transaction.id,
            entry_type=LedgerEntryType.REFUND,
            amount=transaction.amount,
            currency=transaction.currency,
            description=f"Refund: {reason}",
            metadata_json={"reason": reason},
        )
        self.db.add(refund_entry)

        self.db.commit()
        self.db.refresh(transaction)

        # Notify both parties
        self.notification_service.create_notification(
            user_id=transaction.buyer_id,
            type="REFUND_PROCESSED",
            title="Refund Processed",
            content=f"Your payment of {transaction.amount} {transaction.currency.value} has been refunded.",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        self.notification_service.create_notification(
            user_id=transaction.seller_id,
            type="TRANSACTION_REFUNDED",
            title="Transaction Refunded",
            content=f"Transaction has been refunded. Reason: {reason}",
            link=f"/dashboard/transactions/{transaction.id}",
            metadata={"transaction_id": str(transaction.id)},
        )

        return transaction

    def get_transaction_history(self, transaction_id: UUID) -> list[LedgerEntry]:
        """Get all ledger entries for a transaction."""
        return (
            self.db.query(LedgerEntry)
            .filter(LedgerEntry.transaction_id == transaction_id)
            .order_by(LedgerEntry.created_at)
            .all()
        )
