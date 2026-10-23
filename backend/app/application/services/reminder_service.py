from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from dateutil import parser as date_parser

from app.domain.entities.models import Reminder, ReminderStatusEnum
from app.infrastructure.repositories.reminder_repo import ReminderRepository
from app.domain.events.domain_events import ReminderScheduledEvent
from app.domain.events.event_bus import event_bus
from app.schemas.reminder import ReminderOut

class ReminderService:
    """Service Layer Pattern: Business logic and deduplication for academic reminders."""
    def __init__(self, repository: ReminderRepository):
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

    def create_reminder(self, user_id: str, data: Dict[str, Any]) -> ReminderOut:
        message = data.get("message", "").strip()
        if not message:
            raise ValueError("Reminder message cannot be empty.")

        scheduled_at = self._normalize_datetime(data.get("scheduled_at"))
        assignment_id = data.get("assignment_id")

        # Deduplication check
        existing = self.repository.find_duplicate(
            user_id=user_id,
            message=message,
            scheduled_at=scheduled_at,
            assignment_id=assignment_id
        )
        if existing:
            # Return existing reminder to prevent spam/duplicate alert
            return self._to_out_dto(existing)

        reminder = Reminder(
            user_id=user_id,
            assignment_id=assignment_id,
            message=message,
            scheduled_at=scheduled_at,
            status=ReminderStatusEnum.PENDING
        )

        saved = self.repository.add(reminder)

        # Publish Domain Event (Observer Pattern)
        event_bus.publish(
            ReminderScheduledEvent(
                reminder_id=saved.id,
                user_id=user_id,
                scheduled_at=saved.scheduled_at,
                message=saved.message
            )
        )

        return self._to_out_dto(saved)

    def list_reminders(
        self,
        user_id: str,
        status: Optional[str] = None,
        only_upcoming: bool = False
    ) -> List[ReminderOut]:
        status_enum = ReminderStatusEnum(status.upper()) if status else None
        records = self.repository.list(
            user_id=user_id,
            status=status_enum,
            only_upcoming=only_upcoming
        )
        return [self._to_out_dto(r) for r in records]

    def update_reminder(self, reminder_id: str, user_id: str, data: Dict[str, Any]) -> Optional[ReminderOut]:
        reminder = self.repository.get_by_id(reminder_id, user_id=user_id)
        if not reminder:
            return None

        if "message" in data and data["message"]:
            reminder.message = data["message"].strip()
        if "scheduled_at" in data and data["scheduled_at"]:
            reminder.scheduled_at = self._normalize_datetime(data["scheduled_at"])
        if "status" in data and data["status"]:
            reminder.status = ReminderStatusEnum(data["status"].upper())
            if reminder.status == ReminderStatusEnum.SENT and not reminder.sent_at:
                reminder.sent_at = datetime.now(timezone.utc)

        updated = self.repository.update(reminder)
        return self._to_out_dto(updated)

    def delete_reminder(self, reminder_id: str, user_id: str) -> bool:
        reminder = self.repository.get_by_id(reminder_id, user_id=user_id)
        if not reminder:
            return False
        self.repository.delete(reminder)
        return True

    def _to_out_dto(self, r: Reminder) -> ReminderOut:
        return ReminderOut(
            id=r.id,
            user_id=r.user_id,
            assignment_id=r.assignment_id,
            message=r.message,
            scheduled_at=r.scheduled_at,
            status=r.status,
            sent_at=r.sent_at,
            created_at=r.created_at
        )
