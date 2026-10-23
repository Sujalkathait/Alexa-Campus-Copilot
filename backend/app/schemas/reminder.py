from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.domain.entities.models import ReminderStatusEnum

class ReminderBase(BaseModel):
    message: str = Field(..., min_length=2, max_length=255, description="Reminder text content")
    scheduled_at: datetime = Field(..., description="Delivery timestamp")
    assignment_id: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    message: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[ReminderStatusEnum] = None

class ReminderOut(ReminderBase):
    id: str
    user_id: str
    status: ReminderStatusEnum
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
