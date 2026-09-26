# Business Bridge Security Architecture

## System Overview
Business Bridge is a digital asset acquisition marketplace with a focus on trust and financial security. The architecture follows a strict decoupled model between the frontend and backend, with the backend serving as the absolute source of truth for all security, financial, and ownership decisions.

## Architectural Layers

### 1. Frontend (Completely Untrusted)
- **Framework:** Next.js (App Router)
- **State Management:** Client-side state is considered advisory only. No security decisions are made based on client-side state.
- **Communication:** All actions are performed via REST API calls with JWT authentication.
- **Security Posture:** Assume the frontend can be modified, bypassed, or replayed.

### 2. API Gateway & Middleware (Backend Entry)
- **Framework:** FastAPI
- **Authentication:** JWT-based using Supabase Auth.
- **Middleware:**
    - CORS Policy: Restrict to authorized origins.
    - Rate Limiting: Prevent brute force and DoS.
    - Security Headers: HSTS, CSP, X-Frame-Options, etc.
- **Validation:** Pydantic models for strict input schema enforcement.

### 3. Service Layer (Business Logic)
- **Authorization:** Resource-level permission checks (RBAC + Relationship-based checks).
- **Financial Orchestration:** Centralized transaction services to handle escrow, payments, and payouts.
- **AI Security:** AI agents operate through restricted toolsets. The backend validates all AI-requested parameters before execution.

### 4. Persistence Layer (Authoritative Truth)
- **Database:** PostgreSQL (Authoritative for all state).
- **Integrity:** Foreign keys, unique constraints, and atomic transactions.
- **Locking:** `SELECT FOR UPDATE` used for critical financial operations to prevent race conditions.
- **Object Storage:** Supabase Storage with Private buckets and signed, short-lived URLs for sensitive documents.

## Security Boundary Map

### Trust Boundary: Backend API
Every request crossing from the untrusted Frontend/Internet into the Backend must be:
1. Authenticated (Who are you?)
2. Authorized (Can you do this to this specific object?)
3. Validated (Is the data safe and logical?)

### Trust Boundary: Financial Ledger
Financial state changes (Balances, Transaction Status) must be:
1. Atomic (All or nothing)
2. Immutable (Logged history)
3. Provider-verified (Status based on external provider webhooks with signature verification)

### Trust Boundary: Data Room
Document access must be:
1. Verified against NDA status.
2. Verified against Seller approval status.
3. Served via short-lived signed URLs only.

## AI Security Model
- **Input:** Sanitized before processing.
- **Output:** Treated as untrusted text.
- **Execution:** Can only trigger actions through a well-defined Tool API that re-authorizes the user.
- **Data Access:** AI can only see data the user is already authorized to see.
