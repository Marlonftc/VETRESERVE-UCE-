from sqlalchemy.orm import Session
from app.models.owner import Owner
from app.schemas.owner import OwnerCreate


def create_owner(db: Session, data: OwnerCreate,user_id: int):
    owner = Owner(
        **data.model_dump(),
        user_id=user_id
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner



def get_owners(db: Session):
    return db.query(Owner).all()


def get_owner_by_id(db: Session, owner_id: int):
    return db.query(Owner).filter(Owner.id == owner_id).first()

