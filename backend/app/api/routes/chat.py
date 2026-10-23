from fastapi import APIRouter, Depends
from app.api.deps import get_current_user_id, get_chat_service
from app.application.services.chat_service import ChatService
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/chat", tags=["AI Copilot Chat"])

@router.post("", response_model=ChatMessageResponse)
def chat_with_copilot(
    payload: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id),
    service: ChatService = Depends(get_chat_service)
):
    """
    Process natural-language or voice-transcribed student requests.
    Translates intents to Amazon Bedrock Converse tool calls, validates parameters,
    and executes backend services.
    """
    return service.process_chat(
        user_id=user_id,
        message=payload.message,
        conversation_history=payload.conversation_history
    )
