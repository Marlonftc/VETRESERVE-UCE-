import os

# Accept both DB_* and POSTGRES_* environment variables
DB_HOST = os.getenv("DB_HOST") or os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("DB_PORT") or os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("DB_NAME") or os.getenv("POSTGRES_DB")
DB_USER = os.getenv("DB_USER") or os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD") or os.getenv("POSTGRES_PASSWORD")

# Optional full DATABASE_URL (for PROD / future)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        raise RuntimeError("Database environment variables are not fully configured")

    DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:"
        f"{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
