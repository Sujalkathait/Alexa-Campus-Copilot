from datetime import datetime, timezone, timedelta
from app.domain.strategies.planner_strategies import (
    DeadlineFirstStrategy,
    PriorityFirstStrategy,
    WorkloadBalanceStrategy,
    get_planning_strategy
)
from app.domain.entities.models import PriorityEnum

def test_deadline_first_strategy():
    strategy = DeadlineFirstStrategy()
    now = datetime.now(timezone.utc)

    tasks = [
        {"id": "task-later", "title": "Math Task", "due_at": now + timedelta(days=3), "estimated_minutes": 60},
        {"id": "task-urgent", "title": "Urgent CS", "due_at": now + timedelta(days=1), "estimated_minutes": 60},
        {"id": "task-mid", "title": "Mid Task", "due_at": now + timedelta(days=2), "estimated_minutes": 60},
    ]

    plan = strategy.create_plan(tasks, available_minutes=120, start_time=now)
    assert len(plan) == 2
    # First scheduled task must be the earliest deadline
    assert plan[0]["assignment_id"] == "task-urgent"
    assert plan[1]["assignment_id"] == "task-mid"

def test_priority_first_strategy():
    strategy = PriorityFirstStrategy()
    now = datetime.now(timezone.utc)

    tasks = [
        {"id": "task-low", "title": "Low Task", "due_at": now + timedelta(days=1), "estimated_minutes": 45, "priority": "LOW"},
        {"id": "task-high", "title": "High Task", "due_at": now + timedelta(days=2), "estimated_minutes": 60, "priority": "HIGH"},
        {"id": "task-med", "title": "Med Task", "due_at": now + timedelta(days=1), "estimated_minutes": 45, "priority": "MEDIUM"},
    ]

    plan = strategy.create_plan(tasks, available_minutes=120, start_time=now)
    assert len(plan) >= 2
    # First scheduled task must be high priority even if due later
    assert plan[0]["assignment_id"] == "task-high"
    assert plan[1]["assignment_id"] == "task-med"

def test_workload_balance_strategy():
    strategy = WorkloadBalanceStrategy()
    now = datetime.now(timezone.utc)

    tasks = [
        {"id": "task-1", "title": "Subject 1", "estimated_minutes": 60},
        {"id": "task-2", "title": "Subject 2", "estimated_minutes": 60},
    ]

    plan = strategy.create_plan(tasks, available_minutes=90, start_time=now)
    assert len(plan) == 2
    assert "Sprint 1" in plan[0]["title"]
    assert "Sprint 2" in plan[1]["title"]
    assert plan[0]["duration_minutes"] <= 45

def test_strategy_factory():
    s1 = get_planning_strategy("deadline_first")
    s2 = get_planning_strategy("priority_first")
    s3 = get_planning_strategy("workload_balance")
    s_default = get_planning_strategy("unknown_strategy")

    assert s1.name == "deadline_first"
    assert s2.name == "priority_first"
    assert s3.name == "workload_balance"
    assert s_default.name == "deadline_first"
