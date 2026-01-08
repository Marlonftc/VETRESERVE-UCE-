import os
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

def seed_admin(db: Session):
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        # No admin seeding if not configured (safe by default)
        return

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
