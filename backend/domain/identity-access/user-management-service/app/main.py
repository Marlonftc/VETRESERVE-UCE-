from fastapi import FastAPI
from app.api.users import router as users_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User Management Service",
    description="User registration and profile management for VETRESERVE-UCE",
    version="1.0.0"
)

app.include_router(users_router)

@app.get("/health")
def health():
    return {"status": "ok"}
