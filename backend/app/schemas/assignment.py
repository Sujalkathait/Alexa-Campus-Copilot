from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.domain.entities.models import PriorityEnum, AssignmentStatusEnum

class AssignmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Assignment or homework title")
    description: Optional[str] = Field(None, max_length=2000, description="Assignment description or syllabus details")
    due_at: datetime = Field(..., description="Target due deadline in ISO format")
    estimated_minutes: int = Field(60, ge=5, le=1440, description="Estimated effort in minutes")
    priority: PriorityEnum = Field(PriorityEnum.MEDIUM, description="Task priority")

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(None, ge=5, le=1440)
    priority: Optional[PriorityEnum] = None
    status: Optional[AssignmentStatusEnum] = None

class AssignmentOut(AssignmentBase):
    id: str
    user_id: str
    status: AssignmentStatusEnum
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = False
    hours_remaining: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
