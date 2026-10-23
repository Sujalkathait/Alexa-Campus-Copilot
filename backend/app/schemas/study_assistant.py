from typing import List, Optional
from pydantic import BaseModel, Field

class ConceptExplainRequest(BaseModel):
    topic: str = Field(..., description="Academic topic to explain")
    difficulty: str = Field("undergraduate", description="Target academic level")

class ConceptExplainResponse(BaseModel):
    topic: str
    summary: str
    key_points: List[str]
    real_world_analogy: str
    common_pitfalls: List[str]
    quick_recap: str

class QuizGenerateRequest(BaseModel):
    topic: str = Field(..., description="Subject or chapter to quiz on")
    num_questions: int = Field(3, ge=1, le=10)

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class QuizGenerateResponse(BaseModel):
    topic: str
    questions: List[QuizQuestion]

class NotesSummarizeRequest(BaseModel):
    content: str = Field(..., min_length=10, max_length=10000)
    focus: Optional[str] = "exam_revision"

class NotesSummarizeResponse(BaseModel):
    title: str
    tldr: str
    bullet_points: List[str]
    recommended_study_time_minutes: int
