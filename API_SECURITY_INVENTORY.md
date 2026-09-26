# Business Bridge API Security Inventory

## Critical Endpoints (Financial & Ownership)

### Payouts
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/payouts/balance` | Yes | SELLER | Yes | Informational |
| POST | `/payouts/settings` | Yes | SELLER | Yes | Financial Destination |
| POST | `/payouts/request` | Yes | SELLER | Yes | Money Movement |

### Payments
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/payments/create-checkout`| Yes | BUYER | Yes | Financial Initialization |
| POST | `/payments/webhook/stripe` | No | System | Signature | Ledger State Change |
| POST | `/payments/release` | Yes | BUYER/ADMIN | Yes | Final Settlement |

### Listings
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/listings/` | Yes | SELLER | N/A | Asset Creation |
| PATCH | `/listings/{id}` | Yes | SELLER | Yes | Asset Modification |
| DELETE | `/listings/{id}` | Yes | SELLER | Yes | Asset Removal |
| POST | `/listings/{id}/bid` | Yes | BUYER | N/A | Binding commitment |

### Offers
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/offers/` | Yes | BUYER | N/A | Financial commitment |
| POST | `/offers/{id}/accept` | Yes | SELLER | Yes | Transaction State change |

### Documents & Data Room
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/documents/{id}/download`| Yes | Authorized | Relationship | Data Exposure |
| POST | `/ndas/listing/{id}/sign` | Yes | BUYER | N/A | Legal State Change |
| PATCH | `/ndas/requests/{id}` | Yes | SELLER | Yes | Permission Grant |

### Admin & Trust
| Method | Path | Auth | Role | Owner Check | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/admin-trust/listings/{id}/vetting` | Yes | ADMIN | No | Asset Validation |
| POST | `/admin-trust/verifications/{id}/review`| Yes | ADMIN | No | User Credibility |

## Security Verification Checklist per API
1. JWT Token valid?
2. User Role allowed?
3. User Owns resource? (e.g. `listing.seller_id == current_user.id`)
4. Input sanitized (Pydantic)?
5. Idempotency Key provided for mutations?
6. Side-effect logged?
