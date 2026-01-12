from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.schedules import router as schedules_router
from app.core.init_db import init_db
from app.core.config import DB_ENGINE, DATABASE_URL


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[Vet-Schedule] DB_ENGINE={DB_ENGINE}")
    print(f"[Vet-Schedule] DATABASE_URL={DATABASE_URL}")

    init_db()
    yield


app = FastAPI(
    title="Vet Schedule Service",
    lifespan=lifespan,
    redirect_slashes=False 
)

app.include_router(schedules_router)


@app.get("/health")
def health():
    return {"status": "ok"}
