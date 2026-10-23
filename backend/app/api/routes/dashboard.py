from fastapi import APIRouter, Depends
from app.api.deps import get_current_user_id, get_dashboard_service
from app.application.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    user_id: str = Depends(get_current_user_id),
    service: DashboardService = Depends(get_dashboard_service)
):
    """Retrieve complete aggregate metrics, today's schedule, and urgency radar for the student dashboard."""
    return service.get_summary(user_id=user_id)
