from abc import ABC, abstractmethod
from typing import Dict, Any
from uuid import UUID
from app.models.domain import Transaction, TransactionStatus

class BaseEscrowProvider(ABC):
    @abstractmethod
    async def create_transaction(self, deal_id: UUID, amount: float) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_status(self, provider_id: str) -> str:
        pass

class EscrowDotComStub(BaseEscrowProvider):
    async def create_transaction(self, deal_id: UUID, amount: float) -> Dict[str, Any]:
        return {
            "provider_id": f"escrow_{deal_id}",
            "status": "AWAITING_FUNDS",
            "url": f"https://escrow.businessbridge.com/tx/{deal_id}"
        }

    async def get_status(self, provider_id: str) -> str:
        return "FUNDS_SECURED"

class EscrowService:
    def __init__(self, provider: BaseEscrowProvider = EscrowDotComStub()):
        self.provider = provider

    async def initiate_deal_escrow(self, deal_id: UUID, amount: float):
        return await self.provider.create_transaction(deal_id, amount)
