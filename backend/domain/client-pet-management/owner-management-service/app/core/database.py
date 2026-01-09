from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    "mssql+pyodbc://localhost:1433/owner_db"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&Trusted_Connection=yes"
)
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
