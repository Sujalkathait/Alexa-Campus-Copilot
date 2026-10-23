from typing import Dict, Any
from app.application.commands.base import Command, CommandResult
from app.application.services.study_assistant_service import StudyAssistantService

class ExplainConceptCommand(Command):
    """Command Pattern: Encapsulates academic concept explanation."""
    def __init__(self, service: StudyAssistantService, data: Dict[str, Any]):
        self.service = service
        self.data = data

    def execute(self) -> CommandResult:
        try:
            topic = self.data.get("topic", "Computer Science")
            difficulty = self.data.get("difficulty", "undergraduate")
            res = self.service.explain_concept(topic=topic, difficulty=difficulty)
            return CommandResult(
                success=True,
                data=res.model_dump(),
                message=f"Explained concept: {topic}."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to explain concept.")

class GenerateQuizCommand(Command):
    """Command Pattern: Encapsulates quiz generation."""
    def __init__(self, service: StudyAssistantService, data: Dict[str, Any]):
        self.service = service
        self.data = data

    def execute(self) -> CommandResult:
        try:
            topic = self.data.get("topic", "Computer Science")
            num_q = int(self.data.get("num_questions", 3))
            res = self.service.generate_quiz(topic=topic, num_questions=num_q)
            return CommandResult(
                success=True,
                data=res.model_dump(),
                message=f"Generated practice quiz on {topic}."
            )
        except Exception as e:
            return CommandResult(success=False, error=str(e), message="Failed to generate quiz.")
