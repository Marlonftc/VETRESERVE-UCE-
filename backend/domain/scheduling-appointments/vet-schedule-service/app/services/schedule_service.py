from sqlalchemy.orm import Session
from app.models.schedule import Schedule


def create_schedule(
    db: Session,
    vet_id: int,
    day: str,
    start_time,
    end_time
):
    schedule = Schedule(
        vet_id=vet_id,
        day=day,
        start_time=start_time,
        end_time=end_time
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


def get_availability(db: Session, vet_id: int):
    return db.query(Schedule).filter(
        Schedule.vet_id == vet_id
    ).all()
