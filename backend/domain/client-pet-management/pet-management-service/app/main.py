from fastapi import FastAPI
from app.api.pets import router
from app.core.database import Base, engine
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pet Management Service")

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
