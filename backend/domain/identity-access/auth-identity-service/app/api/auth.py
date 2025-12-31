from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.auth_service import authenticate_user
from app.utils.jwt import create_access_token
from app.core.security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user.email,
        "role": user.role
    })
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user.get("sub"),
        "role": current_user.get("role"),
    }
