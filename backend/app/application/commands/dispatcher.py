import logging
from typing import Dict, Any, Optional

from app.application.commands.base import CommandResult
from app.application.commands.assignment_commands import (
    CreateAssignmentCommand,
    UpdateAssignmentCommand,
    DeleteAssignmentCommand
)
from app.application.commands.planner_commands import GenerateStudyPlanCommand
from app.application.commands.reminder_commands import ScheduleReminderCommand, CancelReminderCommand
from app.application.commands.study_commands import ExplainConceptCommand, GenerateQuizCommand

from app.application.services.assignment_service import AssignmentService
from app.application.services.study_planner_service import StudyPlannerService
from app.application.services.reminder_service import ReminderService
from app.application.services.study_assistant_service import StudyAssistantService

logger = logging.getLogger(__name__)

class CommandDispatcher:
    """
    Application-level Command Dispatcher (Command Pattern).
    Maps validated tool names from AI providers to safe, explicit Command handlers.
    Treats model output as untrusted input, validating permissions and inputs.
    """
    def __init__(
        self,
        assignment_service: AssignmentService,
        planner_service: StudyPlannerService,
        reminder_service: ReminderService,
        study_assistant_service: StudyAssistantService
    ):
        self.assignment_service = assignment_service
        self.planner_service = planner_service
        self.reminder_service = reminder_service
        self.study_assistant_service = study_assistant_service

    def dispatch(self, tool_name: str, user_id: str, tool_input: Dict[str, Any]) -> CommandResult:
        logger.info(f"Dispatching tool '{tool_name}' for user '{user_id}' with input: {tool_input}")

        if not user_id:
            return CommandResult(success=False, error="Unauthorized: user_id is required", message="Authentication failed.")

        # Whitelisted tools and permission handling
        if tool_name == "create_assignment":
            if not tool_input.get("title"):
                return CommandResult(success=False, error="Missing required field: title", message="Assignment title required.")
            cmd = CreateAssignmentCommand(self.assignment_service, user_id, tool_input)
            return cmd.execute()

        elif tool_name == "update_assignment":
            assignment_id = tool_input.get("id") or tool_input.get("assignment_id")
            if not assignment_id:
                return CommandResult(success=False, error="Missing assignment_id", message="Assignment ID required.")
            cmd = UpdateAssignmentCommand(self.assignment_service, user_id, assignment_id, tool_input)
            return cmd.execute()

        elif tool_name == "delete_assignment":
            assignment_id = tool_input.get("id") or tool_input.get("assignment_id")
            if not assignment_id:
                return CommandResult(success=False, error="Missing assignment_id", message="Assignment ID required.")
            cmd = DeleteAssignmentCommand(self.assignment_service, user_id, assignment_id)
            return cmd.execute()

        elif tool_name == "generate_study_plan":
            cmd = GenerateStudyPlanCommand(self.planner_service, user_id, tool_input)
            return cmd.execute()

        elif tool_name == "create_reminder":
            if not tool_input.get("message"):
                return CommandResult(success=False, error="Missing reminder message", message="Reminder message required.")
            cmd = ScheduleReminderCommand(self.reminder_service, user_id, tool_input)
            return cmd.execute()

        elif tool_name == "cancel_reminder":
            reminder_id = tool_input.get("id") or tool_input.get("reminder_id")
            if not reminder_id:
                return CommandResult(success=False, error="Missing reminder_id", message="Reminder ID required.")
            cmd = CancelReminderCommand(self.reminder_service, user_id, reminder_id)
            return cmd.execute()

        elif tool_name == "explain_academic_concept" or tool_name == "explain_concept":
            cmd = ExplainConceptCommand(self.study_assistant_service, tool_input)
            return cmd.execute()

        elif tool_name == "generate_quiz":
            cmd = GenerateQuizCommand(self.study_assistant_service, tool_input)
            return cmd.execute()

        else:
            logger.warning(f"Rejected unapproved tool call: '{tool_name}'")
            return CommandResult(
                success=False,
                error=f"Unrecognized or forbidden tool: {tool_name}",
                message="Operation not permitted."
            )
