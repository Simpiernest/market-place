# Business Bridge

**Global Online Business Acquisition Marketplace**

A comprehensive platform connecting buyers, sellers, and brokers in the business acquisition space. Built with modern technologies for scalability, security, and user experience.

## 🚀 Features

- **Full-Text Search** - PostgreSQL GIN indexes for instant business discovery
- **Real-Time Messaging** - Long polling for instant buyer-seller communication
- **Secure Payments** - Multi-provider support (Stripe, Paystack) with escrow
- **Deal Rooms** - Milestone-based transaction management
- **Broker Portal** - Professional intermediary tools and client management
- **Email Notifications** - Transactional emails for all critical events
- **Background Workers** - Async task processing with Celery
- **Comprehensive Security** - Rate limiting, CSRF, CSP, XSS protection
- **SEO Optimized** - Structured data, sitemaps, meta tags

## 🛠️ Tech Stack

**Backend:**
- FastAPI 0.115+
- PostgreSQL 15+ with SQLAlchemy 2.0
- Redis + Celery
- Supabase (Auth + Storage)
- Stripe + Paystack (Payments)

**Frontend:**
- Next.js 16.3.4 (App Router)
- React 19.2.8
- Tailwind CSS 4
- Framer Motion
- shadcn/ui components

**Testing:**
- pytest (Backend)
- Vitest + Playwright (Frontend)

## 📖 Quick Start

See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

### Prerequisites
- Node.js 24+
- Python 3.11+
- PostgreSQL 15+
- Redis 5.2+

### Installation

```bash
# Install dependencies
npm install
cd apps/api && pip install -r requirements.txt

# Setup database
createdb business_bridge
cd apps/api && alembic upgrade head

# Configure environment (see QUICK_START.md)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start services
cd apps/api && uvicorn main:app --reload  # Terminal 1
cd apps/web && npm run dev                 # Terminal 2
```

Access at http://localhost:3000

## 📚 Documentation

- [Implementation Guide](IMPLEMENTATION_COMPLETE.md) - Complete feature documentation
- [Quick Start](QUICK_START.md) - Setup and configuration
- [Project Status](PROJECT_STATUS.md) - Current status and metrics
- [Backend Testing](apps/api/README_TESTING.md) - API testing guide
- [Frontend Testing](apps/web/README_TESTING.md) - UI testing guide

## 🏗️ Project Structure

```
├── apps/
│   ├── api/          # FastAPI backend (70+ files)
│   ├── web/          # Next.js frontend (25+ pages)
│   └── worker/       # Celery background workers
├── packages/         # Shared packages (types, ui, config)
└── docs/            # Additional documentation
```

## 🧪 Testing

```bash
# Backend tests
cd apps/api
pytest                    # All tests
pytest -m unit           # Unit tests only
pytest --cov=app         # With coverage

# Frontend tests
cd apps/web
npm run test             # Unit/integration (Vitest)
npm run test:e2e         # E2E tests (Playwright)
```

## 🔒 Security

- JWT authentication with Supabase
- Rate limiting (60 req/min default)
- CSRF protection
- SQL injection prevention (parameterized queries)
- XSS protection headers
- Content Security Policy
- Input validation (Pydantic)

## 📊 Status

✅ **All 16 core features complete**
- Authentication & Authorization
- Full-Text Search
- Real-Time Messaging
- Offer Management
- Multi-Provider Payments
- File Storage
- Email Notifications
- Background Workers
- Comprehensive Testing
- SEO Optimization
- Security Features
- Broker Features
- Deal Rooms
- Frontend-Backend Integration

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed metrics.

## 🚢 Deployment

The application is production-ready. Required setup:

1. Configure environment variables (API keys, database)
2. Set up Supabase project (Auth + Storage)
3. Configure payment providers (Stripe, Paystack)
4. Set up email service (Resend or SendGrid)
5. Deploy backend + worker + frontend
6. Configure domain and SSL

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For questions or issues, refer to the documentation files in this repository.

---

**Built with ❤️ for the global business acquisition community**
