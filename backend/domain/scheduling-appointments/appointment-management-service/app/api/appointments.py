from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services.appointment_service import (
    create_appointment,
    get_vet_appointments
)
from app.services.schedule_client import vet_is_available
from app.messaging.kafka_producer import KafkaEventProducer  

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Kafka producer (single instance)
kafka_producer = KafkaEventProducer()


@router.post("", response_model=AppointmentResponse)
def create(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 🔒 Only CLIENT users can create appointments
    if current_user.get("role") != "CLIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create appointments"
        )

    # ✅ Validate vet availability using Vet Schedule Service
    if not vet_is_available(
        vet_id=data.vet_id,
        day=data.day,
        start_time=data.start_time,
        end_time=data.end_time
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vet is not available at the selected time"
        )

    # ✅ Create appointment (business logic)
    appointment = create_appointment(
        db=db,
        client_id=int(current_user.get("sub")),
        vet_id=data.vet_id,
        day=data.day,
        start_time=data.start_time,
        end_time=data.end_time
    )

    # 📣 Publish event to Kafka (Event-Driven)
    event = {
        "event": "AppointmentCreated",
        "appointment_id": appointment.id,
        "vet_id": appointment.vet_id,
        "day": str(appointment.day),
        "start_time": str(appointment.start_time),
        "end_time": str(appointment.end_time),
    }

    kafka_producer.publish(
        topic="appointment.created",
        event=event
    )

    return appointment


@router.get("/vet", response_model=list[AppointmentResponse])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 🔒 Only VET users can view their appointments
    if current_user.get("role") != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vets can view their appointments"
        )

    return get_vet_appointments(
        db=db,
        vet_id=int(current_user.get("sub"))
    )
