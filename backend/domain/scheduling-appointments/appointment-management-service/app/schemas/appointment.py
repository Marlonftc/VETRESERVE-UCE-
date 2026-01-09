from pydantic import BaseModel
from datetime import date, time

class AppointmentCreate(BaseModel):
    vet_id: int
    day: date
    start_time: time
    end_time: time

class AppointmentResponse(BaseModel):
    id: int
    client_id: int
    vet_id: int
    day: date
    start_time: time
    end_time: time
    status: str

    class Config:
        from_attributes = True
