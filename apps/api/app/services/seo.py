"""SEO utilities for generating metadata and structured data."""

from typing import Dict, Any, List, Optional
from datetime import datetime
from decimal import Decimal


class SEOGenerator:
    """Generate SEO-optimized metadata and structured data."""

    def __init__(self, base_url: str = "https://businessbridge.com"):
        self.base_url = base_url

    def generate_listing_metadata(
        self,
        listing: Dict[str, Any],
        business: Dict[str, Any] = None,
    ) -> Dict[str, str]:
        """Generate SEO metadata for a listing page."""
        title = listing.get("meta_title") or f"{listing['title']} - Business for Sale | Business Bridge"
        description = listing.get("meta_description") or self._generate_description(listing, business)

        return {
            "title": title[:60],  # Google's display limit
            "description": description[:160],  # Google's display limit
            "og_title": title[:90],  # OpenGraph optimal
            "og_description": description[:200],
            "og_image": listing.get("featured_image") or f"{self.base_url}/og-default.jpg",
            "og_url": f"{self.base_url}/listings/{listing['slug']}",
            "twitter_card": "summary_large_image",
            "canonical_url": f"{self.base_url}/listings/{listing['slug']}",
        }

    def _generate_description(self, listing: Dict[str, Any], business: Dict[str, Any] = None) -> str:
        """Auto-generate meta description from listing data."""
        parts = [listing.get("tagline", "")]

        if business:
            if business.get("monthly_revenue"):
                parts.append(f"${business['monthly_revenue']}/mo revenue")
            if business.get("monthly_profit"):
                parts.append(f"${business['monthly_profit']}/mo profit")

        parts.append(f"Price: ${listing['asking_price']}")

        return ". ".join(filter(None, parts))

    def generate_structured_data(
        self,
        listing: Dict[str, Any],
        business: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for rich snippets.

        Implements Product schema for business listings.
        """
        structured_data = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": listing["title"],
            "description": listing.get("description", ""),
            "url": f"{self.base_url}/listings/{listing['slug']}",
            "offers": {
                "@type": "Offer",
                "price": str(listing["asking_price"]),
                "priceCurrency": listing.get("currency", "USD"),
                "availability": "https://schema.org/InStock",
                "url": f"{self.base_url}/listings/{listing['slug']}",
            },
        }

        if listing.get("featured_image"):
            structured_data["image"] = listing["featured_image"]

        if business:
            structured_data["brand"] = {
                "@type": "Brand",
                "name": business.get("name", listing["title"]),
            }

            if business.get("established_date"):
                structured_data["releaseDate"] = business["established_date"]

        # Add aggregateRating if reviews exist
        if listing.get("rating"):
            structured_data["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": str(listing["rating"]),
                "reviewCount": str(listing.get("review_count", 1)),
            }

        return structured_data

    def generate_organization_schema(
        self,
        name: str = "Business Bridge",
        description: str = "Global marketplace for online business acquisitions",
    ) -> Dict[str, Any]:
        """Generate Organization schema for homepage."""
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": name,
            "description": description,
            "url": self.base_url,
            "logo": f"{self.base_url}/logo.png",
            "sameAs": [
                "https://twitter.com/businessbridge",
                "https://linkedin.com/company/businessbridge",
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "email": "support@businessbridge.com",
            },
        }

    def generate_breadcrumb_schema(
        self,
        items: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Generate BreadcrumbList schema.

        Args:
            items: List of {"name": "...", "url": "..."} dicts
        """
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "name": item["name"],
                    "item": item["url"],
                }
                for idx, item in enumerate(items)
            ],
        }

    def generate_faq_schema(
        self,
        questions: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Generate FAQPage schema.

        Args:
            questions: List of {"question": "...", "answer": "..."} dicts
        """
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": q["answer"],
                    },
                }
                for q in questions
            ],
        }

    def generate_sitemap_entry(
        self,
        url: str,
        lastmod: Optional[datetime] = None,
        changefreq: str = "weekly",
        priority: float = 0.5,
    ) -> Dict[str, Any]:
        """Generate a sitemap.xml entry."""
        entry = {
            "loc": url,
            "changefreq": changefreq,
            "priority": priority,
        }

        if lastmod:
            entry["lastmod"] = lastmod.strftime("%Y-%m-%d")

        return entry

    def generate_robots_txt(
        self,
        allow_all: bool = True,
        sitemap_url: Optional[str] = None,
    ) -> str:
        """Generate robots.txt content."""
        lines = ["User-agent: *"]

        if allow_all:
            lines.append("Allow: /")
        else:
            lines.append("Disallow: /admin/")
            lines.append("Disallow: /api/")
            lines.append("Disallow: /dashboard/")
            lines.append("Allow: /")

        if sitemap_url or self.base_url:
            lines.append(f"Sitemap: {sitemap_url or f'{self.base_url}/sitemap.xml'}")

        return "\n".join(lines)


# Global instance
seo_generator = SEOGenerator()
