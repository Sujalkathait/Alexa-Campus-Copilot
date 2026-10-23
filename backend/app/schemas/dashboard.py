from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.assignment import AssignmentOut
from app.schemas.study_session import StudySessionOut
from app.schemas.reminder import ReminderOut

class DashboardSummaryResponse(BaseModel):
    user_name: str
    user_email: str
    timezone: str
    total_assignments: int
    pending_assignments_count: int
    completed_assignments_count: int
    overdue_assignments_count: int
    today_study_minutes_planned: int
    productivity_score: int
    urgent_assignments: List[AssignmentOut]
    today_sessions: List[StudySessionOut]
    upcoming_reminders: List[ReminderOut]
    recent_activities: List[Dict[str, Any]]
    weekly_breakdown: Dict[str, int]
