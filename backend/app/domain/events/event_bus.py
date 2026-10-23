import logging
from typing import Callable, Dict, List, Type
from app.domain.events.domain_events import DomainEvent

logger = logging.getLogger(__name__)

EventHandler = Callable[[DomainEvent], None]

class EventBus:
    """In-memory Domain Event Bus implementing the Observer Pattern."""
    _instance = None

    def __init__(self):
        self._subscribers: Dict[Type[DomainEvent], List[EventHandler]] = {}
        self._history: List[DomainEvent] = []

    @classmethod
    def get_instance(cls) -> "EventBus":
        if cls._instance is None:
            cls._instance = EventBus()
        return cls._instance

    def subscribe(self, event_type: Type[DomainEvent], handler: EventHandler) -> None:
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.debug(f"Subscribed {handler.__name__} to {event_type.__name__}")

    def publish(self, event: DomainEvent) -> None:
        self._history.append(event)
        event_type = type(event)
        
        # Notify direct subscribers
        handlers = self._subscribers.get(event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Error executing event handler {handler.__name__} for {event_type.__name__}: {e}", exc_info=True)

        # Notify wildcard subscribers if any
        wildcard_handlers = self._subscribers.get(DomainEvent, [])
        for handler in wildcard_handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Error executing wildcard handler {handler.__name__}: {e}", exc_info=True)

    def get_history(self, limit: int = 50) -> List[DomainEvent]:
        return self._history[-limit:]

    def clear(self) -> None:
        self._subscribers.clear()
        self._history.clear()

event_bus = EventBus.get_instance()
