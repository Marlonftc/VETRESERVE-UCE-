from sqlalchemy.orm import Session
from app.models.appointment import Appointment

def create_appointment(
    db: Session,
    client_id: str,
    vet_id: str,
    date,
    reason: str
):
    appointment = Appointment(
        client_id=client_id,
        vet_id=vet_id,
        date=date,
        reason=reason
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def get_my_appointments(db: Session, user_id: str, role: str):
    if role == "CLIENT":
        return db.query(Appointment).filter(
            Appointment.client_id == user_id
        ).all()

    if role == "VET":
        return db.query(Appointment).filter(
            Appointment.vet_id == user_id
        ).all()

    return []
