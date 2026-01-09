from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.owner import OwnerCreate, OwnerResponse
from app.services.owner_service import (
    create_owner,
    get_owners,
    get_owner_by_id
)

router = APIRouter(prefix="/owners", tags=["Owners"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", response_model=OwnerResponse)
def create(data: OwnerCreate, db: Session = Depends(get_db)):
    return create_owner(db, data)

@router.get("", response_model=list[OwnerResponse])
def list_all(db: Session = Depends(get_db)):
    return get_owners(db)

@router.get("/{owner_id}", response_model=OwnerResponse)
def get_by_id(owner_id: int, db: Session = Depends(get_db)):
    owner = get_owner_by_id(db, owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return owner
