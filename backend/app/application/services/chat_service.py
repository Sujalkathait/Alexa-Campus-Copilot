import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.infrastructure.ai.provider import AIProvider
from app.infrastructure.ai.tools_schema import BEDROCK_CAMPUS_TOOLS
from app.application.commands.dispatcher import CommandDispatcher
from app.infrastructure.repositories.user_repo import UserRepository
from app.schemas.chat import ChatMessageResponse, ExecutedAction

logger = logging.getLogger(__name__)

class ChatService:
    """
    Coordinates the AI conversational workflow, Bedrock tool calling,
    and command execution for academic productivity.
    """
    def __init__(
        self,
        ai_provider: AIProvider,
        dispatcher: CommandDispatcher,
        user_repo: UserRepository
    ):
        self.ai_provider = ai_provider
        self.dispatcher = dispatcher
        self.user_repo = user_repo

    def process_chat(
        self,
        user_id: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> ChatMessageResponse:
        user = self.user_repo.get_by_id(user_id) or self.user_repo.get_or_create_demo_user()
        now_utc = datetime.now(timezone.utc)

        system_prompt = (
            f"You are Alexa+ Campus Copilot, an elite AI-powered academic assistant for college students. "
            f"Current UTC timestamp: {now_utc.isoformat()}. Student Name: {user.name}. Student Timezone: {user.timezone}. "
            f"Rules:\n"
            f"1. AI understands and plans; backend services validate and execute.\n"
            f"2. When the student wants to record an assignment, homework, lab, or exam, call 'create_assignment'. Never invent or assume a deadline without basis; if missing, ask the student.\n"
            f"3. When the student asks to plan study time, call 'generate_study_plan'.\n"
            f"4. When the student asks for reminders, call 'create_reminder'.\n"
            f"5. When the student asks to explain a concept or quiz them, use the respective tool.\n"
            f"6. Keep replies concise, motivating, and clear."
        )

        messages: List[Dict[str, Any]] = []
        if conversation_history:
            for item in conversation_history[-6:]:
                messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
        
        messages.append({"role": "user", "content": message})

        # Call AI Provider (Bedrock Adapter / Mock Bedrock)
        ai_res = self.ai_provider.converse(
            messages=messages,
            system_prompt=system_prompt,
            tool_config=BEDROCK_CAMPUS_TOOLS
        )

        executed_actions: List[ExecutedAction] = []
        tool_calls = ai_res.get("tool_calls", [])
        action_required = ai_res.get("action_required", False)
        missing_fields = ai_res.get("missing_fields", None)

        for tc in tool_calls:
            tool_name = tc.get("name")
            tool_input = tc.get("input", {})
            cmd_result = self.dispatcher.dispatch(tool_name, user.id, tool_input)

            executed_actions.append(
                ExecutedAction(
                    tool=tool_name,
                    action_type="command_execution",
                    status="success" if cmd_result.success else "error",
                    details=cmd_result.data or {"error": cmd_result.error},
                    summary=cmd_result.message
                )
            )

        reply_text = ai_res.get("text", "")
        if not reply_text and executed_actions:
            reply_text = "\n".join(ea.summary for ea in executed_actions)

        # Smart suggested quick-replies for the frontend pills
        suggested = self._generate_suggested_replies(message, executed_actions)

        return ChatMessageResponse(
            reply=reply_text,
            action_required=action_required,
            missing_fields=missing_fields,
            executed_actions=executed_actions,
            suggested_replies=suggested
        )

    def _generate_suggested_replies(self, query: str, actions: List[ExecutedAction]) -> List[str]:
        q = query.lower()
        if any(a.tool == "create_assignment" for a in actions):
            return [
                "Plan study schedule for this",
                "Set a reminder 2 hours before due date",
                "Quiz me on this subject",
                "Show my updated dashboard"
            ]
        elif any(a.tool == "generate_study_plan" for a in actions):
            return [
                "Commit this plan to my schedule",
                "Switch to Workload Balance strategy",
                "Add a 15-minute break",
                "What assignments are still pending?"
            ]
        elif "explain" in q:
            return [
                "Quiz me on this concept",
                "Give me a real-world coding example",
                "Summarize in 3 bullet points"
            ]
        else:
            return [
                "Add my Database assignment due tomorrow 5 PM",
                "Plan my study schedule for 3 hours tonight",
                "Explain Virtual Memory in OS",
                "Quiz me on Database Normalization",
                "Remind me about the Physics midterm"
            ]
