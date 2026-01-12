from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.webhooks import router as webhooks_router
from app.core.config import SERVICE_NAME


app = FastAPI(title=SERVICE_NAME)

# Basic CORS (adjust origins later if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks_router)


@app.get("/health")
def health():
    return {"status": "ok"}
