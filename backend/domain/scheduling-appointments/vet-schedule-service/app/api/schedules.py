from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.schemas.schedule import ScheduleCreate, ScheduleResponse
from app.services.schedule_service import create_schedule, get_availability

router = APIRouter(
    prefix="/schedules",
    tags=["Vet Schedules"]
)

# =====================================
# Database dependency
# =====================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================
# CREATE VET SCHEDULE
# ==========================
@router.post("", response_model=ScheduleResponse)
def create(
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only vets can create schedules
    if current_user.get("role") != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vets can create schedules"
        )

    # Vet must be approved
    if current_user.get("status") != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vet is not active"
        )

    return create_schedule(
        db=db,
        vet_id=int(current_user.get("sub")),
        day=data.day,
        start_time=data.start_time,
        end_time=data.end_time
    )


# ==========================
# INTERNAL AVAILABILITY CHECK
# ==========================
@router.get(
    "/availability/internal",
    response_model=list[ScheduleResponse],
    include_in_schema=False
)
def availability_internal(
    vet_id: int,
    db: Session = Depends(get_db)
):
    """
    Internal endpoint for Appointment Management Service.
    No authentication required.
    """
    return get_availability(db=db, vet_id=vet_id)
