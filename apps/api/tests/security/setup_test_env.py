"""
Script to setup a synthetic security test environment.
Creates users with different roles and resources belonging to them.
"""

import os
import sys
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timedelta

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.domain import User, UserRole, UserRoleMapping, Listing, Business, Category, ListingVettingStatus, ListingVisibility, Currency

def setup():
    db = SessionLocal()
    try:
        # 1. Create Category
        cat = db.query(Category).filter(Category.slug == "saas").first()
        if not cat:
            cat = Category(name="SaaS", slug="saas", is_active=True)
            db.add(cat)
            db.flush()

        # 2. Create SELLER_A and LISTING_A
        seller_a = db.query(User).filter(User.email == "seller_a@example.com").first()
        if not seller_a:
            seller_a = User(
                email="seller_a@example.com",
                full_name="Seller Alpha",
                password_hash="fake_hash",
                is_active=True,
                email_verified=True
            )
            db.add(seller_a)
            db.flush()
            db.add(UserRoleMapping(user_id=seller_a.id, role=UserRole.SELLER))
            db.flush()

        biz_a = db.query(Business).filter(Business.owner_id == seller_a.id).first()
        if not biz_a:
            biz_a = Business(
                owner_id=seller_a.id,
                name="Alpha Analytics",
                description="Seller A's business",
                business_model="SaaS",
                annual_revenue=Decimal("120000"),
                annual_profit=Decimal("80000")
            )
            db.add(biz_a)
            db.flush()

        listing_a_public = db.query(Listing).filter(Listing.title == "Public Listing A").first()
        if not listing_a_public:
            listing_a_public = Listing(
                business_id=biz_a.id,
                seller_id=seller_a.id,
                category_id=cat.id,
                title="Public Listing A",
                slug="public-listing-a",
                description="This is a public listing",
                asking_price=Decimal("250000"),
                status=ListingVettingStatus.PUBLISHED,
                visibility=ListingVisibility.PUBLIC
            )
            db.add(listing_a_public)

        listing_a_private = db.query(Listing).filter(Listing.title == "Private Listing A").first()
        if not listing_a_private:
            listing_a_private = Listing(
                business_id=biz_a.id,
                seller_id=seller_a.id,
                category_id=cat.id,
                title="Private Listing A",
                slug="private-listing-a",
                description="This is a private listing",
                asking_price=Decimal("500000"),
                status=ListingVettingStatus.PUBLISHED,
                visibility=ListingVisibility.PRIVATE
            )
            db.add(listing_a_private)

        # 3. Create SELLER_B and LISTING_B
        seller_b = db.query(User).filter(User.email == "seller_b@example.com").first()
        if not seller_b:
            seller_b = User(
                email="seller_b@example.com",
                full_name="Seller Beta",
                password_hash="fake_hash",
                is_active=True,
                email_verified=True
            )
            db.add(seller_b)
            db.flush()
            db.add(UserRoleMapping(user_id=seller_b.id, role=UserRole.SELLER))
            db.flush()

        biz_b = db.query(Business).filter(Business.owner_id == seller_b.id).first()
        if not biz_b:
            biz_b = Business(
                owner_id=seller_b.id,
                name="Beta Bot",
                description="Seller B's business",
                business_model="AI Business",
                annual_revenue=Decimal("60000"),
                annual_profit=Decimal("40000")
            )
            db.add(biz_b)
            db.flush()

        listing_b_private = db.query(Listing).filter(Listing.title == "Private Listing B").first()
        if not listing_b_private:
            listing_b_private = Listing(
                business_id=biz_b.id,
                seller_id=seller_b.id,
                category_id=cat.id,
                title="Private Listing B",
                slug="private-listing-b",
                description="This is Seller B's private listing",
                asking_price=Decimal("150000"),
                status=ListingVettingStatus.PUBLISHED,
                visibility=ListingVisibility.PRIVATE
            )
            db.add(listing_b_private)

        # 4. Create BUYER_A
        buyer_a = db.query(User).filter(User.email == "buyer_a@example.com").first()
        if not buyer_a:
            buyer_a = User(
                email="buyer_a@example.com",
                full_name="Buyer Alpha",
                password_hash="fake_hash",
                is_active=True,
                email_verified=True
            )
            db.add(buyer_a)
            db.flush()
            db.add(UserRoleMapping(user_id=buyer_a.id, role=UserRole.BUYER))

        # 5. Create ADMIN_A
        admin_a = db.query(User).filter(User.email == "admin@businessbridge.com").first()
        if not admin_a:
            admin_a = User(
                email="admin@businessbridge.com",
                full_name="Admin Prime",
                password_hash="fake_hash",
                is_active=True,
                email_verified=True
            )
            db.add(admin_a)
            db.flush()
            db.add(UserRoleMapping(user_id=admin_a.id, role=UserRole.ADMIN))

        db.commit()
        print("✅ Security test environment setup complete.")

    except Exception as e:
        db.rollback()
        print(f"❌ Setup failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup()
