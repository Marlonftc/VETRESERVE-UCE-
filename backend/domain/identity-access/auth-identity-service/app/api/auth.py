from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import requests

from app.utils.jwt import create_access_token
from app.core.password import verify_password
from app.core.security import get_current_user

router = APIRouter()

USER_MANAGEMENT_VALIDATE_URL = "http://127.0.0.1:8001/users/internal/validate"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    """
    Authenticate user using User Management Service.
    """

    # 1. Request user data from User Management Service
    response = requests.post(
        USER_MANAGEMENT_VALIDATE_URL,
        json={"email": data.email},
        timeout=5
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    user = response.json()

    # 2. Verify password
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # 3. Verify user status
    if user["status"] not in ["ACTIVE", "APPROVED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active"
        )

    # 4. Create JWT token
    token = create_access_token({
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "status": user["status"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """
    Return current authenticated user information.
    """
    return {
        "id": current_user.get("sub"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "status": current_user.get("status"),
    }
