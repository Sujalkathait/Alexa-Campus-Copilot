from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.models import Reminder, ReminderStatusEnum

class ReminderRepository:
    """Repository pattern implementation for Reminder persistence with deduplication logic."""
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, reminder_id: str, user_id: Optional[str] = None) -> Optional[Reminder]:
        query = self.session.query(Reminder).filter(Reminder.id == reminder_id)
        if user_id:
            query = query.filter(Reminder.user_id == user_id)
        return query.first()

    def list(
        self,
        user_id: str,
        status: Optional[ReminderStatusEnum] = None,
        only_upcoming: bool = False
    ) -> List[Reminder]:
        query = self.session.query(Reminder).filter(Reminder.user_id == user_id)
        if status:
            query = query.filter(Reminder.status == status)
        if only_upcoming:
            now = datetime.now(timezone.utc)
            query = query.filter(
                Reminder.scheduled_at >= now,
                Reminder.status == ReminderStatusEnum.PENDING
            )

        return query.order_by(Reminder.scheduled_at.asc()).all()

    def find_duplicate(
        self,
        user_id: str,
        message: str,
        scheduled_at: datetime,
        assignment_id: Optional[str] = None
    ) -> Optional[Reminder]:
        """Check for existing duplicate reminder within a 30-minute window."""
        window_start = scheduled_at - timedelta(minutes=30)
        window_end = scheduled_at + timedelta(minutes=30)

        query = self.session.query(Reminder).filter(
            Reminder.user_id == user_id,
            Reminder.status == ReminderStatusEnum.PENDING,
            Reminder.scheduled_at >= window_start,
            Reminder.scheduled_at <= window_end
        )

        if assignment_id:
            query = query.filter(Reminder.assignment_id == assignment_id)
        else:
            query = query.filter(Reminder.message.ilike(message.strip()))

        return query.first()

    def add(self, reminder: Reminder) -> Reminder:
        self.session.add(reminder)
        self.session.commit()
        self.session.refresh(reminder)
        return reminder

    def update(self, reminder: Reminder) -> Reminder:
        self.session.commit()
        self.session.refresh(reminder)
        return reminder

    def delete(self, reminder: Reminder) -> None:
        self.session.delete(reminder)
        self.session.commit()
