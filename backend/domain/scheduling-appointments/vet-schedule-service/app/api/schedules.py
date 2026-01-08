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

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=ScheduleResponse)
def create(
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 🔒 Role check
    if current_user.get("role") != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vets can create schedules"
        )

    # 🔒 Status check (vet aprobado)
    if current_user.get("status") != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vet is not active"
        )

    return create_schedule(
    db=db,
    vet_id=current_user.get("sub"),
    day=data.day,
    start_time=data.start_time,
    end_time=data.end_time
)



@router.get("/availability", response_model=list[ScheduleResponse])
def availability(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 🔒 Solo vets pueden consultar SU disponibilidad
    if current_user.get("role") != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vets can view availability"
        )

    return get_availability(
        db=db,
        vet_id=int(current_user.get("sub"))
    )
