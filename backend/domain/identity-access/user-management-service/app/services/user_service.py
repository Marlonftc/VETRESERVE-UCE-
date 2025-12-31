from sqlalchemy.orm import Session
from app.models.user import User

# ✅ CREATE USER (client / vet)
def create_user(db: Session, email: str, role: str):
    status = "PENDING_APPROVAL" if role == "vet" else "ACTIVE"

    user = User(
        email=email,
        role=role,
        status=status
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ✅ GET VETS PENDING APPROVAL
def get_pending_vets(db: Session):
    return db.query(User).filter(
        User.role == "vet",
        User.status == "PENDING_APPROVAL"
    ).all()

# ✅ APPROVE USER
def approve_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user.status = "ACTIVE"
    db.commit()
    db.refresh(user)
    return user
