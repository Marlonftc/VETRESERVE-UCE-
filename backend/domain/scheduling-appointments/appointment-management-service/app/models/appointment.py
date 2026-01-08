from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, nullable=False)
    vet_id = Column(String, nullable=True)

    date = Column(DateTime, nullable=False)
    reason = Column(String, nullable=False)

    status = Column(String, default="SCHEDULED")  # SCHEDULED | CANCELED

    created_at = Column(DateTime, default=datetime.utcnow)
