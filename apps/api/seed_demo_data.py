import os
import sys
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timedelta

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.domain import User, Business, Listing, Category, ListingVettingStatus, ListingVisibility, Currency

def seed():
    db = SessionLocal()
    try:
        # 1. Get or create a category
        cat = db.query(Category).first()
        if not cat:
            cat = Category(name="SaaS", slug="saas", is_active=True)
            db.add(cat)
            db.flush()

        # 2. Get a seller
        seller = db.query(User).first()
        if not seller:
            print("No users found. Please register a user first.")
            return

        # 3. Create Demo Businesses (Section 117)
        demos = [
            {"name": "FlowPilot AI", "type": "AI Business", "rev": 15000, "profit": 8000, "price": 250000},
            {"name": "UrbanNest", "type": "Ecommerce", "rev": 45000, "profit": 12000, "price": 380000},
            {"name": "GrowthStack", "type": "SaaS", "rev": 22000, "profit": 14000, "price": 450000},
        ]

        for demo in demos:
            # Check if exists
            exists = db.query(Business).filter(Business.name == demo["name"]).first()
            if exists: continue

            business = Business(
                owner_id=seller.id,
                name=demo["name"],
                description=f"Demo business for {demo['name']}. This is an institutional-grade digital asset.",
                business_model=demo["type"],
                annual_revenue=Decimal(str(demo["rev"] * 12)),
                annual_profit=Decimal(str(demo["profit"] * 12)),
                revenue_currency=Currency.USD,
                monthly_traffic=5000,
                location="Remote",
                country="US"
            )
            db.add(business)
            db.flush()

            listing = Listing(
                business_id=business.id,
                seller_id=seller.id,
                category_id=cat.id,
                title=demo["name"],
                slug=demo["name"].lower().replace(" ", "-"),
                description=f"Premium acquisition opportunity: {demo['name']}.",
                asking_price=Decimal(str(demo["price"])),
                status=ListingVettingStatus.PUBLISHED,
                visibility=ListingVisibility.PUBLIC,
                is_verified=True,
                is_featured=True,
                published_at=datetime.utcnow()
            )
            db.add(listing)
            print(f"Created demo listing: {demo['name']}")

        db.commit()
        print("✅ Demo data seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
