import logging
import uuid
import re
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from app.core.config import settings
from app.infrastructure.ai.provider import AIProvider
from app.infrastructure.ai.tools_schema import BEDROCK_CAMPUS_TOOLS

logger = logging.getLogger(__name__)

class BedrockAdapter:
    """Adapter Pattern: Amazon Bedrock integration using the Converse API with tool-use."""
    def __init__(self, client: Any, model_id: str):
        self.client = client
        self.model_id = model_id

    def converse(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tool_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        bedrock_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content")
            if isinstance(content, str):
                bedrock_messages.append({"role": role, "content": [{"text": content}]})
            elif isinstance(content, list):
                bedrock_messages.append({"role": role, "content": content})

        kwargs: Dict[str, Any] = {
            "modelId": self.model_id,
            "messages": bedrock_messages
        }
        if system_prompt:
            kwargs["system"] = [{"text": system_prompt}]
        if tool_config:
            kwargs["toolConfig"] = tool_config

        try:
            response = self.client.converse(**kwargs)
            message = response["output"]["message"]
            stop_reason = response.get("stopReason", "end_turn")
            
            text_blocks = []
            tool_calls = []
            for item in message.get("content", []):
                if "text" in item:
                    text_blocks.append(item["text"])
                elif "toolUse" in item:
                    tu = item["toolUse"]
                    tool_calls.append({
                        "id": tu.get("toolUseId", str(uuid.uuid4())),
                        "name": tu.get("name"),
                        "input": tu.get("input", {})
                    })

            return {
                "text": "\n".join(text_blocks),
                "tool_calls": tool_calls,
                "stop_reason": stop_reason
            }
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Amazon Bedrock Converse API error: {e}", exc_info=True)
            raise


class MockBedrockAdapter:
    """
    Mock AI Provider conforming to the Bedrock Converse API interface.
    Provides natural-language intent parsing and academic tool-calling capabilities
    for reliable testing and zero-credential offline demos.
    """
    def __init__(self, model_id: str = "mock-bedrock-claude-3-5"):
        self.model_id = model_id

    def converse(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tool_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        last_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                content = msg.get("content")
                if isinstance(content, str):
                    last_message = content
                elif isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict) and "text" in item:
                            last_message = item["text"]
                break

        query = last_message.strip()
        lower_query = query.lower()
        now = datetime.now(timezone.utc)

        tool_calls = []
        text_reply = ""

        # 1. Check for Assignment Creation intent
        assignment_triggers = ["add ", "create ", "assign", "homework", "due tomorrow", "due on", "due at", "submit", "paper due", "lab due"]
        is_assignment = any(trig in lower_query for trig in assignment_triggers) and not any(k in lower_query for k in ["quiz", "explain", "remind me to", "reminder"])

        if is_assignment:
            # Check if missing deadline
            has_deadline_indicator = any(d in lower_query for d in ["tomorrow", "tonight", "today", "pm", "am", "friday", "monday", "tuesday", "wednesday", "thursday", "saturday", "sunday", "oct", "nov", "dec", "due:"])
            if "tomorrow" not in lower_query and not has_deadline_indicator:
                # Ask for clarification as per spec example!
                course_guess = self._extract_subject(query)
                return {
                    "text": f"I see you want to add your {course_guess}. What date and time is it due?",
                    "tool_calls": [],
                    "stop_reason": "end_turn",
                    "action_required": True,
                    "missing_fields": ["due_date"]
                }

            # Parse deadline
            due_date = now + timedelta(days=1, hours=5)
            if "tomorrow" in lower_query:
                time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', lower_query)
                hour = 17 # default 5 PM
                minute = 0
                if time_match:
                    h = int(time_match.group(1))
                    m = int(time_match.group(2)) if time_match.group(2) else 0
                    meridiem = time_match.group(3)
                    if meridiem == "pm" and h < 12:
                        h += 12
                    elif meridiem == "am" and h == 12:
                        h = 0
                    hour, minute = h, m
                due_date = (now + timedelta(days=1)).replace(hour=hour, minute=minute, second=0, microsecond=0)

            title = self._clean_assignment_title(query)
            priority = "HIGH" if any(w in lower_query for w in ["urgent", "high", "critical", "important", "exam"]) else ("LOW" if "low" in lower_query else "MEDIUM")
            estimated_minutes = 90 if priority == "HIGH" else 60

            tool_calls.append({
                "id": f"call_{uuid.uuid4().hex[:8]}",
                "name": "create_assignment",
                "input": {
                    "title": title,
                    "due_date": due_date.isoformat(),
                    "priority": priority,
                    "estimated_minutes": estimated_minutes,
                    "description": f"Created via Alexa+ Campus Copilot command: '{query}'"
                }
            })
            text_reply = f"I've prepared to log your {title} (due {due_date.strftime('%b %d at %I:%M %p')}, {priority} priority)."

        # 2. Check for Study Plan generation intent
        elif any(w in lower_query for w in ["plan my evening", "study plan", "schedule my study", "plan my day", "study schedule", "plan today", "plan tonight"]):
            minutes = 120
            num_match = re.search(r'(\d+)\s*(?:hour|hr|minute|min)', lower_query)
            if num_match:
                val = int(num_match.group(1))
                if "hour" in lower_query or "hr" in lower_query:
                    minutes = val * 60
                else:
                    minutes = val

            strategy = "deadline_first"
            if "priority" in lower_query:
                strategy = "priority_first"
            elif "balance" in lower_query or "break" in lower_query or "burnout" in lower_query:
                strategy = "workload_balance"

            tool_calls.append({
                "id": f"call_{uuid.uuid4().hex[:8]}",
                "name": "generate_study_plan",
                "input": {
                    "available_minutes": minutes,
                    "strategy": strategy,
                    "save_to_schedule": True
                }
            })
            text_reply = f"Generating a personalized study plan for {minutes} minutes using the {strategy.replace('_', ' ').title()} strategy."

        # 3. Check for Reminder intent
        elif any(w in lower_query for w in ["remind me", "set reminder", "reminder"]):
            scheduled_at = now + timedelta(hours=2)
            msg = re.sub(r'^(remind me to|remind me|set a reminder to|set reminder for)\s*', '', query, flags=re.IGNORECASE).strip()
            if not msg:
                msg = "Review coursework and deadlines"

            tool_calls.append({
                "id": f"call_{uuid.uuid4().hex[:8]}",
                "name": "create_reminder",
                "input": {
                    "message": msg,
                    "scheduled_at": scheduled_at.isoformat()
                }
            })
            text_reply = f"I've scheduled an intelligent reminder: '{msg}'."

        # 4. Check for Concept Explanation intent
        elif any(w in lower_query for w in ["explain", "what is", "how does", "concept of"]):
            topic = re.sub(r'^(can you |please )?(explain|what is|how does the concept of|teach me about)\s*', '', query, flags=re.IGNORECASE).strip()
            topic = re.sub(r'\?$', '', topic).strip() or "Database Normalization"

            tool_calls.append({
                "id": f"call_{uuid.uuid4().hex[:8]}",
                "name": "explain_academic_concept",
                "input": {
                    "topic": topic,
                    "difficulty": "undergraduate"
                }
            })
            text_reply = f"Here is a comprehensive academic breakdown of {topic}."

        # 5. Check for Quiz intent
        elif any(w in lower_query for w in ["quiz", "test me", "practice questions"]):
            topic = re.sub(r'^(quiz me on|give me a quiz on|test me on|practice questions for)\s*', '', query, flags=re.IGNORECASE).strip()
            topic = re.sub(r'\?$', '', topic).strip() or "Computer Science Concepts"

            tool_calls.append({
                "id": f"call_{uuid.uuid4().hex[:8]}",
                "name": "generate_quiz",
                "input": {
                    "topic": topic,
                    "num_questions": 3
                }
            })
            text_reply = f"Generating a tailored academic practice quiz on {topic}."

        # Default conversational academic assistant
        else:
            text_reply = (
                f"Hello Alex! I'm Alexa+ Campus Copilot, your academic assistant. "
                f"I can help you log assignments, generate study schedules tailored to your deadlines, "
                f"set reminders, explain difficult lecture concepts, or quiz you before exams. How can I assist you right now?"
            )

        return {
            "text": text_reply,
            "tool_calls": tool_calls,
            "stop_reason": "tool_use" if tool_calls else "end_turn"
        }

    def _extract_subject(self, query: str) -> str:
        q = query.lower()
        for subj in ["mathematics assignment", "database assignment", "operating systems lab", "physics problem set", "history essay", "machine learning project", "chemistry lab"]:
            if subj in q:
                return subj.title()
        return "assignment"

    def _clean_assignment_title(self, query: str) -> str:
        q = query
        # Remove trigger prefixes
        q = re.sub(r'^(add|create|log|schedule|record)\s+(my\s+)?', '', q, flags=re.IGNORECASE)
        # Remove trailing due parts
        q = re.sub(r'\s+(due\s+.*|by\s+.*|for\s+tomorrow.*)$', '', q, flags=re.IGNORECASE)
        title = q.strip()
        if len(title) < 3:
            title = "Academic Assignment"
        # Capitalize first letter while preserving uppercase letters in the rest
        return title[0].upper() + title[1:]


def get_ai_provider() -> AIProvider:
    """Factory helper to instantiate GeminiAdapter, BedrockAdapter, or MockBedrockAdapter fallback."""
    # 1. Google Gemini Provider
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            from app.infrastructure.ai.gemini_adapter import GeminiAdapter
            logger.info("Initializing Google Gemini AI Provider.")
            return GeminiAdapter(api_key=settings.GEMINI_API_KEY)
        except Exception as e:
            logger.warning(f"Could not initialize Google Gemini adapter ({e}). Falling back.")

    # 2. AWS Bedrock Provider
    has_aws_creds = bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)
    if not settings.USE_BEDROCK_MOCK and has_aws_creds:
        try:
            client = boto3.client(
                "bedrock-runtime",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            logger.info(f"Connected to Amazon Bedrock with model: {settings.BEDROCK_MODEL_ID}")
            return BedrockAdapter(client=client, model_id=settings.BEDROCK_MODEL_ID)
        except Exception as e:
            logger.warning(f"Could not initialize Amazon Bedrock client ({e}). Falling back to MockBedrockAdapter.")
            return MockBedrockAdapter()
    
    logger.info("Using MockBedrockAdapter for zero-credential offline execution.")
    return MockBedrockAdapter()
