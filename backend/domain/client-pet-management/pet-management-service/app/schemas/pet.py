from pydantic import BaseModel

class PetCreate(BaseModel):
    owner_id: int
    name: str
    species: str
    breed: str | None = None
    age: int | None = None

class PetResponse(PetCreate):
    id: int

    class Config:
        from_attributes = True
