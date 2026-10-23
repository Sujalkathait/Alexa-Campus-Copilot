from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.domain.entities.models import SessionStatusEnum

class StudySessionBase(BaseModel):
    title: str = Field(..., max_length=200, description="Session title")
    assignment_id: Optional[str] = None
    starts_at: datetime = Field(..., description="Start timestamp")
    ends_at: datetime = Field(..., description="End timestamp")
    notes: Optional[str] = None

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionUpdate(BaseModel):
    title: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    status: Optional[SessionStatusEnum] = None
    notes: Optional[str] = None

class StudySessionOut(StudySessionBase):
    id: str
    user_id: str
    status: SessionStatusEnum
    created_at: datetime
    duration_minutes: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class StudyPlanRequest(BaseModel):
    available_minutes: int = Field(120, ge=15, le=720, description="Available study minutes today/tonight")
    strategy: str = Field("deadline_first", description="Strategy: deadline_first | priority_first | workload_balance")
    start_time: Optional[datetime] = None
    save_to_schedule: bool = Field(False, description="Whether to automatically save generated sessions to the database")

class StudyPlanResponse(BaseModel):
    strategy_used: str
    total_study_minutes: int
    sessions_count: int
    plan: List[dict]
    saved_sessions: Optional[List[StudySessionOut]] = None
