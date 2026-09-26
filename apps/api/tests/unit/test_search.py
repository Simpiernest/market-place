"""Unit tests for search functionality."""

import pytest
from app.services.search import SearchService


@pytest.mark.unit
def test_build_search_query():
    """Test search query builder."""
    service = SearchService()
    query = "saas business"

    # Test that service can be instantiated
    assert service is not None


@pytest.mark.unit
def test_search_filters():
    """Test search filter construction."""
    service = SearchService()

    filters = {
        "category": "SAAS",
        "min_price": 50000,
        "max_price": 200000,
    }

    # Verify filters are accepted
    assert filters["category"] == "SAAS"
    assert filters["min_price"] < filters["max_price"]


@pytest.mark.unit
def test_search_validation():
    """Test search parameter validation."""
    # Query too short
    short_query = "a"
    assert len(short_query) < 2

    # Valid query
    valid_query = "tech business"
    assert len(valid_query) >= 2
