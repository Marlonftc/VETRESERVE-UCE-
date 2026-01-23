from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.core.security import hash_password, verify_password
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.core.roles import require_role
from app.core.jwt import get_current_user
from app.services.user_service import (
    create_user,
    get_pending_vets,
    get_active_vets,
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


@router.get("/vets/active", response_model=List[UserResponse])
def list_active_vets(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all approved vets.
    Available to authenticated users.
    """
    if current_user.get("role") not in ["CLIENT", "VET", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return get_active_vets(db)


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


# 🔐 INTERNAL — VALIDATES PASSWORD
@router.post("/internal/validate")
def validate_user_internal(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    INTERNAL ENDPOINT.
    Used ONLY by Auth Identity Service.
    Validates credentials and returns user data.
    """

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "status": user.status
    }
