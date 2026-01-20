import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

security = HTTPBearer()

# JWT configuration (must match auth-identity-service)
JWT_SECRET = os.getenv("JWT_SECRET", "vetreserve-qa-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Validates JWT locally using the shared secret.
    Returns the decoded JWT payload if valid.
    """
    token = credentials.credentials

    # Decode and validate JWT
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    # Required claims validation
    user_id = payload.get("sub")
    role = payload.get("role")
    status_claim = payload.get("status")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Check user status
    if status_claim != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return payload
