import os

# =====================================
# JWT
# =====================================
JWT_SECRET = os.getenv("JWT_SECRET", "vetreserve-qa-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# =====================================
# User Management Service URL
# =====================================
USER_MANAGEMENT_BASE_URL = os.getenv(
    "USER_MANAGEMENT_BASE_URL",
    "http://user-management-service:8000"  # Default for Docker network
)
