# Business Bridge Security Threat Model

## 1. Actor Profiles & Goals
| Actor | Motivation | High-Value Targets |
| :--- | :--- | :--- |
| **Malicious Buyer** | Financial Gain | Steal business data, bypass payments, initiate fake refunds. |
| **Malicious Seller** | Financial Gain | Payout manipulation, double-selling assets, fake metrics. |
| **External Attacker** | Data Theft / DoS | User PII, financial ledgers, system credentials, API keys. |
| **Compromised AI** | Unauthorized Action | Privilege escalation via prompt injection, data leakage. |

## 2. Attack Vectors & Mitigations

### Vector: Financial State Manipulation (Critical)
- **Threat**: Client modifies request body to change `amount` or `paid` status.
- **Mitigation**: Atomic backend authority. All financial changes are derived from signed provider webhooks (Stripe/Paystack) and server-side balance calculations.

### Vector: Data Exfiltration (High)
- **Threat**: BOLA attack to view private listing financials or documents.
- **Mitigation**: Relationship-based authorization. API verifies `NDA_SIGNED` + `SELLER_APPROVED` status before returning private listing data or document links.

### Vector: Race Conditions (High)
- **Threat**: Simultaneous "Buy Now" clicks to win an asset twice.
- **Mitigation**: Database locking (`with_for_update`) ensures only the first transaction is processed; subsequent requests are rejected.

### Vector: AI Prompt Injection (Medium)
- **Threat**: Forcing the AI Broker to reveal secrets or other users' data.
- **Mitigation**: AI tools are sandboxed. The AI has no direct DB access and must pass through the same authorization middleware as the frontend.

## 3. Trust Invariants
1. No money moves without a verified provider event.
2. No private data is exposed without a valid NDA signature.
3. No user can escalate their own role.
