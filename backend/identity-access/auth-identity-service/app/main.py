from fastapi import FastAPI
from app.api.auth import router as auth_router

app = FastAPI(
    title="Auth & Identity Service",
    description="Authentication and authorization service for VETRESERVE-UCE",
    version="1.0.0"
)

app.include_router(auth_router, prefix="/auth")

@app.get("/health")
def health_check():
    return {"status": "ok"}
