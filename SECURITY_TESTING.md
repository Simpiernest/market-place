# Business Bridge Security Testing Guide

## 1. Automated Regression Suite
The primary security tests are located in `apps/api/tests/security`.
To run the full suite:
```bash
npm run security-audit
```
*This command enforces ENVIRONMENT=test and executes 9+ critical vulnerability checks.*

## 2. Test Scenarios Covered
- **Authentication**: Email verification bypass, JWT auto-sync.
- **Authorization**: Cross-user listing access (BOLA/IDOR), role escalation.
- **Financial**: Double-payout prevention, Buy Now race conditions.
- **State Machine**: Illegal transaction transitions.

## 3. Manual Testing (Pentest)
When adding new features, manually verify:
1. **The ID Switch**: If you change a UUID in the URL, does the API return a 403?
2. **The Role Switch**: If you try to PATCH your role in the registration/profile call, does the server block it?
3. **The Size Test**: Attempt to upload a 100MB file. The server should reject it *before* consuming system memory.
