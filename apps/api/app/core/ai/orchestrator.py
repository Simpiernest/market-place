from abc import ABC, abstractmethod
from typing import List, Optional, Any, Dict
from uuid import UUID
import logging
from sqlalchemy.orm import Session

from app.core.ai.schemas import AIResponse, AIMessage as AISchemaMessage, AIToolCall as AISchemaToolCall
from app.models.domain import AIConversation, AIMessage, AIToolCall

logger = logging.getLogger(__name__)

class AIProvider(ABC):
    """Abstract interface for AI model providers (OpenAI, Anthropic, etc.)"""

    @abstractmethod
    async def chat(self, messages: List[AISchemaMessage], tools: Optional[List[Dict]] = None) -> AISchemaMessage:
        pass

class AIOrchestrator:
    """Manages AI interactions, tool routing, and security."""

    def __init__(self, provider: AIProvider):
        self.provider = provider
        self.tool_registry = {}

    def register_tool(self, name: str, func: callable, schema: Dict):
        """Register a tool that the AI can call."""
        self.tool_registry[name] = {"func": func, "schema": schema}

    async def run_conversation(
        self,
        messages: List[AISchemaMessage],
        db: Session,
        user_id: UUID,
        agent_type: str = "GENERAL",
        context_type: Optional[str] = None,
        context_id: Optional[UUID] = None
    ) -> AIResponse:
        """Runs a conversation with the AI, handling tool calls recursively and logging to DB."""

        # 1. Create durable conversation record
        db_conv = AIConversation(
            user_id=user_id,
            agent_type=agent_type,
            context_type=context_type,
            context_id=context_id
        )
        db.add(db_conv)
        db.commit()
        db.refresh(db_conv)

        # Log initial user messages
        for m in messages:
            db_msg = AIMessage(
                conversation_id=db_conv.id,
                role=m.role,
                content=m.content
            )
            db.add(db_msg)

        tools = [t["schema"] for t in self.tool_registry.values()]

        # Initial model call
        response_msg = await self.provider.chat(messages, tools=tools if tools else None)
        messages.append(response_msg)

        # Log model response
        db_response = AIMessage(
            conversation_id=db_conv.id,
            role="assistant",
            content=response_msg.content or ""
        )
        db.add(db_response)
        db.commit()
        db.refresh(db_response)

        # Handle tool calls if any
        if response_msg.tool_calls:
            for tool_call in response_msg.tool_calls:
                tool = self.tool_registry.get(tool_call.name)
                if not tool:
                    logger.error(f"Tool {tool_call.name} not found in registry")
                    continue

                logger.info(f"Executing tool: {tool_call.name}")

                # Log tool call attempt
                db_tool_call = AIToolCall(
                    message_id=db_response.id,
                    tool_name=tool_call.name,
                    arguments=tool_call.arguments
                )
                db.add(db_tool_call)

                try:
                    # Execute the registered function
                    result = await tool["func"](**tool_call.arguments)

                    db_tool_call.result = result
                    db_tool_call.success = True

                    messages.append(AISchemaMessage(
                        role="tool",
                        content=str(result),
                        tool_call_id=tool_call.id
                    ))
                except Exception as e:
                    logger.error(f"Error executing tool {tool_call.name}: {e}")
                    db_tool_call.result = {"error": str(e)}
                    db_tool_call.success = False

                    messages.append(AISchemaMessage(
                        role="tool",
                        content=f"Error: {str(e)}",
                        tool_call_id=tool_call.id
                    ))

            db.commit()

            # Get final response after tool results
            final_response = await self.provider.chat(messages)

            # Log final response
            db_final = AIMessage(
                conversation_id=db_conv.id,
                role="assistant",
                content=final_response.content or ""
            )
            db.add(db_final)
            db.commit()

            return AIResponse(content=final_response.content)

        db.commit()
        return AIResponse(content=response_msg.content)

class HumanApprovalService:
    """Ensures high-impact AI actions require explicit user confirmation."""

    async def request_approval(self, action_type: str, data: Dict[str, Any]) -> str:
        """
        In production, this would create a notification/task for the user.
        For V2, we'll return a 'PENDING_APPROVAL' status.
        """
        logger.info(f"Human approval required for action: {action_type}")
        return "PENDING_APPROVAL"
