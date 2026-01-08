from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services.appointment_service import (
    create_appointment,
    get_my_appointments
)

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=AppointmentResponse)
def create(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "CLIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create appointments"
        )

    return create_appointment(
        db=db,
        client_id=current_user.get("sub"),
        vet_id=data.vet_id,
        date=data.date,
        reason=data.reason
    )


@router.get("/my", response_model=list[AppointmentResponse])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_my_appointments(
        db=db,
        user_id=current_user.get("sub"),
        role=current_user.get("role")
    )


