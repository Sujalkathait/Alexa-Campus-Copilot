from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.infrastructure.repositories.user_repo import UserRepository
from app.infrastructure.repositories.assignment_repo import AssignmentRepository
from app.infrastructure.repositories.session_repo import StudySessionRepository
from app.infrastructure.repositories.reminder_repo import ReminderRepository
from app.infrastructure.ai.bedrock_adapter import get_ai_provider

from app.application.services.assignment_service import AssignmentService
from app.application.services.study_planner_service import StudyPlannerService
from app.application.services.reminder_service import ReminderService
from app.application.services.study_assistant_service import StudyAssistantService
from app.application.services.dashboard_service import DashboardService
from app.application.services.chat_service import ChatService
from app.application.commands.dispatcher import CommandDispatcher

def get_current_user_id(db: Session = Depends(get_db)) -> str:
    """Authentication dependency returning the verified current student user ID."""
    user_repo = UserRepository(db)
    user = user_repo.get_or_create_demo_user()
    return user.id

def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_assignment_repo(db: Session = Depends(get_db)) -> AssignmentRepository:
    return AssignmentRepository(db)

def get_session_repo(db: Session = Depends(get_db)) -> StudySessionRepository:
    return StudySessionRepository(db)

def get_reminder_repo(db: Session = Depends(get_db)) -> ReminderRepository:
    return ReminderRepository(db)

def get_assignment_service(
    repo: AssignmentRepository = Depends(get_assignment_repo)
) -> AssignmentService:
    return AssignmentService(repo)

def get_planner_service(
    assignment_repo: AssignmentRepository = Depends(get_assignment_repo),
    session_repo: StudySessionRepository = Depends(get_session_repo)
) -> StudyPlannerService:
    return StudyPlannerService(assignment_repo, session_repo)

def get_reminder_service(
    repo: ReminderRepository = Depends(get_reminder_repo)
) -> ReminderService:
    return ReminderService(repo)

def get_study_assistant_service() -> StudyAssistantService:
    return StudyAssistantService()

def get_dashboard_service(
    user_repo: UserRepository = Depends(get_user_repo),
    assignment_repo: AssignmentRepository = Depends(get_assignment_repo),
    session_repo: StudySessionRepository = Depends(get_session_repo),
    reminder_repo: ReminderRepository = Depends(get_reminder_repo)
) -> DashboardService:
    return DashboardService(user_repo, assignment_repo, session_repo, reminder_repo)

def get_command_dispatcher(
    assignment_service: AssignmentService = Depends(get_assignment_service),
    planner_service: StudyPlannerService = Depends(get_planner_service),
    reminder_service: ReminderService = Depends(get_reminder_service),
    assistant_service: StudyAssistantService = Depends(get_study_assistant_service)
) -> CommandDispatcher:
    return CommandDispatcher(
        assignment_service,
        planner_service,
        reminder_service,
        assistant_service
    )

def get_chat_service(
    dispatcher: CommandDispatcher = Depends(get_command_dispatcher),
    user_repo: UserRepository = Depends(get_user_repo)
) -> ChatService:
    ai_provider = get_ai_provider()
    return ChatService(ai_provider, dispatcher, user_repo)
