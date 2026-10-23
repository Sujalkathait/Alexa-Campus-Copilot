from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Student voice transcript or text query")
    timezone: Optional[str] = Field("Asia/Kolkata", description="Client timezone")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class ExecutedAction(BaseModel):
    tool: str
    action_type: str
    status: str = "success"
    details: Dict[str, Any] = Field(default_factory=dict)
    summary: str

class ChatMessageResponse(BaseModel):
    reply: str
    action_required: bool = False
    missing_fields: Optional[List[str]] = None
    executed_actions: List[ExecutedAction] = Field(default_factory=list)
    suggested_replies: List[str] = Field(default_factory=list)
