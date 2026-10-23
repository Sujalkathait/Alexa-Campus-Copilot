from datetime import datetime, timezone
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.domain.entities.models import Assignment, AssignmentStatusEnum, PriorityEnum

class AssignmentRepository:
    """Repository pattern implementation for Assignment entity data access."""
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, assignment_id: str, user_id: Optional[str] = None) -> Optional[Assignment]:
        query = self.session.query(Assignment).filter(Assignment.id == assignment_id)
        if user_id:
            query = query.filter(Assignment.user_id == user_id)
        return query.first()

    def list(
        self,
        user_id: str,
        status: Optional[AssignmentStatusEnum] = None,
        priority: Optional[PriorityEnum] = None,
        search: Optional[str] = None
    ) -> List[Assignment]:
        query = self.session.query(Assignment).filter(Assignment.user_id == user_id)
        
        if status:
            query = query.filter(Assignment.status == status)
        if priority:
            query = query.filter(Assignment.priority == priority)
        if search:
            search_fmt = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Assignment.title.ilike(search_fmt),
                    Assignment.description.ilike(search_fmt)
                )
            )

        # Default order: earliest due date first
        return query.order_by(Assignment.due_at.asc()).all()

    def get_pending_tasks_for_planning(self, user_id: str) -> List[Assignment]:
        """Fetch incomplete tasks for the study planner."""
        return (
            self.session.query(Assignment)
            .filter(
                Assignment.user_id == user_id,
                Assignment.status != AssignmentStatusEnum.COMPLETED
            )
            .order_by(Assignment.due_at.asc())
            .all()
        )

    def get_urgent_and_overdue(self, user_id: str, limit: int = 5) -> List[Assignment]:
        """Fetch closest upcoming and overdue assignments."""
        return (
            self.session.query(Assignment)
            .filter(
                Assignment.user_id == user_id,
                Assignment.status != AssignmentStatusEnum.COMPLETED
            )
            .order_by(Assignment.due_at.asc())
            .limit(limit)
            .all()
        )

    def add(self, assignment: Assignment) -> Assignment:
        self.session.add(assignment)
        self.session.commit()
        self.session.refresh(assignment)
        return assignment

    def update(self, assignment: Assignment) -> Assignment:
        self.session.commit()
        self.session.refresh(assignment)
        return assignment

    def delete(self, assignment: Assignment) -> None:
        self.session.delete(assignment)
        self.session.commit()

    def get_stats(self, user_id: str) -> Dict[str, int]:
        now = datetime.now(timezone.utc)
        assignments = self.session.query(Assignment).filter(Assignment.user_id == user_id).all()
        
        total = len(assignments)
        completed = sum(1 for a in assignments if a.status == AssignmentStatusEnum.COMPLETED)
        pending = sum(1 for a in assignments if a.status != AssignmentStatusEnum.COMPLETED)
        
        # Determine overdue (not completed and due_at < now)
        overdue = 0
        for a in assignments:
            if a.status != AssignmentStatusEnum.COMPLETED:
                due = a.due_at
                if due.tzinfo is None:
                    due = due.replace(tzinfo=timezone.utc)
                if due < now:
                    overdue += 1

        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "overdue": overdue
        }
