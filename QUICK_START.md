# Quick Start Guide

## Prerequisites
- Node.js 24+
- Python 3.11+
- PostgreSQL 15+
- Redis 5.2+
- npm 10+

## 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install frontend dependencies (from root)
cd ../..
npm install
```

## 2. Database Setup

```bash
# Create database
createdb business_bridge

# Run migrations
cd apps/api
alembic upgrade head
```

## 3. Environment Configuration

**apps/api/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/business_bridge
REDIS_URL=redis://localhost:6379
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret_key_change_in_production
STRIPE_SECRET_KEY=sk_test_...
EMAIL_PROVIDER=RESEND
RESEND_API_KEY=re_...
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 4. Start Services

**Terminal 1 - Backend:**
```bash
cd apps/api
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Worker (optional):**
```bash
cd apps/worker
celery -A celery_app worker --loglevel=info
```

**Terminal 3 - Frontend:**
```bash
cd apps/web
npm run dev
```

## 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 6. Test Accounts

Create test accounts through the signup flow at http://localhost:3000/auth/signup

**Roles available:**
- BUYER
- SELLER
- BROKER

## 7. Run Tests

**Backend:**
```bash
cd apps/api
pytest
```

**Frontend:**
```bash
cd apps/web
npm run test
npm run test:e2e  # Requires dev server running
```

## Common Issues

**Port already in use:**
```bash
# Change ports in commands above
# Backend: uvicorn main:app --reload --port 8001
# Frontend: npm run dev -- -p 3001
```

**Database connection error:**
- Verify PostgreSQL is running
- Check DATABASE_URL matches your setup
- Ensure database exists

**Supabase errors:**
- Get free account at https://supabase.com
- Create project and copy credentials
- Enable Email Auth in Authentication settings

**Redis connection error:**
- Worker features require Redis
- Backend works without Redis (some features disabled)

## Next Steps

1. Configure Supabase project (Auth, Storage)
2. Set up Stripe test account for payments
3. Configure email provider (Resend recommended)
4. Explore API documentation at /docs
5. Review implementation details in IMPLEMENTATION_COMPLETE.md
