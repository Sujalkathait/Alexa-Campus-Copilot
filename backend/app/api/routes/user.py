from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.deps import get_current_user_id, get_user_repo
from app.infrastructure.repositories.user_repo import UserRepository

router = APIRouter(prefix="/user", tags=["User Profile"])

class UserProfileOut(BaseModel):
    id: str
    name: str
    email: str
    timezone: str

class UpdateTimezoneRequest(BaseModel):
    timezone: str

@router.get("/profile", response_model=UserProfileOut)
def get_user_profile(
    user_id: str = Depends(get_current_user_id),
    repo: UserRepository = Depends(get_user_repo)
):
    """Retrieve active student profile."""
    user = repo.get_by_id(user_id) or repo.get_or_create_demo_user()
    return UserProfileOut(
        id=user.id,
        name=user.name,
        email=user.email,
        timezone=user.timezone
    )

@router.patch("/timezone", response_model=UserProfileOut)
def update_user_timezone(
    payload: UpdateTimezoneRequest,
    user_id: str = Depends(get_current_user_id),
    repo: UserRepository = Depends(get_user_repo)
):
    """Update student timezone."""
    updated = repo.update_timezone(user_id, payload.timezone) or repo.get_or_create_demo_user()
    return UserProfileOut(
        id=updated.id,
        name=updated.name,
        email=updated.email,
        timezone=updated.timezone
    )
