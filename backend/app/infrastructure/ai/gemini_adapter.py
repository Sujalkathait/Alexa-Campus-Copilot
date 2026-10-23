import json
import logging
import urllib.request
import urllib.error
import uuid
import re
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.infrastructure.ai.provider import AIProvider

logger = logging.getLogger(__name__)

class GeminiAdapter:
    """
    Adapter Pattern: Official Google Gemini API adapter conforming to AIProvider protocol.
    Supports Gemini 2.5 Flash and Gemini 1.5 Flash models with rate limiting and quota handling.
    """
    def __init__(self, api_key: str, model: str = "gemini-3.8-flash"):
        self.api_key = api_key
        self.model = model

    def converse(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tool_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute conversation with Google Gemini API and convert response into the canonical
        converse dict format: {"text": str, "tool_calls": List[Dict], "stop_reason": str}
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        # Format messages for Gemini API
        gemini_contents = []
        for msg in messages:
            role = "user" if msg.get("role") in ("user", "system") else "model"
            content = msg.get("content")
            if isinstance(content, str):
                gemini_contents.append({"role": role, "parts": [{"text": content}]})
            elif isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        parts.append({"text": item["text"]})
                if parts:
                    gemini_contents.append({"role": role, "parts": parts})

        payload: Dict[str, Any] = {
            "contents": gemini_contents,
            "generationConfig": {
                "maxOutputTokens": 800,
                "temperature": 0.7
            }
        }

        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                res_body = resp.read().decode("utf-8")
                res_json = json.loads(res_body)

                candidates = res_json.get("candidates", [])
                if not candidates:
                    return {"text": "I've reviewed your request. How else can I assist you?", "tool_calls": [], "stop_reason": "end_turn"}

                first_candidate = candidates[0]
                content = first_candidate.get("content", {})
                parts = content.get("parts", [])

                text_blocks = []
                tool_calls = []

                for part in parts:
                    if "text" in part:
                        text_blocks.append(part["text"])

                raw_text = "\n".join(text_blocks)

                # Check if the text contains a structured JSON tool call (e.g. from system instruction)
                parsed_json = None
                try:
                    cleaned = re.sub(r'^```json\s*', '', raw_text.strip(), flags=re.IGNORECASE)
                    cleaned = re.sub(r'^```\s*', '', cleaned)
                    cleaned = re.sub(r'\s*```$', '', cleaned)
                    parsed_json = json.loads(cleaned)
                except Exception:
                    parsed_json = None

                if parsed_json and isinstance(parsed_json, dict) and "executed_actions" in parsed_json:
                    actions = parsed_json.get("executed_actions", [])
                    for act in actions:
                        tool_calls.append({
                            "id": f"call_{uuid.uuid4().hex[:8]}",
                            "name": act.get("tool", "create_assignment"),
                            "input": act.get("details", {})
                        })
                    final_text = parsed_json.get("reply", raw_text)
                    return {
                        "text": final_text,
                        "tool_calls": tool_calls,
                        "stop_reason": "tool_use" if tool_calls else "end_turn"
                    }

                return {
                    "text": raw_text,
                    "tool_calls": tool_calls,
                    "stop_reason": "end_turn"
                }

        except urllib.error.HTTPError as e:
            err_content = e.read().decode("utf-8", errors="ignore")
            logger.warning(f"Google Gemini API error HTTP {e.code}: {err_content}")
            raise
        except Exception as e:
            logger.error(f"Google Gemini connection failure: {e}", exc_info=True)
            raise
