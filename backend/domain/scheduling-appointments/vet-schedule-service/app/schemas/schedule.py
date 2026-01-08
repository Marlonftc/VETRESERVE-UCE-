from pydantic import BaseModel
from datetime import time


class ScheduleCreate(BaseModel):
    day: str
    start_time: time
    end_time: time


class ScheduleResponse(BaseModel):
    id: int
    vet_id: int
    day: str
    start_time: time
    end_time: time

    class Config:
        from_attributes = True

