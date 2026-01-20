from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_current_user
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
def create(
    data: PetCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new pet.
    Only CLIENT users can create pets.
    """
    if current_user.get("role") != "CLIENT":
        raise HTTPException(status_code=403, detail="Only clients can create pets")

    return create_pet(db, data)


@router.get("/owner/{owner_id}", response_model=list[PetResponse])
def list_by_owner(owner_id: int, db: Session = Depends(get_db)):
    """
    List pets by owner_id.
    For QA we keep it open; later we can secure it by role (VET/ADMIN/CLIENT).
    """
    return get_pets_by_owner(db, owner_id)
