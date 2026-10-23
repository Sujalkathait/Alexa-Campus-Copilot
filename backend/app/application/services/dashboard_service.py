from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

from app.infrastructure.repositories.user_repo import UserRepository
from app.infrastructure.repositories.assignment_repo import AssignmentRepository
from app.infrastructure.repositories.session_repo import StudySessionRepository
from app.infrastructure.repositories.reminder_repo import ReminderRepository
from app.domain.events.subscribers import ACTIVITY_FEED
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.assignment import AssignmentOut
from app.schemas.study_session import StudySessionOut
from app.schemas.reminder import ReminderOut
from app.domain.entities.models import AssignmentStatusEnum

class DashboardService:
    """Service Layer Pattern: Aggregates real-time metrics for the Student Dashboard."""
    def __init__(
        self,
        user_repo: UserRepository,
        assignment_repo: AssignmentRepository,
        session_repo: StudySessionRepository,
        reminder_repo: ReminderRepository
    ):
        self.user_repo = user_repo
        self.assignment_repo = assignment_repo
        self.session_repo = session_repo
        self.reminder_repo = reminder_repo

    def get_summary(self, user_id: str) -> DashboardSummaryResponse:
        user = self.user_repo.get_by_id(user_id) or self.user_repo.get_or_create_demo_user()
        
        # 1. Assignment statistics
        stats = self.assignment_repo.get_stats(user.id)
        total_assignments = stats["total"]
        completed_count = stats["completed"]
        pending_count = stats["pending"]
        overdue_count = stats["overdue"]

        # Urgent assignments (closest deadlines)
        urgent_entities = self.assignment_repo.get_urgent_and_overdue(user.id, limit=5)
        now = datetime.now(timezone.utc)
        urgent_dtos = []
        for a in urgent_entities:
            due = a.due_at if a.due_at.tzinfo else a.due_at.replace(tzinfo=timezone.utc)
            is_overdue = (a.status != AssignmentStatusEnum.COMPLETED and due < now)
            hours_diff = (due - now).total_seconds() / 3600.0
            urgent_dtos.append(
                AssignmentOut(
                    id=a.id,
                    user_id=a.user_id,
                    title=a.title,
                    description=a.description,
                    due_at=a.due_at,
                    estimated_minutes=a.estimated_minutes,
                    priority=a.priority,
                    status=a.status,
                    created_at=a.created_at,
                    updated_at=a.updated_at,
                    is_overdue=is_overdue,
                    hours_remaining=round(hours_diff, 1)
                )
            )

        # 2. Today's study sessions
        today_session_entities = self.session_repo.get_today_sessions(user.id)
        today_sessions_dtos = []
        today_planned_minutes = 0
        for s in today_session_entities:
            duration = int((s.ends_at - s.starts_at).total_seconds() / 60)
            today_planned_minutes += duration
            today_sessions_dtos.append(
                StudySessionOut(
                    id=s.id,
                    user_id=s.user_id,
                    assignment_id=s.assignment_id,
                    title=s.title,
                    starts_at=s.starts_at,
                    ends_at=s.ends_at,
                    status=s.status,
                    notes=s.notes,
                    created_at=s.created_at,
                    duration_minutes=duration
                )
            )

        # 3. Upcoming reminders
        reminder_entities = self.reminder_repo.list(user.id, only_upcoming=True)
        reminder_dtos = [
            ReminderOut(
                id=r.id,
                user_id=r.user_id,
                assignment_id=r.assignment_id,
                message=r.message,
                scheduled_at=r.scheduled_at,
                status=r.status,
                sent_at=r.sent_at,
                created_at=r.created_at
            ) for r in reminder_entities[:5]
        ]

        # 4. Productivity score computation (0-100)
        # Factor completed assignments, having planned sessions, and lack of overdue
        base_score = 50
        if total_assignments > 0:
            completion_rate = (completed_count / total_assignments) * 40
            base_score += completion_rate
        if today_planned_minutes >= 60:
            base_score += 15
        elif today_planned_minutes > 0:
            base_score += 10
        base_score -= (overdue_count * 8)
        productivity_score = max(10, min(100, int(base_score)))

        # 5. Weekly breakdown (mock/derived count per day)
        weekly = {
            "Mon": 3,
            "Tue": 2,
            "Wed": 4,
            "Thu": 1,
            "Fri": 5,
            "Sat": 2,
            "Sun": 1
        }

        return DashboardSummaryResponse(
            user_name=user.name,
            user_email=user.email,
            timezone=user.timezone,
            total_assignments=total_assignments,
            pending_assignments_count=pending_count,
            completed_assignments_count=completed_count,
            overdue_assignments_count=overdue_count,
            today_study_minutes_planned=today_planned_minutes,
            productivity_score=productivity_score,
            urgent_assignments=urgent_dtos,
            today_sessions=today_sessions_dtos,
            upcoming_reminders=reminder_dtos,
            recent_activities=ACTIVITY_FEED[:10],
            weekly_breakdown=weekly
        )
