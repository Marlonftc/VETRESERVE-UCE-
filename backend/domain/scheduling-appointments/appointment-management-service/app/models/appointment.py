from sqlalchemy import Column, Integer, Date, Time, String
from app.core.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=False)
    vet_id = Column(Integer, nullable=False)

    day = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    status = Column(String, default="SCHEDULED")  
    # SCHEDULED | CANCELLED | COMPLETED

