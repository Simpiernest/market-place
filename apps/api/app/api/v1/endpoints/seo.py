"""SEO endpoints for sitemap and structured data."""

from typing import Any, List
from fastapi import APIRouter, Depends, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.domain import Listing, ListingStatus, Category
from app.services.seo import seo_generator

router = APIRouter()


@router.get("/sitemap.xml", response_class=PlainTextResponse)
def get_sitemap(db: Session = Depends(get_db)) -> str:
    """Generate XML sitemap for search engines."""

    # Static pages
    urls = [
        seo_generator.generate_sitemap_entry(
            f"{seo_generator.base_url}/",
            changefreq="daily",
            priority=1.0,
        ),
        seo_generator.generate_sitemap_entry(
            f"{seo_generator.base_url}/marketplace",
            changefreq="hourly",
            priority=0.9,
        ),
        seo_generator.generate_sitemap_entry(
            f"{seo_generator.base_url}/about",
            changefreq="monthly",
            priority=0.6,
        ),
        seo_generator.generate_sitemap_entry(
            f"{seo_generator.base_url}/how-it-works",
            changefreq="monthly",
            priority=0.7,
        ),
    ]

    # Category pages
    categories = db.query(Category).filter(Category.is_active == True).all()
    for category in categories:
        urls.append(
            seo_generator.generate_sitemap_entry(
                f"{seo_generator.base_url}/marketplace?category={category.slug}",
                changefreq="daily",
                priority=0.8,
            )
        )

    # Active listing pages
    listings = db.query(Listing).filter(
        Listing.status == ListingStatus.ACTIVE
    ).order_by(Listing.updated_at.desc()).limit(10000).all()

    for listing in listings:
        urls.append(
            seo_generator.generate_sitemap_entry(
                f"{seo_generator.base_url}/listings/{listing.slug}",
                lastmod=listing.updated_at,
                changefreq="weekly",
                priority=0.7,
            )
        )

    # Build XML
    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for url in urls:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{url['loc']}</loc>")
        if url.get("lastmod"):
            xml_lines.append(f"    <lastmod>{url['lastmod']}</lastmod>")
        xml_lines.append(f"    <changefreq>{url['changefreq']}</changefreq>")
        xml_lines.append(f"    <priority>{url['priority']}</priority>")
        xml_lines.append("  </url>")

    xml_lines.append("</urlset>")

    return "\n".join(xml_lines)


@router.get("/robots.txt", response_class=PlainTextResponse)
def get_robots_txt() -> str:
    """Generate robots.txt file."""
    return seo_generator.generate_robots_txt(
        allow_all=True,
        sitemap_url=f"{seo_generator.base_url}/api/v1/seo/sitemap.xml",
    )


@router.get("/listings/{slug}/structured-data")
def get_listing_structured_data(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get structured data (JSON-LD) for a listing."""
    listing = db.query(Listing).filter(Listing.slug == slug).first()
    if not listing:
        return {"error": "Listing not found"}

    listing_dict = {
        "title": listing.title,
        "description": listing.description,
        "slug": listing.slug,
        "asking_price": float(listing.asking_price),
        "currency": listing.currency.value,
        "featured_image": listing.featured_image,
    }

    business_dict = None
    if listing.business:
        business_dict = {
            "name": listing.business.name,
            "monthly_revenue": float(listing.business.monthly_revenue) if listing.business.monthly_revenue else None,
            "monthly_profit": float(listing.business.monthly_profit) if listing.business.monthly_profit else None,
            "established_date": listing.business.established_date.isoformat() if listing.business.established_date else None,
        }

    return seo_generator.generate_structured_data(listing_dict, business_dict)


@router.get("/organization-schema")
def get_organization_schema() -> Any:
    """Get Organization structured data for homepage."""
    return seo_generator.generate_organization_schema()
