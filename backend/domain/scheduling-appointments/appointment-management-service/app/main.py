from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.api.appointments import router as appointments_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Appointment Management Service",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "Appointments",
            "description": "Appointment management endpoints",
        }
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    appointments_router,
    prefix="/appointments",
    tags=["Appointments"]
)

@app.get("/health")
def health():
    return {"status": "ok"}
