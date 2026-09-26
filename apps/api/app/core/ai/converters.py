from typing import Dict, Any
import re

class SearchConverter:
    """Converts natural language queries into structured marketplace filters."""

    @staticmethod
    def parse_query(query: str) -> Dict[str, Any]:
        """
        Heuristic-based parser for V2 demo.
        In production, this would use LLM extraction.
        """
        filters = {}
        query_lower = query.lower()

        # Extract Category
        categories = ["saas", "ecommerce", "content", "apps", "agency", "marketplace"]
        for cat in categories:
            if cat in query_lower:
                filters["category"] = cat.capitalize()

        # Extract Price (e.g. "under $100k")
        price_match = re.search(r"(under|less than|max)\s*\$?\s*(\d+)\s*k?", query_lower)
        if price_match:
            val = int(price_match.group(2))
            if "k" in price_match.group(0) or val < 1000:
                val *= 1000
            filters["max_price"] = val

        # Extract Profit/Revenue (e.g. ">$5k profit")
        profit_match = re.search(r"(greater than|over|more than|>)\s*\$?\s*(\d+)\s*k?\s*profit", query_lower)
        if profit_match:
            val = int(profit_match.group(2))
            if "k" in profit_match.group(0) or val < 1000:
                val *= 1000
            filters["min_profit"] = val

        return filters
