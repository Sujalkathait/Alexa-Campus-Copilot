from typing import Optional
from sqlalchemy.orm import Session
from app.domain.entities.models import User
from app.core.config import settings

class UserRepository:
    """Repository pattern implementation for User persistence."""
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.session.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email).first()

    def get_or_create_demo_user(self) -> User:
        user = self.get_by_id(settings.DEMO_USER_ID)
        if not user:
            user = self.get_by_email(settings.DEMO_USER_EMAIL)
        if not user:
            user = User(
                id=settings.DEMO_USER_ID,
                name=settings.DEMO_USER_NAME,
                email=settings.DEMO_USER_EMAIL,
                timezone=settings.DEMO_USER_TIMEZONE
            )
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
        return user

    def update_timezone(self, user_id: str, new_tz: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.timezone = new_tz
            self.session.commit()
            self.session.refresh(user)
        return user
