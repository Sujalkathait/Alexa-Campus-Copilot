from fastapi import APIRouter, Depends
from app.api.deps import get_study_assistant_service
from app.application.services.study_assistant_service import StudyAssistantService
from app.schemas.study_assistant import (
    ConceptExplainRequest,
    ConceptExplainResponse,
    QuizGenerateRequest,
    QuizGenerateResponse,
    NotesSummarizeRequest,
    NotesSummarizeResponse
)

router = APIRouter(prefix="/study-assistant", tags=["Study Assistant"])

@router.post("/explain", response_model=ConceptExplainResponse)
def explain_concept(
    payload: ConceptExplainRequest,
    service: StudyAssistantService = Depends(get_study_assistant_service)
):
    """Explain a difficult academic concept with analogies, pitfalls, and recap."""
    return service.explain_concept(topic=payload.topic, difficulty=payload.difficulty)

@router.post("/quiz", response_model=QuizGenerateResponse)
def generate_quiz(
    payload: QuizGenerateRequest,
    service: StudyAssistantService = Depends(get_study_assistant_service)
):
    """Generate multiple-choice practice quiz questions for exam revision."""
    return service.generate_quiz(topic=payload.topic, num_questions=payload.num_questions)

@router.post("/summarize", response_model=NotesSummarizeResponse)
def summarize_notes(
    payload: NotesSummarizeRequest,
    service: StudyAssistantService = Depends(get_study_assistant_service)
):
    """Summarize lecture notes into high-yield exam takeaways."""
    return service.summarize_notes(content=payload.content, focus=payload.focus or "exam_revision")
