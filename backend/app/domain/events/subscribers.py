import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.domain.events.domain_events import (
    DomainEvent,
    AssignmentCreatedEvent,
    AssignmentUpdatedEvent,
    DeadlineChangedEvent,
    ReminderScheduledEvent,
    StudyPlanGeneratedEvent,
)
from app.domain.events.event_bus import event_bus

logger = logging.getLogger(__name__)

# In-memory recent activities list for dashboard and feeds
ACTIVITY_FEED: List[Dict[str, Any]] = []

def log_activity(activity_type: str, message: str, meta: Dict[str, Any] = None):
    entry = {
        "id": len(ACTIVITY_FEED) + 1,
        "type": activity_type,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "meta": meta or {}
    }
    ACTIVITY_FEED.insert(0, entry)
    if len(ACTIVITY_FEED) > 100:
        ACTIVITY_FEED.pop()

def on_assignment_created(event: AssignmentCreatedEvent) -> None:
    logger.info(f"[EVENT] Assignment created: '{event.title}' (ID: {event.assignment_id}, Priority: {event.priority})")
    log_activity(
        activity_type="assignment_created",
        message=f"Created assignment '{event.title}' with {event.priority} priority.",
        meta={"assignment_id": event.assignment_id, "priority": event.priority}
    )

def on_assignment_updated(event: AssignmentUpdatedEvent) -> None:
    logger.info(f"[EVENT] Assignment updated: ID {event.assignment_id}")
    log_activity(
        activity_type="assignment_updated",
        message=f"Updated assignment details.",
        meta={"assignment_id": event.assignment_id, "changes": event.changes}
    )

def on_deadline_changed(event: DeadlineChangedEvent) -> None:
    logger.info(f"[EVENT] Deadline shifted for assignment {event.assignment_id}: {event.new_deadline}")
    log_activity(
        activity_type="deadline_changed",
        message=f"Deadline rescheduled to {event.new_deadline}.",
        meta={"assignment_id": event.assignment_id, "new_deadline": str(event.new_deadline)}
    )

def on_reminder_scheduled(event: ReminderScheduledEvent) -> None:
    logger.info(f"[EVENT] Reminder scheduled: '{event.message}' at {event.scheduled_at}")
    log_activity(
        activity_type="reminder_scheduled",
        message=f"Reminder scheduled: '{event.message}'",
        meta={"reminder_id": event.reminder_id, "scheduled_at": str(event.scheduled_at)}
    )

def on_study_plan_generated(event: StudyPlanGeneratedEvent) -> None:
    logger.info(f"[EVENT] Study plan generated using strategy '{event.strategy_name}' with {event.sessions_count} sessions.")
    log_activity(
        activity_type="plan_generated",
        message=f"Generated {event.sessions_count} study sessions using {event.strategy_name.replace('_', ' ').title()} strategy.",
        meta={"strategy": event.strategy_name, "count": event.sessions_count}
    )

def register_default_subscribers():
    """Register all default domain observers onto the EventBus."""
    event_bus.subscribe(AssignmentCreatedEvent, on_assignment_created)
    event_bus.subscribe(AssignmentUpdatedEvent, on_assignment_updated)
    event_bus.subscribe(DeadlineChangedEvent, on_deadline_changed)
    event_bus.subscribe(ReminderScheduledEvent, on_reminder_scheduled)
    event_bus.subscribe(StudyPlanGeneratedEvent, on_study_plan_generated)
    logger.info("Default domain event subscribers successfully registered.")
