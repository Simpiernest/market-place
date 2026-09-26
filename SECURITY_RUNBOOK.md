# Business Bridge Security Runbook

## 1. Incident Response: Potential Financial Fraud
If a suspicious financial state or payout attempt is detected:
1. **Lock the User**: Set `is_active = false` on the suspected User account.
2. **Review Ledger**: Query `financial_audit_logs` and `ledger_entries` for mismatches.
3. **Contact Provider**: Check the Stripe/Paystack dashboard for the `provider_reference` to verify the external event.

## 2. Payout Approval Procedure
Admin Payout approval must follow these steps:
1. Verify the seller's `identity_verified` status.
2. Cross-reference the `Available Balance` against the `COMPLETED` transactions.
3. Confirm the `payout_method` matches the registered seller metadata.

## 3. Secret Rotation
In the event of a credential leak (e.g., accidental push to GitHub):
1. **Rotate JWT**: Change `JWT_SECRET` in production immediately. This will log everyone out.
2. **Rotate API Keys**: Regenerate keys in Stripe/Paystack/Google dashboards.
3. **Invalidate Tokens**: Clear the Redis cache to revoke all existing sessions.

## 4. Maintenance Vetting
- **Audit Logs**: Review `audit_logs` weekly for `UNAUTHORIZED_ROLE_REQUESTED` or `BOLA_ATTEMPT` events.
- **Verification Docs**: Ensure private documents are purged from storage after successful vetting.
