import os
from fastapi import FastAPI
from app.api.owners import router as owners_router
from app.core.database import Base, engine

app = FastAPI(title="Owner Management Service")

app.include_router(owners_router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "owner-management-service"
    }


if os.getenv("TESTING") != "true":
    Base.metadata.create_all(bind=engine)
