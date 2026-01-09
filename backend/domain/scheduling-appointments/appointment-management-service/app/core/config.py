import os

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "vetreserve-qa-secret")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# External services
VET_SCHEDULE_BASE_URL = os.getenv(
    "VET_SCHEDULE_BASE_URL",
    "http://127.0.0.1:8003"
)
