from datetime import datetime, timezone
from app.domain.events.domain_events import AssignmentCreatedEvent, DeadlineChangedEvent
from app.domain.events.event_bus import EventBus

def test_event_bus_publish_and_subscribe():
    bus = EventBus()
    received_events = []

    def on_assignment_created(event: AssignmentCreatedEvent):
        received_events.append(event)

    bus.subscribe(AssignmentCreatedEvent, on_assignment_created)

    event = AssignmentCreatedEvent(
        assignment_id="a1",
        user_id="u1",
        title="Physics Lab",
        due_at=datetime.now(timezone.utc),
        priority="HIGH"
    )

    bus.publish(event)
    assert len(received_events) == 1
    assert received_events[0].title == "Physics Lab"
    assert received_events[0].priority == "HIGH"

def test_event_bus_history_tracking():
    bus = EventBus()
    event1 = AssignmentCreatedEvent(assignment_id="a1", user_id="u1", title="Task 1")
    event2 = DeadlineChangedEvent(assignment_id="a1", user_id="u1")

    bus.publish(event1)
    bus.publish(event2)

    history = bus.get_history()
    assert len(history) == 2
    assert history[0].assignment_id == "a1"
