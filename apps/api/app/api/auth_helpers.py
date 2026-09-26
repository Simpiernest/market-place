"""
Enhanced authorization and security utilities.
Implements resource ownership validation and authorization checks.
"""

from typing import Optional, List, Callable
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.domain import (
    User, UserRole, Listing, Transaction, Offer, Document,
    DealRoom, DealMilestone, DataAccessRequest, DataAccessRequestStatus
)
from app.api.deps import get_current_user


class ResourceOwnershipValidator:
    """Validates resource ownership and access permissions."""

    @staticmethod
    def validate_listing_ownership(
        listing_id: UUID,
        user: User,
        db: Session
    ) -> "Listing":
        """Validate user owns the listing."""
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        if listing.seller_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not own this listing"
            )

        # Verify user has SELLER role
        user_roles = [r.role for r in user.roles]
        if UserRole.SELLER not in user_roles and UserRole.SUPER_ADMIN not in user_roles:
            raise HTTPException(
                status_code=403,
                detail="Seller role required to modify listings"
            )

        return listing

    @staticmethod
    def validate_transaction_participant(
        transaction_id: UUID,
        user: User,
        db: Session
    ) -> "Transaction":
        """Validate user is participant in transaction."""
        txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Check if user is buyer or seller
        if user.id not in [txn.buyer_id, txn.seller_id]:
            # Check for admin role
            user_roles = [r.role for r in user.roles]
            if UserRole.ADMIN not in user_roles and UserRole.SUPER_ADMIN not in user_roles:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to access this transaction"
                )

        return txn

    @staticmethod
    def validate_offer_owner(
        offer_id: UUID,
        user: User,
        db: Session,
        must_be_seller: bool = False
    ) -> "Offer":
        """Validate user is involved in the offer."""
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")

        if must_be_seller:
            if offer.seller_id != user.id:
                raise HTTPException(
                    status_code=403,
                    detail="Only the seller can respond to this offer"
                )
        else:
            if user.id not in [offer.buyer_id, offer.seller_id]:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to access this offer"
                )

        return offer

    @staticmethod
    def validate_document_access(
        document_id: UUID,
        user: User,
        db: Session
    ) -> "Document":
        """Validate user can access document."""
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Public documents accessible to all
        if doc.is_public:
            return doc

        # Owner always has access
        if doc.uploader_id == user.id:
            return doc

        # Check listing ownership
        if doc.listing_id:
            listing = db.query(Listing).filter(Listing.id == doc.listing_id).first()
            if listing and listing.seller_id == user.id:
                return doc

            # Check Data Access Request status
            if doc.requires_nda and listing:
                request = db.query(DataAccessRequest).filter(
                    DataAccessRequest.listing_id == listing.id,
                    DataAccessRequest.buyer_id == user.id,
                    DataAccessRequest.status == DataAccessRequestStatus.APPROVED
                ).first()
                if request:
                    return doc

            # Check if user has active deal/transaction for this listing
            transaction = db.query(Transaction).filter(
                Transaction.listing_id == doc.listing_id,
                Transaction.buyer_id == user.id
            ).first()
            if transaction:
                return doc

        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this document"
        )

    @staticmethod
    def validate_milestone_authority(
        transaction_id: UUID,
        milestone_id: UUID,
        user: User,
        db: Session
    ) -> tuple["Transaction", "DealMilestone"]:
        """Validate user can complete this milestone."""
        # Get transaction
        txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Get deal room
        deal_room = db.query(DealRoom).filter(DealRoom.offer_id == txn.offer_id).first()
        if not deal_room:
            raise HTTPException(status_code=404, detail="Deal room not found")

        # Get milestone
        milestone = db.query(DealMilestone).filter(
            DealMilestone.id == milestone_id,
            DealMilestone.deal_room_id == deal_room.id
        ).first()
        if not milestone:
            raise HTTPException(status_code=404, detail="Milestone not found")

        # Validate user is participant
        if user.id not in [txn.buyer_id, txn.seller_id]:
            user_roles = [r.role for r in user.roles]
            if UserRole.ADMIN not in user_roles and UserRole.SUPER_ADMIN not in user_roles:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to complete this milestone"
                )

        # Milestone-specific authorization rules
        milestone_rules = {
            "Due Diligence": [txn.buyer_id],  # Only buyer completes
            "Asset Purchase Agreement": [txn.buyer_id, txn.seller_id],  # Both must sign
            "Escrow Funding": [txn.buyer_id],  # Only buyer funds
            "Asset Transfer": [txn.seller_id],  # Only seller transfers
            "Closing": [txn.buyer_id, txn.seller_id],  # Both confirm
        }

        if milestone.title in milestone_rules:
            allowed_users = milestone_rules[milestone.title]
            if user.id not in allowed_users:
                # Allow admins to override
                user_roles = [r.role for r in user.roles]
                if UserRole.SUPER_ADMIN not in user_roles:
                    raise HTTPException(
                        status_code=403,
                        detail=f"You are not authorized to complete the '{milestone.title}' milestone"
                    )

        return txn, milestone


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """Dependency that requires specific roles."""
    def role_checker(user: User = Depends(get_current_user)):
        user_roles = [r.role for r in user.roles]

        # Super admin always has access
        if UserRole.SUPER_ADMIN in user_roles:
            return user

        # Check if user has any of the allowed roles
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required roles: {[r.value for r in allowed_roles]}"
            )

        return user

    return role_checker
