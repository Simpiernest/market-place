import sys
import os
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add parent directory and apps/api to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "..", "apps", "api"))

from app.models.domain import (
    User, UserProfile, Category, Industry, Business, Listing,
    ListingStatus, Currency
)


def seed_categories(db: Session):
    """Seed marketplace categories."""
    categories = [
        {"name": "SaaS", "slug": "saas", "description": "Software as a Service businesses", "icon": "cloud", "display_order": 1},
        {"name": "E-commerce", "slug": "ecommerce", "description": "Online retail stores", "icon": "shopping-cart", "display_order": 2},
        {"name": "Website", "slug": "website", "description": "Content websites and blogs", "icon": "globe", "display_order": 3},
        {"name": "Mobile App", "slug": "mobile-app", "description": "iOS and Android applications", "icon": "smartphone", "display_order": 4},
        {"name": "Newsletter", "slug": "newsletter", "description": "Email newsletters and subscriptions", "icon": "mail", "display_order": 5},
        {"name": "Agency", "slug": "agency", "description": "Service-based businesses", "icon": "briefcase", "display_order": 6},
        {"name": "Marketplace", "slug": "marketplace", "description": "Online marketplaces", "icon": "store", "display_order": 7},
        {"name": "Digital Product", "slug": "digital-product", "description": "Digital downloads and products", "icon": "download", "display_order": 8},
    ]

    for cat_data in categories:
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not existing:
            category = Category(**cat_data)
            db.add(category)

    db.commit()
    print(f"✓ Seeded {len(categories)} categories")


def seed_industries(db: Session):
    """Seed industries."""
    industries = [
        {"name": "Technology", "slug": "technology"},
        {"name": "Finance", "slug": "finance"},
        {"name": "Healthcare", "slug": "healthcare"},
        {"name": "Education", "slug": "education"},
        {"name": "E-commerce", "slug": "ecommerce"},
        {"name": "Marketing", "slug": "marketing"},
        {"name": "Real Estate", "slug": "real-estate"},
        {"name": "Travel", "slug": "travel"},
        {"name": "Food & Beverage", "slug": "food-beverage"},
        {"name": "Entertainment", "slug": "entertainment"},
    ]

    for ind_data in industries:
        existing = db.query(Industry).filter(Industry.slug == ind_data["slug"]).first()
        if not existing:
            industry = Industry(**ind_data)
            db.add(industry)

    db.commit()
    print(f"✓ Seeded {len(industries)} industries")


def seed_demo_data(db: Session):
    """Seed demo businesses and listings for development."""

    # Create demo seller
    email = "seller@demo.businessbridge.com"
    demo_seller = db.query(User).filter(User.email == email).first()

    if not demo_seller:
        demo_seller = User(
            id=uuid.uuid4(),
            email=email,
            email_verified=True,
            full_name="Demo Seller",
            is_active=True,
        )
        db.add(demo_seller)
        db.commit()
        db.refresh(demo_seller)

    # Get categories
    saas_category = db.query(Category).filter(Category.slug == "saas").first()
    ecommerce_category = db.query(Category).filter(Category.slug == "ecommerce").first()

    # Demo businesses
    demo_businesses = [
        {
            "name": "FlowPilot AI",
            "description": "AI-powered customer support automation platform helping businesses reduce support costs by 60%.",
            "category": saas_category,
            "annual_revenue": Decimal("240000.00"),
            "monthly_revenue": Decimal("20000.00"),
            "annual_profit": Decimal("180000.00"),
            "monthly_profit": Decimal("15000.00"),
            "asking_price": Decimal("600000.00"),
            "monthly_traffic": 12000,
            "customer_count": 85,
            "tagline": "AI Customer Support That Actually Works",
        },
        {
            "name": "UrbanNest",
            "description": "Premium home decor e-commerce store with curated modern furniture and accessories.",
            "category": ecommerce_category,
            "annual_revenue": Decimal("480000.00"),
            "monthly_revenue": Decimal("40000.00"),
            "annual_profit": Decimal("120000.00"),
            "monthly_profit": Decimal("10000.00"),
            "asking_price": Decimal("360000.00"),
            "monthly_traffic": 35000,
            "customer_count": 2400,
            "tagline": "Modern Living, Simplified",
        },
        {
            "name": "GrowthStack",
            "description": "All-in-one marketing automation platform for small businesses.",
            "category": saas_category,
            "annual_revenue": Decimal("180000.00"),
            "monthly_revenue": Decimal("15000.00"),
            "annual_profit": Decimal("135000.00"),
            "monthly_profit": Decimal("11250.00"),
            "asking_price": Decimal("450000.00"),
            "monthly_traffic": 8000,
            "customer_count": 120,
            "tagline": "Marketing Automation Made Simple",
        },
    ]

    for biz_data in demo_businesses:
        category = biz_data.pop("category")
        tagline = biz_data.pop("tagline")
        asking_price = biz_data.pop("asking_price")

        # Create business
        business = Business(
            id=uuid.uuid4(),
            owner_id=demo_seller.id,
            revenue_currency=Currency.USD,
            **biz_data
        )
        db.add(business)
        db.flush()

        # Create listing
        slug = biz_data["name"].lower().replace(" ", "-")
        listing = Listing(
            id=uuid.uuid4(),
            business_id=business.id,
            seller_id=demo_seller.id,
            category_id=category.id,
            title=biz_data["name"],
            slug=slug,
            tagline=tagline,
            description=biz_data["description"],
            asking_price=asking_price,
            price_currency=Currency.USD,
            status=ListingStatus.ACTIVE,
            is_featured=True,
            is_verified=True,
            published_at=datetime.utcnow() - timedelta(days=7),
        )
        db.add(listing)

    db.commit()
    print(f"✓ Seeded {len(demo_businesses)} demo businesses (DEMO DATA)")


def seed_all(db: Session):
    """Run all seed functions."""
    print("\n🌱 Seeding database...\n")

    seed_categories(db)
    seed_industries(db)
    seed_demo_data(db)

    print("\n✅ Database seeding complete!\n")


if __name__ == "__main__":
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
