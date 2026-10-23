from typing import Protocol, Any, Dict

class Command(Protocol):
    """Command Pattern interface: encapsulates an executable academic operation."""
    def execute(self) -> Any:
        ...

class CommandResult:
    """Standardized result returned by commands."""
    def __init__(self, success: bool, data: Any = None, error: str = None, message: str = ""):
        self.success = success
        self.data = data
        self.error = error
        self.message = message

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "message": self.message
        }
