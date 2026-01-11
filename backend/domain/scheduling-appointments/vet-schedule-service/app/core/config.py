import os

# =====================================
# ENVIRONMENT
# =====================================
ENV = os.getenv("ENV", "local")

# =====================================
# DATABASE ENGINE
# =====================================
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()

# =====================================
# SQLITE (LOCAL)
# =====================================
SQLITE_DB_URL = "sqlite:///./vet_schedule.db"

# =====================================
# POSTGRESQL (QA / PROD)
# =====================================
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "scheduling_db")

POSTGRES_DB_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# =====================================
# FINAL DATABASE URL
# =====================================
DATABASE_URL = (
    SQLITE_DB_URL if DB_ENGINE == "sqlite" else POSTGRES_DB_URL
)
