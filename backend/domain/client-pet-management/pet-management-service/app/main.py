import os
from fastapi import FastAPI
from app.api.pets import router
from app.core.database import Base, engine
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Pet Management Service",
    redirect_slashes=False
)

app.include_router(router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "pet-management-service"
    }

# Only create tables when not running tests
if os.getenv("TESTING") != "true":
    Base.metadata.create_all(bind=engine)
