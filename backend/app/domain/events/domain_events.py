from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

@dataclass
class DomainEvent:
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class AssignmentCreatedEvent(DomainEvent):
    assignment_id: str = ""
    user_id: str = ""
    title: str = ""
    due_at: Optional[datetime] = None
    priority: str = "MEDIUM"

@dataclass
class AssignmentUpdatedEvent(DomainEvent):
    assignment_id: str = ""
    user_id: str = ""
    changes: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DeadlineChangedEvent(DomainEvent):
    assignment_id: str = ""
    user_id: str = ""
    old_deadline: Optional[datetime] = None
    new_deadline: Optional[datetime] = None

@dataclass
class ReminderScheduledEvent(DomainEvent):
    reminder_id: str = ""
    user_id: str = ""
    scheduled_at: Optional[datetime] = None
    message: str = ""

@dataclass
class StudyPlanGeneratedEvent(DomainEvent):
    user_id: str = ""
    strategy_name: str = ""
    sessions_count: int = 0
