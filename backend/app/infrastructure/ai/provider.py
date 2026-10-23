from typing import Protocol, List, Dict, Any, Optional

class AIProvider(Protocol):
    """Adapter Pattern: Interface defining AI generation and tool-calling capabilities."""
    
    def converse(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tool_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute conversation with the AI provider adhering to Bedrock Converse format.
        Returns a dict containing:
        - "text": assistant textual response
        - "tool_calls": list of requested tool invocations (name, toolUseId, input)
        - "stop_reason": 'end_turn' | 'tool_use' | etc.
        """
        ...
