from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException

from app.models.appointment import Appointment


def has_time_conflict(
    db: Session,
    vet_id: int,
    day,
    start_time,
    end_time
) -> bool:
    """
    Detects overlapping appointments for the same vet and day.
    Overlap rule:
    existing.start < new.end AND existing.end > new.start
    """
    conflict = db.query(Appointment).filter(
        Appointment.vet_id == vet_id,
        Appointment.day == day,
        and_(
            Appointment.start_time < end_time,
            Appointment.end_time > start_time
        )
    ).first()

    return conflict is not None


def create_appointment(
    db: Session,
    client_id: int,
    vet_id: int,
    day,
    start_time,
    end_time
):
    # 🚫 BLOCK overlapping appointments
    if has_time_conflict(db, vet_id, day, start_time, end_time):
        raise HTTPException(
            status_code=400,
            detail="Vet already has an appointment in this time range"
        )

    appointment = Appointment(
        client_id=client_id,
        vet_id=vet_id,
        day=day,
        start_time=start_time,
        end_time=end_time
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


def get_vet_appointments(db: Session, vet_id: int):
    return db.query(Appointment).filter(
        Appointment.vet_id == vet_id
    ).all()
