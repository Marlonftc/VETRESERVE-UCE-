import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import DATABASE_URL

Base = declarative_base()


if os.getenv("TESTING") == "true":
    engine = None
    SessionLocal = None
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )

    SessionLocal = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False
    )
