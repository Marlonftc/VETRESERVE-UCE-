import os

# =========================
# Testing mode
# =========================
TESTING = os.getenv("TESTING") == "true"

# =========================
# Database configuration
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL and not TESTING:
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        raise RuntimeError("Database environment variables are not set")

    DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:"
        f"{DB_PASSWORD}@"
        f"{DB_HOST}:"
        f"{DB_PORT}/"
        f"{DB_NAME}"
    )

# =========================
# External services
# =========================
# AUTH (does NOT affect DB or testing)
AUTH_BASE_URL = os.getenv("AUTH_BASE_URL", "http://localhost:8000")
