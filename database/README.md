# Business Bridge Database

Database schemas, migrations, and seed data for Business Bridge.

## Structure

- `models.py` - SQLAlchemy models for all domains
- `migrations/` - Alembic database migrations
- `seeds/` - Database seed data for development
- `alembic.ini` - Alembic configuration

## Running Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

## Database Domains

### Identity
- Users, roles, profiles, sessions

### Marketplace
- Businesses, listings, categories, industries

### Buyer
- Buyer profiles, mandates, saved listings

### Seller
- Seller profiles, verifications, payout accounts

### Communication
- Conversations, messages, attachments

### Offers
- Offers, counteroffers, conditions

### Verification
- Verification cases, documents, reviews

### Documents
- Document management, permissions, access logs

### Transactions
- Transaction foundation, payments, payouts

### Notifications
- User notifications, preferences

### Audit
- Comprehensive audit logging

## Schema Principles

1. **UUIDs for primary keys** - Better for distributed systems
2. **Timestamps on all tables** - Track creation and updates
3. **Soft deletes where appropriate** - Preserve history
4. **Foreign key constraints** - Enforce referential integrity
5. **Indexes on query fields** - Performance optimization
6. **Money stored as Numeric** - Never as strings or floats
7. **Currency always tracked** - Multi-currency support
8. **Immutable audit logs** - Never update historical records
