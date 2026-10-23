from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user_id, get_planner_service
from app.application.services.study_planner_service import StudyPlannerService
from app.schemas.study_session import (
    StudyPlanRequest,
    StudyPlanResponse,
    StudySessionCreate,
    StudySessionUpdate,
    StudySessionOut
)

router = APIRouter(tags=["Study Planner"])

@router.post("/study-plans/generate", response_model=StudyPlanResponse)
def generate_study_plan(
    payload: StudyPlanRequest,
    user_id: str = Depends(get_current_user_id),
    service: StudyPlannerService = Depends(get_planner_service)
):
    """
    Generate an optimized study plan using the Strategy Pattern.
    Strategies: 'deadline_first' | 'priority_first' | 'workload_balance'.
    """
    return service.generate_plan(
        user_id=user_id,
        available_minutes=payload.available_minutes,
        strategy_name=payload.strategy,
        start_time=payload.start_time,
        save_to_schedule=payload.save_to_schedule
    )

@router.get("/study-sessions", response_model=List[StudySessionOut])
def list_study_sessions(
    status: Optional[str] = Query(None, description="Filter by status: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    user_id: str = Depends(get_current_user_id),
    service: StudyPlannerService = Depends(get_planner_service)
):
    """List scheduled study sessions for the authenticated student."""
    return service.list_sessions(
        user_id=user_id,
        status=status,
        date_from=date_from,
        date_to=date_to
    )

@router.post("/study-sessions", response_model=StudySessionOut, status_code=status.HTTP_201_CREATED)
def create_study_session(
    payload: StudySessionCreate,
    user_id: str = Depends(get_current_user_id),
    service: StudyPlannerService = Depends(get_planner_service)
):
    """Manually book or schedule a study block."""
    return service.create_session(user_id=user_id, data=payload.model_dump())

@router.patch("/study-sessions/{session_id}", response_model=StudySessionOut)
def update_study_session(
    session_id: str,
    payload: StudySessionUpdate,
    user_id: str = Depends(get_current_user_id),
    service: StudyPlannerService = Depends(get_planner_service)
):
    """Update study session status or details."""
    data = payload.model_dump(exclude_unset=True)
    updated = service.update_session(session_id=session_id, user_id=user_id, data=data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")
    return updated

@router.delete("/study-sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    service: StudyPlannerService = Depends(get_planner_service)
):
    """Remove a study session from schedule."""
    deleted = service.delete_session(session_id=session_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")
    return None
