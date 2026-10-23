from typing import Protocol, List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone

class PlanningStrategy(Protocol):
    """Protocol for study planning strategies (Strategy Pattern)."""
    name: str
    description: str

    def create_plan(
        self,
        tasks: List[Any],
        available_minutes: int,
        start_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        ...

class DeadlineFirstStrategy:
    """Strategy prioritizing assignments closest to their deadline."""
    name = "deadline_first"
    description = "Prioritizes assignments with the nearest deadlines to prevent overdue submissions."

    def create_plan(
        self,
        tasks: List[Any],
        available_minutes: int,
        start_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        if not tasks or available_minutes <= 0:
            return []

        current_time = start_time or datetime.now(timezone.utc)
        
        # Sort by earliest due date
        sorted_tasks = sorted(
            tasks,
            key=lambda t: t.due_at if hasattr(t, "due_at") else (t.get("due_at") if isinstance(t, dict) else current_time)
        )

        plan: List[Dict[str, Any]] = []
        remaining = available_minutes
        cursor_time = current_time

        for task in sorted_tasks:
            if remaining <= 0:
                break

            task_id = getattr(task, "id", None) or (task.get("id") if isinstance(task, dict) else str(task))
            task_title = getattr(task, "title", "Study Task") or (task.get("title") if isinstance(task, dict) else "Study Task")
            est_minutes = getattr(task, "estimated_minutes", 60) or (task.get("estimated_minutes", 60) if isinstance(task, dict) else 60)
            
            allocated_duration = min(est_minutes, remaining)
            if allocated_duration <= 0:
                continue

            session_end = cursor_time + timedelta(minutes=allocated_duration)
            plan.append({
                "assignment_id": task_id,
                "title": f"Study: {task_title}",
                "duration_minutes": allocated_duration,
                "starts_at": cursor_time,
                "ends_at": session_end,
                "strategy": self.name,
                "notes": f"Focused session for upcoming deadline ({allocated_duration} min)"
            })

            cursor_time = session_end + timedelta(minutes=5) # 5-min breather
            remaining -= (allocated_duration + 5)

        return plan

class PriorityFirstStrategy:
    """Strategy prioritizing high-stakes and high-priority coursework."""
    name = "priority_first"
    description = "Focuses on high-impact coursework first, ensuring critical assignments receive full attention."

    PRIORITY_WEIGHTS = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

    def create_plan(
        self,
        tasks: List[Any],
        available_minutes: int,
        start_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        if not tasks or available_minutes <= 0:
            return []

        current_time = start_time or datetime.now(timezone.utc)

        def sort_key(t):
            priority = getattr(t, "priority", "MEDIUM") if hasattr(t, "priority") else (t.get("priority", "MEDIUM") if isinstance(t, dict) else "MEDIUM")
            # In case priority is an Enum
            if hasattr(priority, "value"):
                priority = priority.value
            weight = self.PRIORITY_WEIGHTS.get(str(priority).upper(), 2)
            
            due_at = getattr(t, "due_at", current_time) if hasattr(t, "due_at") else (t.get("due_at", current_time) if isinstance(t, dict) else current_time)
            # Higher weight first (negative), then earliest due date
            return (-weight, due_at)

        sorted_tasks = sorted(tasks, key=sort_key)
        plan: List[Dict[str, Any]] = []
        remaining = available_minutes
        cursor_time = current_time

        for task in sorted_tasks:
            if remaining <= 0:
                break

            task_id = getattr(task, "id", None) or (task.get("id") if isinstance(task, dict) else str(task))
            task_title = getattr(task, "title", "Study Task") or (task.get("title") if isinstance(task, dict) else "Study Task")
            est_minutes = getattr(task, "estimated_minutes", 60) or (task.get("estimated_minutes", 60) if isinstance(task, dict) else 60)
            priority = getattr(task, "priority", "MEDIUM") or (task.get("priority", "MEDIUM") if isinstance(task, dict) else "MEDIUM")
            priority_val = priority.value if hasattr(priority, "value") else str(priority)

            allocated_duration = min(est_minutes, remaining)
            if allocated_duration <= 0:
                continue

            session_end = cursor_time + timedelta(minutes=allocated_duration)
            plan.append({
                "assignment_id": task_id,
                "title": f"Deep Work: {task_title}",
                "duration_minutes": allocated_duration,
                "starts_at": cursor_time,
                "ends_at": session_end,
                "strategy": self.name,
                "notes": f"High priority focus ({priority_val}) - {allocated_duration} min"
            })

            cursor_time = session_end + timedelta(minutes=5)
            remaining -= (allocated_duration + 5)

        return plan

class WorkloadBalanceStrategy:
    """Strategy distributing effort evenly across multiple assignments with cognitive breaks."""
    name = "workload_balance"
    description = "Balances effort evenly across all pending subjects with built-in restorative intervals to prevent burnout."

    def create_plan(
        self,
        tasks: List[Any],
        available_minutes: int,
        start_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        if not tasks or available_minutes <= 0:
            return []

        current_time = start_time or datetime.now(timezone.utc)
        plan: List[Dict[str, Any]] = []

        num_tasks = len(tasks)
        # Allocate blocks of max 45 mins with 10 min break
        target_chunk_size = min(45, max(25, available_minutes // num_tasks if num_tasks > 0 else 30))
        remaining = available_minutes
        cursor_time = current_time

        for i, task in enumerate(tasks):
            if remaining < 15:
                break

            task_id = getattr(task, "id", None) or (task.get("id") if isinstance(task, dict) else str(task))
            task_title = getattr(task, "title", "Study Task") or (task.get("title") if isinstance(task, dict) else "Study Task")
            
            # Chunk allocation
            duration = min(target_chunk_size, remaining)
            session_end = cursor_time + timedelta(minutes=duration)
            
            plan.append({
                "assignment_id": task_id,
                "title": f"Sprint {i+1}: {task_title}",
                "duration_minutes": duration,
                "starts_at": cursor_time,
                "ends_at": session_end,
                "strategy": self.name,
                "notes": f"Paced study sprint ({duration} min) + rest interval"
            })

            # Add restorative interval
            break_time = 10 if remaining > 40 else 5
            cursor_time = session_end + timedelta(minutes=break_time)
            remaining -= (duration + break_time)

        return plan

def get_planning_strategy(strategy_name: str) -> PlanningStrategy:
    """Strategy factory helper to retrieve planning algorithm."""
    registry = {
        "deadline_first": DeadlineFirstStrategy(),
        "priority_first": PriorityFirstStrategy(),
        "workload_balance": WorkloadBalanceStrategy(),
    }
    return registry.get(strategy_name.lower(), DeadlineFirstStrategy())
