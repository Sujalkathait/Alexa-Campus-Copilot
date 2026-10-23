from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from dateutil import parser as date_parser

from app.domain.entities.models import Assignment, AssignmentStatusEnum, PriorityEnum
from app.infrastructure.repositories.assignment_repo import AssignmentRepository
from app.domain.events.domain_events import (
    AssignmentCreatedEvent,
    AssignmentUpdatedEvent,
    DeadlineChangedEvent
)
from app.domain.events.event_bus import event_bus
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentOut

class AssignmentService:
    """Service Layer Pattern: Business logic, validation, and event handling for Assignments."""
    def __init__(self, repository: AssignmentRepository):
        self.repository = repository

    def _normalize_datetime(self, dt: Any) -> datetime:
        if isinstance(dt, str):
            try:
                parsed = date_parser.parse(dt)
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                return parsed
            except Exception:
                return datetime.now(timezone.utc)
        elif isinstance(dt, datetime):
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt
        return datetime.now(timezone.utc)

    def create_assignment(self, user_id: str, data: Dict[str, Any]) -> AssignmentOut:
        title = data.get("title", "").strip()
        if not title:
            raise ValueError("Assignment title cannot be empty.")

        due_at = self._normalize_datetime(data.get("due_at") or data.get("due_date"))
        
        priority_raw = data.get("priority", "MEDIUM")
        priority = PriorityEnum(priority_raw.upper()) if isinstance(priority_raw, str) else priority_raw

        assignment = Assignment(
            user_id=user_id,
            title=title,
            description=data.get("description"),
            due_at=due_at,
            estimated_minutes=int(data.get("estimated_minutes", 60)),
            priority=priority,
            status=AssignmentStatusEnum.PENDING
        )

        saved = self.repository.add(assignment)

        # Publish Domain Event (Observer Pattern)
        event_bus.publish(
            AssignmentCreatedEvent(
                assignment_id=saved.id,
                user_id=user_id,
                title=saved.title,
                due_at=saved.due_at,
                priority=saved.priority.value
            )
        )

        return self._to_out_dto(saved)

    def get_assignment(self, assignment_id: str, user_id: str) -> Optional[AssignmentOut]:
        assignment = self.repository.get_by_id(assignment_id, user_id=user_id)
        return self._to_out_dto(assignment) if assignment else None

    def list_assignments(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[AssignmentOut]:
        status_enum = AssignmentStatusEnum(status.upper()) if status else None
        priority_enum = PriorityEnum(priority.upper()) if priority else None

        records = self.repository.list(
            user_id=user_id,
            status=status_enum,
            priority=priority_enum,
            search=search
        )
        return [self._to_out_dto(a) for a in records]

    def update_assignment(self, assignment_id: str, user_id: str, data: Dict[str, Any]) -> Optional[AssignmentOut]:
        assignment = self.repository.get_by_id(assignment_id, user_id=user_id)
        if not assignment:
            return None

        old_due = assignment.due_at
        changes = {}

        if "title" in data and data["title"]:
            assignment.title = data["title"].strip()
            changes["title"] = assignment.title
        if "description" in data:
            assignment.description = data["description"]
            changes["description"] = assignment.description
        if "due_at" in data and data["due_at"]:
            new_due = self._normalize_datetime(data["due_at"])
            assignment.due_at = new_due
            changes["due_at"] = new_due.isoformat()
            if old_due != new_due:
                event_bus.publish(
                    DeadlineChangedEvent(
                        assignment_id=assignment.id,
                        user_id=user_id,
                        old_deadline=old_due,
                        new_deadline=new_due
                    )
                )
        if "estimated_minutes" in data and data["estimated_minutes"]:
            assignment.estimated_minutes = int(data["estimated_minutes"])
            changes["estimated_minutes"] = assignment.estimated_minutes
        if "priority" in data and data["priority"]:
            assignment.priority = PriorityEnum(data["priority"].upper())
            changes["priority"] = assignment.priority.value
        if "status" in data and data["status"]:
            assignment.status = AssignmentStatusEnum(data["status"].upper())
            changes["status"] = assignment.status.value

        updated = self.repository.update(assignment)

        # Publish domain event
        event_bus.publish(
            AssignmentUpdatedEvent(
                assignment_id=updated.id,
                user_id=user_id,
                changes=changes
            )
        )

        return self._to_out_dto(updated)

    def delete_assignment(self, assignment_id: str, user_id: str) -> bool:
        assignment = self.repository.get_by_id(assignment_id, user_id=user_id)
        if not assignment:
            return False
        self.repository.delete(assignment)
        return True

    def get_stats(self, user_id: str) -> Dict[str, int]:
        return self.repository.get_stats(user_id)

    def _to_out_dto(self, a: Assignment) -> AssignmentOut:
        now = datetime.now(timezone.utc)
        due = a.due_at
        if due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)

        is_overdue = (a.status != AssignmentStatusEnum.COMPLETED and due < now)
        hours_diff = (due - now).total_seconds() / 3600.0

        return AssignmentOut(
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
