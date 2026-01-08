from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.security import hash_password
from app.core.database import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.core.roles import require_role
from app.core.security import verify_password
from app.services.user_service import (
    create_user,
    get_pending_vets,
    approve_user
)

router = APIRouter(prefix="/users", tags=["Users"])


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register_user(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    Allowed roles: CLIENT, VET
    """
    if data.role not in ["CLIENT", "VET"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    return create_user(db, data.email, data.password, data.role)


@router.get("/vets/pending", response_model=List[UserResponse])
def list_pending_vets(
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN"))
):
    """
    List all pending vets.
    ADMIN only.
    """
    return get_pending_vets(db)


@router.put("/{user_id}/approve", response_model=UserResponse)
def approve_vet(
    user_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN"))
):
    """
    Approve a vet user.
    ADMIN only.
    """
    user = approve_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.post("/internal/validate")
def validate_user_internal(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    INTERNAL ENDPOINT.
    Used ONLY by Auth Identity Service.
    Returns user data ONLY.
    Does NOT validate password.
    """

    email = data.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id": user.id,
        "email": user.email,
        "password_hash": user.password,
        "role": user.role,
        "status": user.status,
    }
