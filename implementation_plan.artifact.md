# Implementation Plan - Full System Security Hardening

This plan addresses identified security vulnerabilities and business logic flaws discovered during the initial audit of the Business Bridge application.

## User Review Required

> [!IMPORTANT]
> Some fixes involve adding strict server-side authorization checks that may cause unauthorized direct API calls (which might have worked previously due to frontend-only logic) to fail with a `403 Forbidden` error.

## Open Questions

> [!WARNING]
> Should we implement a "payout request" model to track the state of withdrawals, or should we rely on the `TransactionStatus` and a dedicated `Payout` record? I recommend a dedicated `Payout` record for better auditability.

## Proposed Changes

### 1. Backend Security: Authorization & BOLA (IDOR) Fixes

Fix data leakage where private listings could be accessed by anyone with the ID or Slug.

#### [MODIFY] [listings.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/api/v1/endpoints/listings.py)
- Update `get_listing` to check `ListingVisibility`. If `PRIVATE`, verify that the `current_user` is the owner or has an approved `DataAccessRequest`.

#### [MODIFY] [marketplace.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/api/v1/endpoints/marketplace.py)
- Update `get_listing_by_slug` to perform the same visibility and authorization checks as `get_listing`.

---

### 2. Backend Security: Race Condition Protection

Prevent "double-sale" or "double-acceptance" of offers when multiple concurrent requests are made, especially for "Buy Now" listings.

#### [MODIFY] [offers.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/api/v1/endpoints/offers.py)
- Use `with_for_update()` in `create_offer` when handling "Buy Now" auto-acceptance to lock the listing record during the state transition.
- Ensure only one offer can be auto-accepted.

---

### 3. Backend Security: Financial Integrity & Payouts

Implement a secure payout request system to prevent unauthorized balance manipulation.

#### [MODIFY] [domain.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/models/domain.py)
- Add a `Payout` model to track withdrawal requests, statuses (`PENDING`, `COMPLETED`, `FAILED`), and audit metadata.

#### [MODIFY] [payouts.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/api/v1/endpoints/payouts.py)
- Add `POST /request` endpoint.
- Verify that the seller has sufficient "Available Balance" before creating a payout request.
- Ensure the payout amount is greater than zero and within platform limits.

---

### 4. Backend Security: Storage & File Validation

Fix potential DoS via large file uploads and improve private file security.

#### [MODIFY] [storage.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/services/storage.py)
- Update `validate_file` to check the file size header BEFORE reading the entire content into memory.
- Update `upload_file` to handle signed URLs correctly for private buckets.

---

### 5. AI Security: Tool Re-Authorization

Ensure the AI cannot be "tricked" into executing tools for resources the user doesn't own.

#### [MODIFY] [ai_broker.py](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/api/app/api/v1/endpoints/ai_broker.py)
- Add explicit ownership checks to all AI-triggered analysis tools.

---

### 6. UI: Mobile Responsiveness for Dashboards

Ensure the platform is usable on mobile devices, specifically the Seller and Buyer dashboards.

#### [MODIFY] [layout.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/layout.tsx)
- Implement a responsive container that hides the sidebar on mobile and shows a toggleable drawer.

#### [MODIFY] [sidebar.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/components/dashboard/sidebar.tsx)
- Add mobile-specific styling and close mechanisms for the drawer mode.

#### [MODIFY] [page.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/seller/page.tsx) & [page.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/buyer/page.tsx)
- Update grid layouts and table containers to be responsive (horizontal scroll or stack).

## Verification Plan

### Automated Tests
- Run `pytest apps/api/tests/security` (newly created) to verify:
    - Unauthorized access to private listings returns 403.
    - Concurrent "Buy Now" requests only result in one acceptance.
    - Payout requests for more than the available balance fail.
    - Large file uploads are rejected early.

### Manual Verification
- Attempt to access a private listing ID from an unauthenticated browser.
- Attempt to modify a listing belonging to another user via direct API call.
