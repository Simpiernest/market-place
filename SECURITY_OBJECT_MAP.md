# Business Bridge Security Object Map

## User & Identity
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| USER | Self | Self, Admin | Self (Limited) | Admin | `password_hash`, `email`, `role` |
| ORGANIZATION | Owner | Members | Owner, Admin | Admin | `slug`, `name` |
| ROLE | System | Admin | Admin | N/A | `role_name` |
| VERIFICATION | User | Self, Compliance | Compliance | Compliance | `evidence` (URLs), `status` |

## Marketplace & Listing
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUSINESS | Seller | Seller, Admin | Seller | Seller, Admin | `website_url`, `financial_data` |
| LISTING | Seller | Public (Public parts) | Seller, Admin | Seller, Admin | `asking_price`, `revenue`, `profit`, `status` |
| PRIVATE_INFO | Seller | Approved Buyer | Seller | N/A | `exact_domain`, `customer_data` |

## Acquisition & Negotiation
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| OFFER | Buyer | Buyer, Seller | Buyer (Withdraw), Seller (Accept/Reject) | N/A | `amount`, `terms`, `status` |
| NDA | Seller | Buyer, Seller | N/A | N/A | `content` |
| NDA_SIGNATURE | Buyer | Buyer, Seller | N/A | N/A | `full_legal_name`, `ip_address`, `timestamp` |
| ACCESS_REQUEST| Buyer | Buyer, Seller | Seller (Approve/Reject) | N/A | `status`, `rejection_reason` |

## Transaction & Finance
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TRANSACTION | Participants | Buyer, Seller, Admin | System | N/A | `amount`, `status`, `payment_id` |
| PAYMENT_EVENT | System | Participants, Admin | N/A | N/A | `amount`, `provider_ref`, `status` |
| WEBHOOK_EVENT | System | Admin | N/A | N/A | `provider_event_id`, `payload_preview` (Replay Protection) |
| LEDGER_ENTRY | System | Admin | N/A | N/A | `amount`, `type`, `reference` |
| PAYOUT | Seller | Seller, Admin | Finance | N/A | `amount`, `destination_metadata`, `status` |
| DISPUTE | Creator | Participants, Admin | Mediator | N/A | `reason`, `description`, `status` |

## Data Room & Documents
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DOCUMENT | Uploader | Authorized | Uploader | Uploader | `file_url`, `filename` |
| ASSET_TRANSFER| Seller | Participants | Participants | N/A | `status`, `evidence`, `handover_data` |

## AI Domain
| Object | Owner | Read | Update | Delete | Sensitive Fields |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AI_CONVERSATION| User | Self | System | Self | `messages` |
| AI_TOOL | System | System | N/A | N/A | `arguments`, `results` |
| AUDIT_LOG | System | Admin | N/A | N/A | `actor`, `action`, `resource_id`, `changes` |

## State Machine Overview

### Listing Status
`DRAFT` -> `PENDING_REVIEW` -> `APPROVED` -> `PUBLISHED` -> `UNDER_CONTRACT` -> `SOLD`

### Transaction Status
`DRAFT` -> `OFFER_ACCEPTED` -> `DUE_DILIGENCE` -> `AGREEMENT_SIGNED` -> `PAYMENT_CONFIRMED` -> `TRANSFER_COMPLETED` -> `COMPLETED`

### Verification Status
`NOT_STARTED` -> `IN_PROGRESS` -> `UNDER_REVIEW` -> `VERIFIED` / `REJECTED`
