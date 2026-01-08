from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password

ADMIN_EMAIL = "admin@vetreserve.com"
ADMIN_PASSWORD = "Admin123*"

def seed_admin(db: Session):
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if admin:
        return

    admin = User(
        email=ADMIN_EMAIL,
        password=hash_password(ADMIN_PASSWORD),
        role="ADMIN",
        status="ACTIVE"
    )

    db.add(admin)
    db.commit()
