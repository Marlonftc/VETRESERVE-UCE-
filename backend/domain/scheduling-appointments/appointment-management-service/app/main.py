from fastapi import FastAPI
from app.api.appointments import router as appointments_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Management Service")

app.include_router(appointments_router)

@app.get("/health")
def health():
    return {"status": "ok"}
