from datetime import datetime, timezone, timedelta
from app.infrastructure.repositories.assignment_repo import AssignmentRepository
from app.infrastructure.repositories.session_repo import StudySessionRepository
from app.infrastructure.repositories.reminder_repo import ReminderRepository
from app.application.services.assignment_service import AssignmentService
from app.application.services.study_planner_service import StudyPlannerService
from app.application.services.reminder_service import ReminderService
from app.application.services.study_assistant_service import StudyAssistantService
from app.application.commands.dispatcher import CommandDispatcher

def test_command_dispatcher_create_assignment(db_session):
    user_id = "test-student-id-123"
    assignment_repo = AssignmentRepository(db_session)
    session_repo = StudySessionRepository(db_session)
    reminder_repo = ReminderRepository(db_session)

    assignment_service = AssignmentService(assignment_repo)
    planner_service = StudyPlannerService(assignment_repo, session_repo)
    reminder_service = ReminderService(reminder_repo)
    assistant_service = StudyAssistantService()

    dispatcher = CommandDispatcher(
        assignment_service,
        planner_service,
        reminder_service,
        assistant_service
    )

    # Test creating assignment via dispatcher
    now = datetime.now(timezone.utc)
    res = dispatcher.dispatch(
        tool_name="create_assignment",
        user_id=user_id,
        tool_input={
            "title": "Algorithms Dynamic Programming",
            "due_date": (now + timedelta(days=2)).isoformat(),
            "priority": "HIGH",
            "estimated_minutes": 90
        }
    )
    assert res.success is True
    assert "Algorithms Dynamic Programming" in res.message
    assert res.data["title"] == "Algorithms Dynamic Programming"
    assert res.data["priority"] == "HIGH"

def test_command_dispatcher_generate_plan(db_session):
    user_id = "test-student-id-123"
    assignment_repo = AssignmentRepository(db_session)
    session_repo = StudySessionRepository(db_session)
    reminder_repo = ReminderRepository(db_session)

    assignment_service = AssignmentService(assignment_repo)
    planner_service = StudyPlannerService(assignment_repo, session_repo)
    reminder_service = ReminderService(reminder_repo)
    assistant_service = StudyAssistantService()

    dispatcher = CommandDispatcher(
        assignment_service,
        planner_service,
        reminder_service,
        assistant_service
    )

    # Pre-populate assignment
    now = datetime.now(timezone.utc)
    assignment_service.create_assignment(user_id, {
        "title": "Machine Learning Lab",
        "due_date": now + timedelta(days=1),
        "estimated_minutes": 60,
        "priority": "HIGH"
    })

    res = dispatcher.dispatch(
        tool_name="generate_study_plan",
        user_id=user_id,
        tool_input={
            "available_minutes": 120,
            "strategy": "deadline_first",
            "save_to_schedule": True
        }
    )
    assert res.success is True
    assert res.data["total_study_minutes"] > 0
    assert len(res.data["plan"]) >= 1

def test_command_dispatcher_reminder_deduplication(db_session):
    user_id = "test-student-id-123"
    assignment_repo = AssignmentRepository(db_session)
    session_repo = StudySessionRepository(db_session)
    reminder_repo = ReminderRepository(db_session)

    dispatcher = CommandDispatcher(
        AssignmentService(assignment_repo),
        StudyPlannerService(assignment_repo, session_repo),
        ReminderService(reminder_repo),
        StudyAssistantService()
    )

    now = datetime.now(timezone.utc) + timedelta(hours=3)
    # First creation
    res1 = dispatcher.dispatch(
        tool_name="create_reminder",
        user_id=user_id,
        tool_input={
            "message": "Submit Homework 3",
            "scheduled_at": now.isoformat()
        }
    )
    assert res1.success is True
    first_id = res1.data["id"]

    # Duplicate call within minutes
    res2 = dispatcher.dispatch(
        tool_name="create_reminder",
        user_id=user_id,
        tool_input={
            "message": "Submit Homework 3",
            "scheduled_at": (now + timedelta(minutes=5)).isoformat()
        }
    )
    assert res2.success is True
    # Must return the same existing reminder ID rather than inserting duplicate!
    assert res2.data["id"] == first_id

def test_command_dispatcher_unauthorized_tool(db_session):
    dispatcher = CommandDispatcher(None, None, None, None)
    res = dispatcher.dispatch(
        tool_name="malicious_eval_script",
        user_id="test-student-id-123",
        tool_input={"code": "os.system('rm -rf /')"}
    )
    assert res.success is False
    assert "Unrecognized or forbidden" in res.error
