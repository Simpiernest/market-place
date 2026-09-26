# Finalizing V1.5 Components: Buyer Qualification & Deal Reviews

This plan completes the remaining V1.5 user-facing features identified in the Master Build Prompt: **Buyer Qualification** and **Deal Reviews**.

## Proposed Changes

### [Frontend] Buyer & Deal Enhancements

#### [NEW] [qualification/page.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/buyer/qualification/page.tsx)
- Create a UI for buyers to submit "Proof of Funds" and "Investor Accreditation".
- Integration with `VerificationCase` backend logic to issuance of "Qualified Buyer" badges.

#### [NEW] [reviews/page.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/deals/[id]/reviews/page.tsx)
- Create a post-transaction review UI for both Buyers and Sellers.
- Categories: Communication, Professionalism, Accuracy, Transaction Experience.
- Immutable submission to the `Review` database model.

#### [MODIFY] [deals/[id]/page.tsx](file:///C:/Users/VillageTech/Desktop/Business Bridge/apps/web/src/app/dashboard/deals/[id]/page.tsx)
- Add a "Submit Review" action that appears only when a deal reaches the `COMPLETED` state.

## Verification Plan

### Automated Tests
- Static analysis of new routes and components.
- Verification of RBAC on the review submission endpoint.

### Manual Verification
1. **Qualification:** Login as Buyer $\rightarrow$ Upload "Proof of Funds" $\rightarrow$ Verify status moves to "Under Review".
2. **Review:** Advance a Deal to `COMPLETED` $\rightarrow$ Click "Submit Review" $\rightarrow$ Fill out the form $\rightarrow$ Verify it persists in the database and shows on the counterpart's profile.
