from typing import Dict, Any
from app.application.commands.base import Command, CommandResult
from app.application.services.study_planner_service import StudyPlannerService

class GenerateStudyPlanCommand(Command):
    """Command Pattern: Encapsulates study plan generation and optional calendar scheduling."""
    def __init__(self, service: StudyPlannerService, user_id: str, data: Dict[str, Any]):
        self.service = service
        self.user_id = user_id
        self.data = data

    def execute(self) -> CommandResult:
        try:
            available_minutes = int(self.data.get("available_minutes", 120))
            strategy = self.data.get("strategy", "deadline_first")
            save_to_schedule = bool(self.data.get("save_to_schedule", False))

            plan_response = self.service.generate_plan(
                user_id=self.user_id,
                available_minutes=available_minutes,
                strategy_name=strategy,
                save_to_schedule=save_to_schedule
            )
            return CommandResult(
                success=True,
                data=plan_response.model_dump(),
                message=f"Generated {plan_response.sessions_count} study sessions ({plan_response.total_study_minutes} mins total) using {strategy.replace('_', ' ').title()} strategy."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to generate study plan.")
