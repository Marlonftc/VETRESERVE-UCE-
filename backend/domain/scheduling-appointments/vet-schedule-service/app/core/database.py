from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import DATABASE_URL

# =====================================
# SQLAlchemy Base
# =====================================
Base = declarative_base()

# =====================================
# Engine (PostgreSQL)
# =====================================
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

# =====================================
# Session factory
# =====================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
