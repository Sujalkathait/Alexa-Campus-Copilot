from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.models import StudySession, SessionStatusEnum

class StudySessionRepository:
    """Repository pattern implementation for StudySession entity persistence."""
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, session_id: str, user_id: Optional[str] = None) -> Optional[StudySession]:
        query = self.session.query(StudySession).filter(StudySession.id == session_id)
        if user_id:
            query = query.filter(StudySession.user_id == user_id)
        return query.first()

    def list(
        self,
        user_id: str,
        status: Optional[SessionStatusEnum] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[StudySession]:
        query = self.session.query(StudySession).filter(StudySession.user_id == user_id)
        if status:
            query = query.filter(StudySession.status == status)
        if date_from:
            query = query.filter(StudySession.starts_at >= date_from)
        if date_to:
            query = query.filter(StudySession.starts_at <= date_to)

        return query.order_by(StudySession.starts_at.asc()).all()

    def get_today_sessions(self, user_id: str) -> List[StudySession]:
        now = datetime.now(timezone.utc)
        start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        end_of_day = start_of_day + timedelta(days=1)
        return (
            self.session.query(StudySession)
            .filter(
                StudySession.user_id == user_id,
                StudySession.starts_at >= start_of_day,
                StudySession.starts_at < end_of_day
            )
            .order_by(StudySession.starts_at.asc())
            .all()
        )

    def add(self, study_session: StudySession) -> StudySession:
        self.session.add(study_session)
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

    def add_all(self, study_sessions: List[StudySession]) -> List[StudySession]:
        self.session.add_all(study_sessions)
        self.session.commit()
        for s in study_sessions:
            self.session.refresh(s)
        return study_sessions

    def update(self, study_session: StudySession) -> StudySession:
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

    def delete(self, study_session: StudySession) -> None:
        self.session.delete(study_session)
        self.session.commit()
