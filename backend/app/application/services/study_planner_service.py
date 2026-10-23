from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.domain.entities.models import StudySession, SessionStatusEnum
from app.infrastructure.repositories.assignment_repo import AssignmentRepository
from app.infrastructure.repositories.session_repo import StudySessionRepository
from app.domain.strategies.planner_strategies import get_planning_strategy
from app.domain.events.domain_events import StudyPlanGeneratedEvent
from app.domain.events.event_bus import event_bus
from app.schemas.study_session import StudySessionOut, StudyPlanResponse

class StudyPlannerService:
    """Service Layer Pattern: Coordinates study plan scheduling using Strategy Pattern."""
    def __init__(self, assignment_repo: AssignmentRepository, session_repo: StudySessionRepository):
        self.assignment_repo = assignment_repo
        self.session_repo = session_repo

    def generate_plan(
        self,
        user_id: str,
        available_minutes: int,
        strategy_name: str = "deadline_first",
        start_time: Optional[datetime] = None,
        save_to_schedule: bool = False
    ) -> StudyPlanResponse:
        tasks = self.assignment_repo.get_pending_tasks_for_planning(user_id)
        strategy = get_planning_strategy(strategy_name)

        plan_items = strategy.create_plan(
            tasks=tasks,
            available_minutes=available_minutes,
            start_time=start_time or datetime.now(timezone.utc)
        )

        total_study_minutes = sum(item.get("duration_minutes", 0) for item in plan_items)
        saved_dtos: Optional[List[StudySessionOut]] = None

        if save_to_schedule and plan_items:
            sessions_to_create = []
            for item in plan_items:
                session = StudySession(
                    user_id=user_id,
                    assignment_id=item.get("assignment_id"),
                    title=item.get("title", "Study Session"),
                    starts_at=item["starts_at"],
                    ends_at=item["ends_at"],
                    status=SessionStatusEnum.SCHEDULED,
                    notes=item.get("notes")
                )
                sessions_to_create.append(session)
            
            created_records = self.session_repo.add_all(sessions_to_create)
            saved_dtos = [self._to_out_dto(s) for s in created_records]

        # Publish Domain Event (Observer Pattern)
        event_bus.publish(
            StudyPlanGeneratedEvent(
                user_id=user_id,
                strategy_name=strategy.name,
                sessions_count=len(plan_items)
            )
        )

        # Format plan items dates to isoformat for json response
        serializable_plan = []
        for p in plan_items:
            item_copy = dict(p)
            if isinstance(item_copy.get("starts_at"), datetime):
                item_copy["starts_at"] = item_copy["starts_at"].isoformat()
            if isinstance(item_copy.get("ends_at"), datetime):
                item_copy["ends_at"] = item_copy["ends_at"].isoformat()
            serializable_plan.append(item_copy)

        return StudyPlanResponse(
            strategy_used=strategy.name,
            total_study_minutes=total_study_minutes,
            sessions_count=len(plan_items),
            plan=serializable_plan,
            saved_sessions=saved_dtos
        )

    def list_sessions(
        self,
        user_id: str,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[StudySessionOut]:
        status_enum = SessionStatusEnum(status.upper()) if status else None
        sessions = self.session_repo.list(
            user_id=user_id,
            status=status_enum,
            date_from=date_from,
            date_to=date_to
        )
        return [self._to_out_dto(s) for s in sessions]

    def get_today_sessions(self, user_id: str) -> List[StudySessionOut]:
        sessions = self.session_repo.get_today_sessions(user_id)
        return [self._to_out_dto(s) for s in sessions]

    def create_session(self, user_id: str, data: Dict[str, Any]) -> StudySessionOut:
        session = StudySession(
            user_id=user_id,
            assignment_id=data.get("assignment_id"),
            title=data.get("title", "Study Session"),
            starts_at=data["starts_at"],
            ends_at=data["ends_at"],
            status=SessionStatusEnum.SCHEDULED,
            notes=data.get("notes")
        )
        saved = self.session_repo.add(session)
        return self._to_out_dto(saved)

    def update_session(self, session_id: str, user_id: str, data: Dict[str, Any]) -> Optional[StudySessionOut]:
        session = self.session_repo.get_by_id(session_id, user_id=user_id)
        if not session:
            return None
        
        if "title" in data:
            session.title = data["title"]
        if "starts_at" in data:
            session.starts_at = data["starts_at"]
        if "ends_at" in data:
            session.ends_at = data["ends_at"]
        if "status" in data:
            session.status = SessionStatusEnum(data["status"].upper())
        if "notes" in data:
            session.notes = data["notes"]

        updated = self.session_repo.update(session)
        return self._to_out_dto(updated)

    def delete_session(self, session_id: str, user_id: str) -> bool:
        session = self.session_repo.get_by_id(session_id, user_id=user_id)
        if not session:
            return False
        self.session_repo.delete(session)
        return True

    def _to_out_dto(self, s: StudySession) -> StudySessionOut:
        duration = int((s.ends_at - s.starts_at).total_seconds() / 60)
        return StudySessionOut(
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
