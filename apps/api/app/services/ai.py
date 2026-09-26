from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import json
from app.core.config import settings

class BaseAIProvider(ABC):
    @abstractmethod
    async def chat_completion(self, messages: List[Dict[str, str]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        pass

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def chat_completion(self, messages: List[Dict[str, str]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        params: Dict[str, Any] = {
            "model": "gpt-4o",
            "messages": messages,
        }
        if tools:
            params["tools"] = tools

        response = await self.client.chat.completions.create(**params)
        message = response.choices[0].message

        return {
            "content": message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "name": tc.function.name,
                    "arguments": json.loads(tc.function.arguments)
                } for tc in (message.tool_calls or [])
            ]
        }

class AnthropicProvider(BaseAIProvider):
    def __init__(self):
        from anthropic import AsyncAnthropic
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def chat_completion(self, messages: List[Dict[str, str]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        # Implementation for Anthropic API
        params: Dict[str, Any] = {
            "model": "claude-3-5-sonnet-20241022",
            "messages": messages,
            "max_tokens": 1024
        }
        if tools:
            params["tools"] = tools

        response = await self.client.messages.create(**params)

        return {
            "content": response.content[0].text if response.content else "",
            "tool_calls": [] # Anthropic tool call handling logic is different, can be refined
        }

class MockAIProvider(BaseAIProvider):
    async def chat_completion(self, messages: List[Dict[str, str]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        # Logic to simulate natural language search processing
        last_message = messages[-1]["content"].lower()

        if "saas" in last_message and "under" in last_message:
            return {
                "content": "I've analyzed the marketplace for SaaS opportunities within your budget.",
                "structured_search": {
                    "category": "SaaS",
                    "max_price": 300000,
                    "min_profit": 5000
                }
            }

        return {
            "content": "The AI Broker is ready to assist you. Ask me about specific industries, budget ranges, or risk assessments.",
            "tool_calls": []
        }

class GoogleAIProvider(BaseAIProvider):
    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def chat_completion(self, messages: List[Dict[str, str]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        # Implementation for Google Gemini API
        # Convert messages to Gemini format
        contents = []
        for m in messages:
            role = 'user' if m['role'] == 'user' else 'model'
            if m['role'] == 'system':
                # Gemini handles system instructions in a separate field in model init or as first user message
                # For simplicity here, we prepend it to the first user message or handle it as user message
                contents.append({'role': 'user', 'parts': [m['content']]})
                continue
            contents.append({'role': role, 'parts': [m['content']]})

        response = await self.model.generate_content_async(contents)

        return {
            "content": response.text,
            "tool_calls": [] # Basic implementation
        }

class AIProviderFactory:
    @staticmethod
    def get_provider() -> BaseAIProvider:
        if not settings.ENABLE_AI_FEATURES:
            return MockAIProvider()

        if settings.AI_PROVIDER == "OPENAI" and settings.OPENAI_API_KEY:
            return OpenAIProvider()
        elif settings.AI_PROVIDER == "ANTHROPIC" and settings.ANTHROPIC_API_KEY:
            return AnthropicProvider()
        elif settings.AI_PROVIDER == "GOOGLE" and settings.GOOGLE_API_KEY:
            return GoogleAIProvider()

        return MockAIProvider()

ai_provider = AIProviderFactory.get_provider()
