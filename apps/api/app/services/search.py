"""PostgreSQL full-text search service for Business Bridge."""

from typing import List, Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session


class SearchService:
    """Provides PostgreSQL full-text search across listings, businesses, and categories."""

    def __init__(self, db: Session):
        self.db = db

    def search_listings(
        self,
        query: Optional[str] = None,
        business_types: Optional[List[str]] = None,
        industries: Optional[List[str]] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        revenue_min: Optional[float] = None,
        revenue_max: Optional[float] = None,
        profit_min: Optional[float] = None,
        profit_max: Optional[float] = None,
        verified_only: bool = False,
        sale_types: Optional[List[str]] = None,
        owner_involvement: Optional[List[str]] = None,
        countries: Optional[List[str]] = None,
        sort_by: str = "relevance",
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Execute a full-text search across active listings."""
        conditions = ["l.status = 'ACTIVE'"]
        params: Dict[str, Any] = {}

        if query:
            conditions.append(
                "(l.search_vector @@ plainto_tsquery('english', :query))"
            )
            params["query"] = query
        if business_types:
            conditions.append("b.business_model IN :business_types")
            params["business_types"] = business_types
        if industries:
            conditions.append("b.industry IN :industries")
            params["industries"] = industries
        if price_min is not None:
            conditions.append("l.asking_price >= :price_min")
            params["price_min"] = price_min
        if price_max is not None:
            conditions.append("l.asking_price <= :price_max")
            params["price_max"] = price_max
        if revenue_min is not None:
            conditions.append("b.monthly_revenue >= :revenue_min")
            params["revenue_min"] = revenue_min
        if revenue_max is not None:
            conditions.append("b.monthly_revenue <= :revenue_max")
            params["revenue_max"] = revenue_max
        if profit_min is not None:
            conditions.append("b.monthly_profit >= :profit_min")
            params["profit_min"] = profit_min
        if profit_max is not None:
            conditions.append("b.monthly_profit <= :profit_max")
            params["profit_max"] = profit_max
        if verified_only:
            conditions.append("l.is_verified = true")
        if sale_types:
            conditions.append("l.sale_type IN :sale_types")
            params["sale_types"] = sale_types
        if owner_involvement:
            conditions.append("b.owner_involvement IN :owner_involvement")
            params["owner_involvement"] = owner_involvement
        if countries:
            conditions.append("b.country IN :countries")
            params["countries"] = countries

        where_clause = " AND ".join(conditions)

        order_clause = self._build_order_clause(sort_by, query)

        offset = (page - 1) * limit

        count_sql = text(
            f"SELECT COUNT(*) FROM listings l "
            f"JOIN businesses b ON b.id = l.business_id "
            f"WHERE {where_clause}"
        )
        total = self.db.execute(count_sql, params).scalar() or 0

        data_sql = text(
            f"SELECT l.*, b.name AS business_name, b.monthly_revenue, b.monthly_profit, "
            f"b.country, b.industry, b.business_model, "
            f"ts_rank(l.search_vector, plainto_tsquery('english', :query)) AS rank "
            f"FROM listings l "
            f"JOIN businesses b ON b.id = l.business_id "
            f"WHERE {where_clause} "
            f"{order_clause} "
            f"LIMIT :limit OFFSET :offset"
        )
        params["limit"] = limit
        params["offset"] = offset

        rows = self.db.execute(data_sql, params).fetchall()
        items = [dict(row._mapping) for row in rows]

        return {
            "items": items,
            "total": total,
            "page": page,
            "size": limit,
            "query": query,
        }

    def search_categories(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search categories by name or description."""
        sql = text(
            "SELECT * FROM categories "
            "WHERE search_vector @@ plainto_tsquery('english', :query) "
            "AND is_active = true "
            "ORDER BY display_order "
            "LIMIT :limit"
        )
        rows = self.db.execute(sql, {"query": query, "limit": limit}).fetchall()
        return [dict(row._mapping) for row in rows]

    def search_sellers(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search seller profiles by name or bio."""
        sql = text(
            "SELECT u.id, u.full_name, u.email, sp.company_name, sp.bio, sp.rating "
            "FROM users u "
            "LEFT JOIN seller_profiles sp ON sp.user_id = u.id "
            "WHERE (u.full_name ILIKE :like OR sp.bio ILIKE :like) "
            "AND u.is_active = true "
            "ORDER BY sp.rating DESC NULLS LAST "
            "LIMIT :limit"
        )
        rows = self.db.execute(
            sql, {"like": f"%{query}%", "limit": limit}
        ).fetchall()
        return [dict(row._mapping) for row in rows]

    def get_suggestions(self, query: str, limit: int = 5) -> List[str]:
        """Return autocomplete suggestions for a partial query."""
        sql = text(
            "SELECT DISTINCT title FROM listings "
            "WHERE title ILIKE :like AND status = 'ACTIVE' "
            "ORDER BY view_count DESC "
            "LIMIT :limit"
        )
        rows = self.db.execute(
            sql, {"like": f"{query}%", "limit": limit}
        ).fetchall()
        return [row[0] for row in rows]

    def _build_order_clause(self, sort_by: str, query: Optional[str]) -> str:
        if sort_by == "price_asc":
            return "ORDER BY l.asking_price ASC"
        if sort_by == "price_desc":
            return "ORDER BY l.asking_price DESC"
        if sort_by == "revenue_desc":
            return "ORDER BY b.monthly_revenue DESC NULLS LAST"
        if sort_by == "profit_desc":
            return "ORDER BY b.monthly_profit DESC NULLS LAST"
        if sort_by == "newest":
            return "ORDER BY l.created_at DESC"
        if sort_by == "oldest":
            return "ORDER BY l.created_at ASC"
        if sort_by == "most_viewed":
            return "ORDER BY l.view_count DESC"
        if query:
            return "ORDER BY rank DESC"
        return "ORDER BY l.created_at DESC"