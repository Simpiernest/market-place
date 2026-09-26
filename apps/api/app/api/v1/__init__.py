"""
API v1 Router
Main API router that includes all domain routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    listings,
    marketplace,
    buyers,
    sellers,
    messages,
    offers,
    deal_rooms,
    verification,
    documents,
    transactions,
    notifications,
    admin,
    ndas,
    organizations,
    ai_broker,
    listing_access,
    brokers,
    deals,
    payments,
    payouts,
    seo,
    admin_trust,
    feedback,
    disputes,
)

api_router = APIRouter()

# Include domain routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])
api_router.include_router(listings.router, prefix="/listings", tags=["Listings"])
api_router.include_router(buyers.router, prefix="/buyers", tags=["Buyers"])
api_router.include_router(sellers.router, prefix="/sellers", tags=["Sellers"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messaging"])
api_router.include_router(offers.router, prefix="/offers", tags=["Offers"])
api_router.include_router(deal_rooms.router, prefix="/deal-rooms", tags=["Deal Rooms"])
api_router.include_router(verification.router, prefix="/verification", tags=["Verification"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(ndas.router, prefix="/ndas", tags=["NDAs"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(ai_broker.router, prefix="/ai-broker", tags=["AI Broker"])
api_router.include_router(listing_access.router, prefix="/listing-access", tags=["Listing Access"])
api_router.include_router(brokers.router, prefix="/brokers", tags=["Brokers"])
api_router.include_router(deals.router, prefix="/deals", tags=["Deals"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(payouts.router, prefix="/payouts", tags=["Payouts"])
api_router.include_router(seo.router, prefix="/seo", tags=["SEO"])
api_router.include_router(admin_trust.router, prefix="/admin-trust", tags=["Admin Trust"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(disputes.router, prefix="/disputes", tags=["Disputes"])
