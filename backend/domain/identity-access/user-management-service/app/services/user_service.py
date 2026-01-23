from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password


# ✅ CREATE USER
def create_user(db: Session, email: str, password: str, role: str):
    status = "PENDING" if role == "VET" else "ACTIVE"

    user = User(
        email=email,
        password=hash_password(password),
        role=role,
        status=status
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ✅ GET PENDING VETS
def get_pending_vets(db: Session):
    return db.query(User).filter(
        User.role == "VET",
        User.status == "PENDING"
    ).all()


# ✅ GET ACTIVE VETS
def get_active_vets(db: Session):
    return db.query(User).filter(
        User.role == "VET",
        User.status == "ACTIVE"
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
