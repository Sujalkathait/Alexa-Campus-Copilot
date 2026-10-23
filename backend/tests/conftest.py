import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.domain.entities.models import User
from app.main import app

@pytest.fixture(scope="function")
def test_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="function")
def db_session(test_engine):
    Session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = Session()

    # Pre-seed demo user in test db
    user = User(
        id="test-student-id-123",
        name="Test Student",
        email="test@campus.edu",
        timezone="Asia/Kolkata"
    )
    session.add(user)
    session.commit()

    yield session

    session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    from app.api.deps import get_current_user_id
    def override_user_id():
        return "test-student-id-123"

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user_id] = override_user_id

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
