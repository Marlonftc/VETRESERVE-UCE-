from pydantic import BaseModel, EmailStr

class OwnerCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

class OwnerResponse(OwnerCreate):
    id: int

    class Config:
        from_attributes = True
