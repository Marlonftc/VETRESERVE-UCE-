# app/core/config.py
import os

# Database URL
# Default: SQLite (local)
# QA: PostgreSQL (via environment variable)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./users.db"
)

