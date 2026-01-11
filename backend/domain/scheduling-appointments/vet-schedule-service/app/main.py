from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.schedules import router as schedules_router
from app.core.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Vet Schedule Service",
    lifespan=lifespan
)

app.include_router(schedules_router)


@app.get("/health")
def health():
    return {"status": "ok"}
