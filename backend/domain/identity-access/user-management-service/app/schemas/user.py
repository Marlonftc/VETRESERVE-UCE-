from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    status: str

    class Config:
        from_attributes = True

from pydantic import BaseModel
from uuid import UUID

class PendingVetResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    status: str

    class Config:
        from_attributes = True

