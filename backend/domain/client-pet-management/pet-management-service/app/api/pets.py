from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.pet import PetCreate, PetResponse
from app.services.pet_service import create_pet, get_pets_by_owner

router = APIRouter(prefix="/pets", tags=["Pets"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=PetResponse)
def create(data: PetCreate, db: Session = Depends(get_db)):
    return create_pet(db, data)


@router.get("/owner/{owner_id}", response_model=list[PetResponse])
def list_by_owner(owner_id: int, db: Session = Depends(get_db)):
    return get_pets_by_owner(db, owner_id)
