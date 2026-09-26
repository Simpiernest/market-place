"""Helpers to maintain PostgreSQL full-text search_vector columns."""

from sqlalchemy import text
from sqlalchemy.orm import Session


def update_listing_search_vector(db: Session, listing_id, title: str, description: str, tagline: str = None) -> None:
    """Recompute and store the search_vector for a listing."""
    db.execute(
        text(
            "UPDATE listings SET search_vector = to_tsvector('english', "
            "coalesce(:title, '') || ' ' || coalesce(:tagline, '') || ' ' || coalesce(:description, '')) "
            "WHERE id = :listing_id"
        ),
        {
            "title": title or "",
            "tagline": tagline or "",
            "description": description or "",
            "listing_id": str(listing_id),
        },
    )
    db.commit()


def update_category_search_vector(db: Session, category_id, name: str, description: str = None) -> None:
    """Recompute and store the search_vector for a category."""
    db.execute(
        text(
            "UPDATE categories SET search_vector = to_tsvector('english', "
            "coalesce(:name, '') || ' ' || coalesce(:description, '')) "
            "WHERE id = :category_id"
        ),
        {
            "name": name or "",
            "description": description or "",
            "category_id": str(category_id),
        },
    )
    db.commit()