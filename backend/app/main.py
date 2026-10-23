import logging
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.domain.entities.models import (
    User,
    Assignment,
    StudySession,
    Reminder,
    PriorityEnum,
    AssignmentStatusEnum,
    SessionStatusEnum,
    ReminderStatusEnum
)
from app.domain.events.subscribers import register_default_subscribers, log_activity

# Import API routes
from app.api.routes import (
    assignments,
    study_plans,
    reminders,
    chat,
    study_assistant,
    dashboard,
    user
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def seed_demo_data():
    """Pre-seed demo student and realistic college coursework if empty."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
        if not user:
            logger.info("Seeding initial student profile and coursework demo data...")
            user = User(
                id=settings.DEMO_USER_ID,
                name=settings.DEMO_USER_NAME,
                email=settings.DEMO_USER_EMAIL,
                timezone=settings.DEMO_USER_TIMEZONE
            )
            db.add(user)
            db.commit()

        # Seed assignments if empty
        existing_assignments = db.query(Assignment).filter(Assignment.user_id == user.id).count()
        if existing_assignments == 0:
            now = datetime.now(timezone.utc)
            demo_tasks = [
                Assignment(
                    user_id=user.id,
                    title="CS301 Operating Systems: Virtual Memory Lab",
                    description="Implement page replacement algorithms (FIFO, LRU, Clock) and analyze page fault ratios.",
                    due_at=now + timedelta(days=1, hours=4),
                    estimated_minutes=90,
                    priority=PriorityEnum.HIGH,
                    status=AssignmentStatusEnum.PENDING
                ),
                Assignment(
                    user_id=user.id,
                    title="CS310 Database Management: Normalization & BCNF",
                    description="Decompose complex schemas into 3NF and BCNF. Provide dependency preservation proofs.",
                    due_at=now + timedelta(days=2, hours=8),
                    estimated_minutes=60,
                    priority=PriorityEnum.MEDIUM,
                    status=AssignmentStatusEnum.IN_PROGRESS
                ),
                Assignment(
                    user_id=user.id,
                    title="MATH204 Linear Algebra: Eigenvalues Problem Set",
                    description="Solve problems 4.1 to 4.15 on characteristic polynomials and diagonalization.",
                    due_at=now + timedelta(days=4, hours=2),
                    estimated_minutes=45,
                    priority=PriorityEnum.LOW,
                    status=AssignmentStatusEnum.PENDING
                ),
                Assignment(
                    user_id=user.id,
                    title="AI405 Machine Learning: Midterm Project Report",
                    description="Write 5-page empirical evaluation comparing Transformer attention heads with CNN baselines.",
                    due_at=now + timedelta(days=5, hours=10),
                    estimated_minutes=120,
                    priority=PriorityEnum.HIGH,
                    status=AssignmentStatusEnum.PENDING
                ),
                Assignment(
                    user_id=user.id,
                    title="ENG201 Technical Writing: Research Abstract",
                    description="Submit finalized 250-word abstract for conference submission review.",
                    due_at=now - timedelta(days=1), # Completed past task
                    estimated_minutes=30,
                    priority=PriorityEnum.LOW,
                    status=AssignmentStatusEnum.COMPLETED
                )
            ]
            db.add_all(demo_tasks)
            db.commit()

            # Refresh to obtain IDs
            for t in demo_tasks:
                db.refresh(t)

            # Seed 2 study sessions for today
            os_task = demo_tasks[0]
            db_task = demo_tasks[1]
            sessions = [
                StudySession(
                    user_id=user.id,
                    assignment_id=os_task.id,
                    title=f"Study: {os_task.title}",
                    starts_at=now + timedelta(hours=1),
                    ends_at=now + timedelta(hours=2, minutes=30),
                    status=SessionStatusEnum.SCHEDULED,
                    notes="Focus on LRU page replacement algorithm implementation."
                ),
                StudySession(
                    user_id=user.id,
                    assignment_id=db_task.id,
                    title=f"Study: {db_task.title}",
                    starts_at=now + timedelta(hours=4),
                    ends_at=now + timedelta(hours=5),
                    status=SessionStatusEnum.SCHEDULED,
                    notes="Practice 3NF lossless decomposition theorems."
                )
            ]
            db.add_all(sessions)

            # Seed reminders
            reminders_data = [
                Reminder(
                    user_id=user.id,
                    assignment_id=os_task.id,
                    message="Submit CS301 Virtual Memory Lab before the portal closes!",
                    scheduled_at=os_task.due_at - timedelta(hours=2),
                    status=ReminderStatusEnum.PENDING
                ),
                Reminder(
                    user_id=user.id,
                    assignment_id=db_task.id,
                    message="Review Database 3NF decomposition steps before recitation",
                    scheduled_at=now + timedelta(hours=3),
                    status=ReminderStatusEnum.PENDING
                )
            ]
            db.add_all(reminders_data)
            db.commit()

            log_activity("system_init", "Initialized academic environment with realistic semester coursework.")
            logger.info("Demo coursework seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}", exc_info=True)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Alexa+ Campus Copilot backend services...")
    Base.metadata.create_all(bind=engine)
    register_default_subscribers()
    seed_demo_data()
    yield
    # Shutdown
    logger.info("Shutting down Alexa+ Campus Copilot services.")

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Academic Productivity Assistant combining Amazon Bedrock tool use, layered domain architecture, and PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(assignments.router, prefix=settings.API_V1_PREFIX)
app.include_router(study_plans.router, prefix=settings.API_V1_PREFIX)
app.include_router(reminders.router, prefix=settings.API_V1_PREFIX)
app.include_router(study_assistant.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(user.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
        "demo_user": settings.DEMO_USER_NAME
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": settings.DATABASE_URL.split("://")[0]
    }
