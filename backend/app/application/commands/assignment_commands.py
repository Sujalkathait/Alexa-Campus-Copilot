from typing import Dict, Any
from app.application.commands.base import Command, CommandResult
from app.application.services.assignment_service import AssignmentService

class CreateAssignmentCommand(Command):
    """Command Pattern: Encapsulates creation of a student assignment."""
    def __init__(self, service: AssignmentService, user_id: str, data: Dict[str, Any]):
        self.service = service
        self.user_id = user_id
        self.data = data

    def execute(self) -> CommandResult:
        try:
            assignment = self.service.create_assignment(self.user_id, self.data)
            return CommandResult(
                success=True,
                data=assignment.model_dump(),
                message=f"Created assignment '{assignment.title}' due {assignment.due_at.strftime('%b %d, %Y %I:%M %p')}."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to create assignment.")

class UpdateAssignmentCommand(Command):
    """Command Pattern: Encapsulates updating an assignment."""
    def __init__(self, service: AssignmentService, user_id: str, assignment_id: str, data: Dict[str, Any]):
        self.service = service
        self.user_id = user_id
        self.assignment_id = assignment_id
        self.data = data

    def execute(self) -> CommandResult:
        try:
            updated = self.service.update_assignment(self.assignment_id, self.user_id, self.data)
            if not updated:
                return CommandResult(success=False, error="Assignment not found", message="Assignment not found.")
            return CommandResult(
                success=True,
                data=updated.model_dump(),
                message=f"Updated assignment '{updated.title}'."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to update assignment.")

class DeleteAssignmentCommand(Command):
    """Command Pattern: Encapsulates deletion of an assignment."""
    def __init__(self, service: AssignmentService, user_id: str, assignment_id: str):
        self.service = service
        self.user_id = user_id
        self.assignment_id = assignment_id

    def execute(self) -> CommandResult:
        try:
            success = self.service.delete_assignment(self.assignment_id, self.user_id)
            if not success:
                return CommandResult(success=False, error="Assignment not found", message="Assignment not found.")
            return CommandResult(success=True, message="Assignment successfully deleted.")
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to delete assignment.")
