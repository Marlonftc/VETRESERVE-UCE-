from sqlalchemy.orm import Session
from app.models.pet import Pet
from app.schemas.pet import PetCreate

def create_pet(db: Session, data: PetCreate):
    pet = Pet(**data.dict())
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

def get_pets_by_owner(db: Session, owner_id: int):
    return db.query(Pet).filter(Pet.owner_id == owner_id).all()
