from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user_id, get_assignment_service
from app.application.services.assignment_service import AssignmentService
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentOut

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("", response_model=List[AssignmentOut])
def list_assignments(
    status: Optional[str] = Query(None, description="Filter by status: PENDING, IN_PROGRESS, COMPLETED"),
    priority: Optional[str] = Query(None, description="Filter by priority: LOW, MEDIUM, HIGH"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    user_id: str = Depends(get_current_user_id),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Retrieve all assignments for the authenticated student."""
    return service.list_assignments(user_id=user_id, status=status, priority=priority, search=search)

@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    user_id: str = Depends(get_current_user_id),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Create a new academic assignment."""
    try:
        return service.create_assignment(user_id=user_id, data=payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
    assignment_id: str,
    user_id: str = Depends(get_current_user_id),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Retrieve an assignment by ID enforcing student ownership."""
    assignment = service.get_assignment(assignment_id=assignment_id, user_id=user_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return assignment

@router.patch("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdate,
    user_id: str = Depends(get_current_user_id),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Update assignment attributes."""
    data = payload.model_dump(exclude_unset=True)
    updated = service.update_assignment(assignment_id=assignment_id, user_id=user_id, data=data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return updated

@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: str,
    user_id: str = Depends(get_current_user_id),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Delete an assignment."""
    deleted = service.delete_assignment(assignment_id=assignment_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return None
