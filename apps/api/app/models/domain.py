"""
Business Bridge Database Models
Core domain models for Business Bridge marketplace.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# Enums
class UserRole(str, enum.Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    BROKER = "BROKER"
    INSTITUTIONAL_BUYER = "INSTITUTIONAL_BUYER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"
    SUPPORT = "SUPPORT"
    REVIEWER = "REVIEWER"
    COMPLIANCE = "COMPLIANCE"


class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    ACTIVE = "ACTIVE"
    UNDER_CONTRACT = "UNDER_CONTRACT"
    SOLD = "SOLD"
    EXPIRED = "EXPIRED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
    ARCHIVED = "ARCHIVED"


class VerificationStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"

class VerificationCategory(str, enum.Enum):
    IDENTITY = "IDENTITY"
    BUSINESS = "BUSINESS"
    PROFESSIONAL = "PROFESSIONAL"
    BUYER = "BUYER"
    SELLER = "SELLER"
    PROOF_OF_FUNDS = "PROOF_OF_FUNDS"
    ASSET_OWNERSHIP = "ASSET_OWNERSHIP"
    FINANCIAL = "FINANCIAL"
    TRAFFIC = "TRAFFIC"
    TECHNICAL = "TECHNICAL"


class OfferStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    VIEWED = "VIEWED"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"
    EXPIRED = "EXPIRED"


class TransactionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    OFFER_PENDING = "OFFER_PENDING"
    OFFER_ACCEPTED = "OFFER_ACCEPTED"
    DUE_DILIGENCE = "DUE_DILIGENCE"
    AGREEMENT_PENDING = "AGREEMENT_PENDING"
    AGREEMENT_SIGNED = "AGREEMENT_SIGNED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING"
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"
    TRANSFER_PENDING = "TRANSFER_PENDING"
    TRANSFER_IN_PROGRESS = "TRANSFER_IN_PROGRESS"
    INSPECTION = "INSPECTION"
    ACCEPTED = "ACCEPTED"
    DISPUTED = "DISPUTED"
    PAYOUT_PENDING = "PAYOUT_PENDING"
    PAYOUT_PROCESSING = "PAYOUT_PROCESSING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class PayoutStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    WAITING_FOR_BUYER = "WAITING_FOR_BUYER"
    WAITING_FOR_SELLER = "WAITING_FOR_SELLER"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class Currency(str, enum.Enum):
    USD = "USD"
    GHS = "GHS"
    GBP = "GBP"
    EUR = "EUR"
    CAD = "CAD"
    AUD = "AUD"


class DealStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    AGREEMENT_PENDING = "AGREEMENT_PENDING"
    FUNDING = "FUNDING"
    FUNDED = "FUNDED"
    TRANSFER_IN_PROGRESS = "TRANSFER_IN_PROGRESS"
    INSPECTION = "INSPECTION"
    ACCEPTED = "ACCEPTED"
    DISPUTED = "DISPUTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class DealMilestoneStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    CANCELLED = "CANCELLED"


class OrganizationRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class LedgerEntryType(str, enum.Enum):
    BUYER_PAYMENT = "BUYER_PAYMENT"
    COMMISSION = "COMMISSION"
    SELLER_PROCEEDS = "SELLER_PROCEEDS"
    FEE = "FEE"
    REFUND = "REFUND"
    PAYOUT = "PAYOUT"


class ListingVisibility(str, enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    UNLISTED = "UNLISTED"

class SaleType(str, enum.Enum):
    BUY_NOW = "BUY_NOW"
    AUCTION = "AUCTION"
    NEGOTIATION = "NEGOTIATION"

class ListingVettingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    AUTOMATED_REVIEW = "AUTOMATED_REVIEW"
    HUMAN_REVIEW = "HUMAN_REVIEW"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    SUSPENDED = "SUSPENDED"
    SOLD = "SOLD"
    ARCHIVED = "ARCHIVED"
    REJECTED = "REJECTED"

class BuyerTier(str, enum.Enum):
    BASIC = "BASIC"
    VERIFIED = "VERIFIED"
    FUNDED = "FUNDED"
    TRUSTED = "TRUSTED"


class DataAccessRequestStatus(str, enum.Enum):
    PENDING_NDA = "PENDING_NDA"
    NDA_SIGNED = "NDA_SIGNED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    PENDING_SELLER_REVIEW = "PENDING_SELLER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


# Base mixin for common fields
class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)


# Identity Domain
class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    phone_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    @property
    def bio(self) -> Optional[str]:
        return self.profile.bio if self.profile else None

    roles = relationship("UserRoleMapping", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)
    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)
    broker_profile = relationship("BrokerProfile", back_populates="user", uselist=False)
    mandates = relationship("BuyerMandate", back_populates="user")
    saved_searches = relationship("SavedSearch", back_populates="user")
    verifications = relationship("UserVerification", back_populates="user")


class UserRoleMapping(Base, TimestampMixin):
    __tablename__ = "user_role_mappings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    user = relationship("User", back_populates="roles")

    __table_args__ = (
        UniqueConstraint("user_id", "role", name="uq_user_role"),
        Index("idx_user_roles_user_id", "user_id"),
    )

class UserVerification(Base, TimestampMixin):
    __tablename__ = "user_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(Enum(VerificationCategory), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.NOT_STARTED, nullable=False)
    evidence = Column(JSONB, nullable=True) # URLs to documents or provider IDs
    verified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    metadata_json = Column(JSONB, nullable=True)

    user = relationship("User", back_populates="verifications")

    __table_args__ = (
        UniqueConstraint("user_id", "category", name="uq_user_verification_category"),
    )


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    country = Column(String(2), nullable=True)
    timezone = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    # Extended Settings (Phase 24)
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    login_notifications = Column(Boolean, default=True, nullable=False)
    notification_preferences = Column(JSONB, default=lambda: {
        "email": True, "messages": True, "offers": True, "price_changes": False, "system_updates": False
    }, nullable=False)
    privacy_settings = Column(JSONB, default=lambda: {
        "profile_visibility": "Only Verified Buyers", "show_activity": True, "data_sharing": True, "marketing": False
    }, nullable=False)
    preferred_currency = Column(String(10), default="USD", nullable=False)
    language = Column(String(10), default="en-US", nullable=False)

    user = relationship("User", back_populates="profile")


class UserSession(Base, TimestampMixin):
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False)
    device_info = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    location = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User")

    __table_args__ = (
        Index("idx_user_sessions_user_id", "user_id"),
        Index("idx_user_sessions_active", "user_id", "is_active"),
    )


class Organization(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)

    members = relationship("OrganizationMember", back_populates="organization")


class OrganizationMember(Base, TimestampMixin):
    __tablename__ = "organization_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(OrganizationRole), default=OrganizationRole.MEMBER, nullable=False)

    organization = relationship("Organization", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user"),
    )


# Marketplace Domain
class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    listings = relationship("Listing", back_populates="category")


class Industry(Base, TimestampMixin):
    __tablename__ = "industries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)


class Business(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "businesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    website_url = Column(String(500), nullable=True)
    established_date = Column(DateTime, nullable=True)

    annual_revenue = Column(Numeric(20, 2), nullable=True)
    monthly_revenue = Column(Numeric(20, 2), nullable=True)
    annual_profit = Column(Numeric(20, 2), nullable=True)
    monthly_profit = Column(Numeric(20, 2), nullable=True)
    revenue_currency = Column(Enum(Currency), default=Currency.USD, nullable=False)

    monthly_traffic = Column(Integer, nullable=True)
    customer_count = Column(Integer, nullable=True)
    team_size = Column(Integer, nullable=True)

    business_model = Column(String(100), nullable=True)
    monetization_model = Column(String(100), nullable=True)
    revenue_type = Column(String(50), nullable=True)

    technology_stack = Column(JSONB, nullable=True)
    hosting_platform = Column(String(100), nullable=True)

    owner_involvement_hours = Column(Integer, nullable=True)
    time_commitment = Column(String(50), nullable=True)

    revenue_growth_rate = Column(Numeric(5, 2), nullable=True)
    profit_margin = Column(Numeric(5, 2), nullable=True)

    location = Column(String(255), nullable=True)
    country = Column(String(2), nullable=True)

    listings = relationship("Listing", back_populates="business")

    __table_args__ = (
        Index("idx_businesses_owner_id", "owner_id"),
    )


class ValuationInput(Base, TimestampMixin):
    __tablename__ = "valuation_inputs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    data = Column(JSONB, nullable=False)  # Raw inputs like LTM revenue, profit, etc.
    calculated_valuation = Column(Numeric(20, 2), nullable=True)
    currency = Column(Enum(Currency), default=Currency.USD, nullable=False)

    business = relationship("Business")


class ValuationComparable(Base, TimestampMixin):
    __tablename__ = "valuation_comparables"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    valuation_input_id = Column(UUID(as_uuid=True), ForeignKey("valuation_inputs.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)

    match_score = Column(Numeric(5, 4), nullable=True)
    reasoning = Column(Text, nullable=True)


class Listing(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    highlights = Column(JSONB, nullable=True)

    asking_price = Column(Numeric(20, 2), nullable=False)
    price_currency = Column(Enum(Currency), default=Currency.USD, nullable=False)
    negotiable = Column(Boolean, default=True, nullable=False)

    reason_for_sale = Column(Text, nullable=True)
    included_assets = Column(JSONB, nullable=True)
    excluded_assets = Column(JSONB, nullable=True)

    status = Column(Enum(ListingVettingStatus), default=ListingVettingStatus.DRAFT, nullable=False)
    visibility = Column(Enum(ListingVisibility), default=ListingVisibility.PUBLIC, nullable=False)
    sale_type = Column(Enum(SaleType), default=SaleType.NEGOTIATION, nullable=False)

    # Auction Specifics
    starting_price = Column(Numeric(20, 2), nullable=True)
    reserve_price = Column(Numeric(20, 2), nullable=True)
    current_bid = Column(Numeric(20, 2), nullable=True)
    bid_count = Column(Integer, default=0, nullable=False)
    auction_ends_at = Column(DateTime, nullable=True)

    # Access Policy Configuration
    require_nda = Column(Boolean, default=True, nullable=False)
    require_identity_verification = Column(Boolean, default=True, nullable=False)
    require_proof_of_funds = Column(Boolean, default=False, nullable=False)
    require_seller_approval = Column(Boolean, default=True, nullable=False)
    require_verified_buyer = Column(Boolean, default=False, nullable=False)
    access_policy = Column(JSONB, nullable=True) # Granular field-level access levels

    is_featured = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    published_at = Column(DateTime, nullable=True)
    contracted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)

    view_count = Column(Integer, default=0, nullable=False)
    save_count = Column(Integer, default=0, nullable=False)
    inquiry_count = Column(Integer, default=0, nullable=False)

    # PostgreSQL full-text search vector
    search_vector = Column("search_vector", TSVECTOR, nullable=True)

    business = relationship("Business", back_populates="listings")
    category = relationship("Category", back_populates="listings")
    media = relationship("ListingMedia", back_populates="listing")
    saved_by = relationship("SavedListing", back_populates="listing")
    documents = relationship("Document", back_populates="listing")
    nda = relationship("NDA", back_populates="listing", uselist=False)
    authorized_access = relationship("ListingAccess", back_populates="listing")
    access_requests = relationship("DataAccessRequest", back_populates="listing")

    __table_args__ = (
        Index("idx_listings_status", "status"),
        Index("idx_listings_category_id", "category_id"),
        Index("idx_listings_seller_id", "seller_id"),
        Index("idx_listings_published_at", "published_at"),
        Index("idx_listings_visibility", "visibility"),
        Index("idx_listings_search_vector", "search_vector", postgresql_using="gin"),
        CheckConstraint("asking_price > 0", name="ck_listing_positive_price"),
    )


class AccessGroup(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "access_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    owner = relationship("User")
    members = relationship("AccessGroupMember", back_populates="group")


class AccessGroupMember(Base, TimestampMixin):
    __tablename__ = "access_group_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("access_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    group = relationship("AccessGroup", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_access_group_user"),
    )


class ListingAccess(Base, TimestampMixin):
    __tablename__ = "listing_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    access_group_id = Column(UUID(as_uuid=True), ForeignKey("access_groups.id", ondelete="CASCADE"), nullable=True)
    granted_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    listing = relationship("Listing", back_populates="authorized_access")


class ListingMedia(Base, TimestampMixin):
    __tablename__ = "listing_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    media_type = Column(String(20), nullable=False)
    url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    caption = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)

    listing = relationship("Listing", back_populates="media")

    __table_args__ = (
        Index("idx_listing_media_listing_id", "listing_id"),
    )


# Buyer Domain
class BuyerProfile(Base, TimestampMixin):
    __tablename__ = "buyer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    budget_min = Column(Numeric(20, 2), nullable=True)
    budget_max = Column(Numeric(20, 2), nullable=True)
    budget_currency = Column(Enum(Currency), default=Currency.USD, nullable=False)

    acquisition_experience = Column(String(50), nullable=True)
    industries_of_interest = Column(JSONB, nullable=True)
    business_models_of_interest = Column(JSONB, nullable=True)

    investment_goals = Column(Text, nullable=True)
    preferred_involvement = Column(String(50), nullable=True)
    investment_timeline = Column(String(50), nullable=True)

    identity_verified = Column(Boolean, default=False, nullable=False)
    accredited_investor = Column(Boolean, default=False, nullable=False)

    tier = Column(Enum(BuyerTier), default=BuyerTier.BASIC, nullable=False)
    standing_score = Column(Integer, default=100, nullable=False) # 0-100
    monthly_unlock_limit = Column(Integer, default=10, nullable=False)
    used_unlocks_this_month = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="buyer_profile")
    saved_listings = relationship("SavedListing", back_populates="buyer")


class SavedListing(Base, TimestampMixin):
    __tablename__ = "saved_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)

    buyer = relationship("BuyerProfile", back_populates="saved_listings")
    listing = relationship("Listing", back_populates="saved_by")

    __table_args__ = (
        UniqueConstraint("buyer_id", "listing_id", name="uq_buyer_listing"),
        Index("idx_saved_listings_buyer_id", "buyer_id"),
        Index("idx_saved_listings_listing_id", "listing_id"),
    )


class BuyerMandate(Base, TimestampMixin):
    __tablename__ = "buyer_mandates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    industries = Column(JSONB, nullable=True)
    business_models = Column(JSONB, nullable=True)
    budget_min = Column(Numeric(20, 2), nullable=True)
    budget_max = Column(Numeric(20, 2), nullable=True)
    currency = Column(Enum(Currency), default=Currency.USD, nullable=False)
    min_revenue = Column(Numeric(20, 2), nullable=True)
    min_profit = Column(Numeric(20, 2), nullable=True)
    preferred_locations = Column(JSONB, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="mandates")


class SavedSearch(Base, TimestampMixin):
    __tablename__ = "saved_searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    filters = Column(JSONB, nullable=False)
    alert_frequency = Column(String(20), default="daily") # instant, daily, weekly, off
    last_run_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="saved_searches")


# Seller Domain
class SellerProfile(Base, TimestampMixin):
    __tablename__ = "seller_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    identity_verified = Column(Boolean, default=False, nullable=False)
    business_verified = Column(Boolean, default=False, nullable=False)

    payout_method = Column(String(50), nullable=True)
    payout_details = Column(JSONB, nullable=True)

    total_listings = Column(Integer, default=0, nullable=False)
    successful_sales = Column(Integer, default=0, nullable=False)
    average_rating = Column(Numeric(3, 2), nullable=True)

    user = relationship("User", back_populates="seller_profile")


class BrokerProfile(Base, TimestampMixin):
    __tablename__ = "broker_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    company_name = Column(String(255), nullable=True)
    license_number = Column(String(100), nullable=True)
    specialties = Column(JSONB, nullable=True) # SaaS, Ecommerce, etc.
    years_experience = Column(Integer, default=0)

    bio = Column(Text, nullable=True)
    verified_broker = Column(Boolean, default=False, nullable=False)
    commission_rate = Column(Numeric(5, 4), default=0.10) # Default 10% broker fee

    user = relationship("User", back_populates="broker_profile")
    clients = relationship("ClientRepresentation", back_populates="broker")


class ClientRepresentation(Base, TimestampMixin):
    """Tracks brokers representing sellers/buyers."""
    __tablename__ = "client_representations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    broker_id = Column(UUID(as_uuid=True), ForeignKey("broker_profiles.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="SET NULL"), nullable=True)

    role = Column(String(20), default="SELLER_REP") # SELLER_REP, BUYER_REP
    status = Column(String(20), default="PENDING") # PENDING, ACTIVE, TERMINATED
    commission_agreement = Column(Numeric(5, 4), nullable=True)

    broker = relationship("BrokerProfile", back_populates="clients")
    client = relationship("User")
    listing = relationship("Listing")


# Messaging Domain
class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True)
    subject = Column(String(255), nullable=True)
    last_message_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    participants = relationship("ConversationParticipant", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation")


class ConversationParticipant(Base, TimestampMixin):
    __tablename__ = "conversation_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    last_read_at = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False, nullable=False)

    conversation = relationship("Conversation", back_populates="participants")

    __table_args__ = (
        UniqueConstraint("conversation_id", "user_id", name="uq_conversation_user"),
        Index("idx_conversation_participants_user_id", "user_id"),
    )


class Message(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_system_message = Column(Boolean, default=False, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
    attachments = relationship("MessageAttachment", back_populates="message")

    __table_args__ = (
        Index("idx_messages_conversation_id", "conversation_id"),
        Index("idx_messages_created_at", "created_at"),
    )


class MessageAttachment(Base, TimestampMixin):
    __tablename__ = "message_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)

    message = relationship("Message", back_populates="attachments")


# Offers Domain
class Offer(Base, TimestampMixin):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=True)

    amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(Enum(Currency), nullable=False)
    terms = Column(Text, nullable=True)
    conditions = Column(JSONB, nullable=True)

    status = Column(Enum(OfferStatus), default=OfferStatus.DRAFT, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)

    financing_type = Column(String(50), nullable=True)
    financing_details = Column(JSONB, nullable=True)

    __table_args__ = (
        Index("idx_offers_listing_id", "listing_id"),
        Index("idx_offers_buyer_id", "buyer_id"),
        Index("idx_offers_status", "status"),
        CheckConstraint("amount > 0", name="ck_offer_positive_amount"),
    )


# Verification Domain
class VerificationCase(Base, TimestampMixin):
    __tablename__ = "verification_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True)
    verification_type = Column(String(50), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.IN_PROGRESS, nullable=False)

    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    documents = relationship("VerificationDocument", back_populates="verification_case")

    __table_args__ = (
        Index("idx_verification_cases_user_id", "user_id"),
        Index("idx_verification_cases_status", "status"),
    )


class VerificationDocument(Base, TimestampMixin):
    __tablename__ = "verification_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    verification_case_id = Column(UUID(as_uuid=True), ForeignKey("verification_cases.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_url = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)

    verification_case = relationship("VerificationCase", back_populates="documents")


# Documents Domain
class Document(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    file_url = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)

    is_public = Column(Boolean, default=False, nullable=False)
    requires_nda = Column(Boolean, default=False, nullable=False)

    listing = relationship("Listing", back_populates="documents")

    __table_args__ = (
        Index("idx_documents_listing_id", "listing_id"),
        Index("idx_documents_uploader_id", "uploader_id"),
    )


class NDA(Base, TimestampMixin):
    __tablename__ = "ndas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), unique=True, nullable=False)
    content = Column(Text, nullable=False)

    listing = relationship("Listing", back_populates="nda")
    signatures = relationship("NDASignature", back_populates="nda")


class NDASignature(Base, TimestampMixin):
    __tablename__ = "nda_signatures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    nda_id = Column(UUID(as_uuid=True), ForeignKey("ndas.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    signed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    full_legal_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    signature_data = Column(Text, nullable=True) # Base64 or JSON path
    signature_type = Column(String(20), nullable=True) # DRAWN, TYPED

    nda = relationship("NDA", back_populates="signatures")

    __table_args__ = (
        UniqueConstraint("nda_id", "user_id", name="uq_nda_user_signature"),
    )

class DataAccessRequest(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "data_access_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(DataAccessRequestStatus), default=DataAccessRequestStatus.PENDING_NDA, nullable=False)

    nda_signature_id = Column(UUID(as_uuid=True), ForeignKey("nda_signatures.id", ondelete="SET NULL"), nullable=True)

    rejection_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    revoked_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    listing = relationship("Listing", back_populates="access_requests")
    buyer = relationship("User", foreign_keys=[buyer_id])
    signature = relationship("NDASignature")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])

    __table_args__ = (
        UniqueConstraint("listing_id", "buyer_id", name="uq_listing_buyer_access"),
        Index("idx_data_access_status", "status"),
    )


# Deal Rooms Domain
class DealRoom(Base, TimestampMixin):
    __tablename__ = "deal_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    status = Column(String(50), default="active")

    milestones = relationship("DealMilestone", back_populates="deal_room")
    asset_transfers = relationship("AssetTransfer", back_populates="deal_room")

    __table_args__ = (
        Index("idx_deal_rooms_listing_id", "listing_id"),
        Index("idx_deal_rooms_buyer_id", "buyer_id"),
    )


class DealMilestone(Base, TimestampMixin):
    __tablename__ = "deal_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    deal_room_id = Column(UUID(as_uuid=True), ForeignKey("deal_rooms.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(DealMilestoneStatus), default=DealMilestoneStatus.PENDING, nullable=False)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    deal_room = relationship("DealRoom", back_populates="milestones")


class AssetTransfer(Base, TimestampMixin):
    """Tracks individual digital asset handovers within a deal."""
    __tablename__ = "asset_transfers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    deal_room_id = Column(UUID(as_uuid=True), ForeignKey("deal_rooms.id", ondelete="CASCADE"), nullable=False)

    asset_type = Column(String(50), nullable=False) # DOMAIN, CODE, CLOUD, SOCIAL
    asset_name = Column(String(255), nullable=False)

    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, VERIFYING, COMPLETED
    verification_method = Column(String(50), nullable=True) # DNS_WHOIS, GITHUB_INVITE, etc.

    handover_data = Column(JSONB, nullable=True) # e.g. Domain Auth Code (encrypted)
    evidence_url = Column(String(500), nullable=True)
    completed_at = Column(DateTime, nullable=True)

    deal_room = relationship("DealRoom", back_populates="asset_transfers")


# Transactions Domain
class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=True)

    amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(Enum(Currency), nullable=False)
    commission_rate = Column(Numeric(5, 4), nullable=False)
    commission_amount = Column(Numeric(20, 2), nullable=False)
    seller_proceeds = Column(Numeric(20, 2), nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.DRAFT, nullable=False)

    payment_provider = Column(String(50), nullable=True)
    payment_provider_id = Column(String(255), nullable=True)

    __table_args__ = (
        Index("idx_transactions_buyer_id", "buyer_id"),
        Index("idx_transactions_status", "status"),
        CheckConstraint("amount > 0", name="ck_transaction_positive_amount"),
    )


class LedgerEntry(Base, TimestampMixin):
    """Immutable financial ledger entries."""
    __tablename__ = "ledger_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    entry_type = Column(Enum(LedgerEntryType), nullable=False)

    amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(Enum(Currency), nullable=False)

    provider_reference = Column(String(255), nullable=True)
    description = Column(String(500), nullable=True)
    metadata_json = Column(JSONB, nullable=True)

    __table_args__ = (
        Index("idx_ledger_transactions", "transaction_id"),
        Index("idx_ledger_type", "entry_type"),
    )


# Reviews Domain
class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), unique=True, nullable=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    communication_rating = Column(Integer, nullable=True)
    accuracy_rating = Column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating_range"),
    )


# Notifications Domain
class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    metadata_json = Column(JSONB, nullable=True)

    __table_args__ = (
        Index("idx_notifications_user_id", "user_id"),
        Index("idx_notifications_is_read", "is_read"),
    )


# AI Domain
class AIConversation(Base, TimestampMixin):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agent_type = Column(String(50), nullable=False)  # BUYER_AGENT, SELLER_AGENT, etc.
    context_type = Column(String(50), nullable=True)  # LISTING, DEAL, etc.
    context_id = Column(UUID(as_uuid=True), nullable=True)

    messages = relationship("AIMessage", back_populates="conversation")


class AIMessage(Base, TimestampMixin):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)

    conversation = relationship("AIConversation", back_populates="messages")
    tool_calls = relationship("AIToolCall", back_populates="message")


class AIToolCall(Base, TimestampMixin):
    __tablename__ = "ai_tool_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("ai_messages.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    arguments = Column(JSONB, nullable=False)
    result = Column(JSONB, nullable=True)
    success = Column(Boolean, default=True, nullable=False)

    message = relationship("AIMessage", back_populates="tool_calls")


class Dispute(Base, TimestampMixin):
    __tablename__ = "disputes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    deal_room_id = Column(UUID(as_uuid=True), ForeignKey("deal_rooms.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(DisputeStatus), default=DisputeStatus.OPEN, nullable=False)

    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    deal_room = relationship("DealRoom")
    transaction = relationship("Transaction")
    creator = relationship("User", foreign_keys=[creator_id])
    resolver = relationship("User", foreign_keys=[resolved_by_id])

class AcquisitionGuide(Base, TimestampMixin):
    __tablename__ = "acquisition_guides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Valuation, Due Diligence, etc.
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)

class Payout(Base, TimestampMixin):
    __tablename__ = "payouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(Enum(Currency), default=Currency.USD, nullable=False)
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING, nullable=False)

    # Destination metadata (redacted in UI)
    payout_method = Column(String(50), nullable=False)
    destination_metadata = Column(JSONB, nullable=True)

    # Tracking
    provider_reference = Column(String(255), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    user = relationship("User")

    __table_args__ = (
        Index("idx_payouts_user_id", "user_id"),
        Index("idx_payouts_status", "status"),
        CheckConstraint("amount > 0", name="ck_payout_positive_amount"),
    )

# Audit Logging Domain
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    actor_type = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    changes = Column(JSONB, nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_audit_logs_user_id", "user_id"),
        Index("idx_audit_logs_action", "action"),
    )
