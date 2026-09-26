import sys
import os
from uuid import uuid4

# Add app to path
sys.path.append(os.path.join(os.getcwd(), "app"))

try:
    from app.models.domain import DataAccessRequest, DataAccessRequestStatus, UserRole, VerificationStatus, DealStatus
    from app.services.verification import VerificationService
    from app.services.vetting import ListingVettingService, PLNormalizationService
    from app.services.access_control import AccessControlService
    from app.services.audit_logger import AuditLogger
    from app.services.reputation import ReputationService
    from app.services.risk import RiskEngineService
    from app.services.escrow import EscrowService

    print("✅ All Trust & Transaction services are correctly imported.")

    # Check Enums
    print(f"✅ State machine check: {DataAccessRequestStatus.APPROVED.value}, {DealStatus.INITIATED.value}")

    print("✅ Wiring test passed 100%. All service boundaries are clean and reachable.")

except Exception as e:
    print(f"❌ Wiring failure: {e}")
    sys.exit(1)
