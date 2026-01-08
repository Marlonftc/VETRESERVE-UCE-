import os

JWT_SECRET = os.getenv("JWT_SECRET", "vetreserve-qa-secret")
JWT_ALGORITHM = "HS256"
