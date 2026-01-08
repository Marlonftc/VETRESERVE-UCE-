from fastapi import FastAPI
from app.api.schedules import router as schedules_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vet Schedule Service")

app.include_router(schedules_router)

@app.get("/health")
def health():
    return {"status": "ok"}

