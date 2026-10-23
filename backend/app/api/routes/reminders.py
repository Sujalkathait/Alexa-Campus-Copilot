from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user_id, get_reminder_service
from app.application.services.reminder_service import ReminderService
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderOut

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("", response_model=List[ReminderOut])
def list_reminders(
    status: Optional[str] = Query(None, description="Filter by status: PENDING, SENT, CANCELLED"),
    only_upcoming: bool = Query(False, description="Filter to only upcoming pending reminders"),
    user_id: str = Depends(get_current_user_id),
    service: ReminderService = Depends(get_reminder_service)
):
    """Retrieve reminders for the current student."""
    return service.list_reminders(user_id=user_id, status=status, only_upcoming=only_upcoming)

@router.post("", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: ReminderCreate,
    user_id: str = Depends(get_current_user_id),
    service: ReminderService = Depends(get_reminder_service)
):
    """Create a new reminder with deduplication protection."""
    try:
        return service.create_reminder(user_id=user_id, data=payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    reminder_id: str,
    payload: ReminderUpdate,
    user_id: str = Depends(get_current_user_id),
    service: ReminderService = Depends(get_reminder_service)
):
    """Update or reschedule an existing reminder."""
    data = payload.model_dump(exclude_unset=True)
    updated = service.update_reminder(reminder_id=reminder_id, user_id=user_id, data=data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return updated

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: str,
    user_id: str = Depends(get_current_user_id),
    service: ReminderService = Depends(get_reminder_service)
):
    """Cancel and delete a reminder."""
    deleted = service.delete_reminder(reminder_id=reminder_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return None
