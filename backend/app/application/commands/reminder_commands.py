from typing import Dict, Any
from app.application.commands.base import Command, CommandResult
from app.application.services.reminder_service import ReminderService

class ScheduleReminderCommand(Command):
    """Command Pattern: Encapsulates creation of an academic reminder."""
    def __init__(self, service: ReminderService, user_id: str, data: Dict[str, Any]):
        self.service = service
        self.user_id = user_id
        self.data = data

    def execute(self) -> CommandResult:
        try:
            reminder = self.service.create_reminder(self.user_id, self.data)
            return CommandResult(
                success=True,
                data=reminder.model_dump(),
                message=f"Scheduled reminder: '{reminder.message}' for {reminder.scheduled_at.strftime('%b %d at %I:%M %p')}."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to schedule reminder.")

class CancelReminderCommand(Command):
    """Command Pattern: Encapsulates cancellation of an academic reminder."""
    def __init__(self, service: ReminderService, user_id: str, reminder_id: str):
        self.service = service
        self.user_id = user_id
        self.reminder_id = reminder_id

    def execute(self) -> CommandResult:
        try:
            success = self.service.delete_reminder(self.reminder_id, self.user_id)
            if not success:
                return CommandResult(success=False, error="Reminder not found", message="Reminder not found.")
            return CommandResult(success=True, message="Reminder successfully cancelled.")
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to cancel reminder.")
