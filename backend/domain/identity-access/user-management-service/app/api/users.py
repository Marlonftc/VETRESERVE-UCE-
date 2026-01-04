from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
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


# TEMPORARY admin guard (will be replaced by JWT role validation)
def admin_guard(x_role: str = Header(...)):
    """
    TEMPORARY:
    This guard validates admin access using a custom header.
    It will be replaced later by JWT-based role validation.
    """
    if x_role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin only"
        )


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
    _: None = Depends(admin_guard)
):
    """
    List all vets with PENDING status.
    Admin only.
    """
    return get_pending_vets(db)


@router.put("/{user_id}/approve", response_model=UserResponse)
def approve_vet(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(admin_guard)
):
    """
    Approve a vet user.
    Changes status from PENDING to APPROVED.
    Admin only.
    """
    user = approve_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

@router.post("/internal/validate")
def validate_user_credentials(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    INTERNAL ENDPOINT.
    Used ONLY by Auth Identity Service to validate user credentials.
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
