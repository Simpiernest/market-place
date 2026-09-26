from typing import List, Optional, Dict
import asyncio
import json

from app.core.ai.orchestrator import AIProvider
from app.core.ai.schemas import AIMessage, AIToolCall

class MockAIProvider(AIProvider):
    """Mock provider for development and testing."""

    async def chat(self, messages: List[AIMessage], tools: Optional[List[Dict]] = None) -> AIMessage:
        await asyncio.sleep(1) # Simulate latency

        last_message = messages[-1].content.lower() if messages[-1].content else ""

        # Simple rule-based mock responses
        if "valuation" in last_message and tools:
            return AIMessage(
                role="assistant",
                content="I'll calculate that valuation for you.",
                tool_calls=[
                    AIToolCall(
                        id="call_123",
                        name="calculate_valuation",
                        arguments={"annual_revenue": 100000, "annual_profit": 50000, "growth_rate": 15}
                    )
                ]
            )

        if "hello" in last_message:
            return AIMessage(role="assistant", content="Hello! I'm the Business Bridge AI assistant. How can I help you today?")

        return AIMessage(role="assistant", content="I understand. I'm processing your request regarding the acquisition marketplace.")

class OpenAIProvider(AIProvider):
    """Actual OpenAI implementation (Requires OPENAI_API_KEY)"""
    def __init__(self, api_key: str):
        self.api_key = api_key
        # In production, initialize OpenAI client here

    async def chat(self, messages: List[AIMessage], tools: Optional[List[Dict]] = None) -> AIMessage:
        # Implementation using 'openai' library
        raise NotImplementedError("OpenAI provider requires API configuration.")
