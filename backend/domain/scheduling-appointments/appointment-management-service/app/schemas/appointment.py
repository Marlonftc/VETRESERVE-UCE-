from pydantic import BaseModel
from datetime import datetime

class AppointmentCreate(BaseModel):
    vet_id: str
    date: datetime
    reason: str

class AppointmentResponse(BaseModel):
    id: int
    client_id: str
    vet_id: str
    date: datetime
    reason: str
    status: str

    class Config:
        from_attributes = True
