# Backend Testing Guide

## Setup

Install test dependencies:
```bash
pip install -r requirements-dev.txt
```

## Running Tests

### All Tests
```bash
pytest
```

### Unit Tests Only
```bash
pytest -m unit
```

### Integration Tests Only
```bash
pytest -m integration
```

### E2E Tests Only
```bash
pytest -m e2e
```

### With Coverage
```bash
pytest --cov=app --cov-report=html
```

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests
│   ├── test_auth.py
│   ├── test_search.py
│   └── test_payments.py
├── integration/             # Integration tests
│   ├── test_marketplace_flow.py
│   └── test_messaging_system.py
└── e2e/                     # End-to-end tests
    └── test_complete_acquisition_flow.py
```

## Writing Tests

### Unit Test Example
```python
@pytest.mark.unit
def test_payment_calculation():
    service = PaymentService()
    result = service.calculate_fee(100000, 0.05)
    assert result == 5000
```

### Integration Test Example
```python
@pytest.mark.integration
def test_create_listing(client: TestClient, auth_headers: dict):
    response = client.post(
        "/api/v1/listings",
        json={"title": "Test", "price": 100000},
        headers=auth_headers
    )
    assert response.status_code == 201
```

## Fixtures

- `client`: FastAPI TestClient with database
- `auth_headers`: Mock authentication headers
- `mock_user_data`: Sample user data
- `mock_listing_data`: Sample listing data
- `mock_offer_data`: Sample offer data
