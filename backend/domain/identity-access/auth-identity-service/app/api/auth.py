from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import requests

from app.utils.jwt import create_access_token
from app.core.jwt import get_current_user
from app.core.config import USER_MANAGEMENT_BASE_URL

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    """
    Authenticate user using User Management Service.
    """

    # 🔐 Delegate credential validation to User Management Service
    response = requests.post(
        f"{USER_MANAGEMENT_BASE_URL}/users/internal/validate",
        json={
            "email": data.email,
            "password": data.password
        },
        timeout=5
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    user = response.json()

    # 🔒 Check user status
    if user["status"] not in ["ACTIVE", "APPROVED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active"
        )

    # 🎫 Create JWT token
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
