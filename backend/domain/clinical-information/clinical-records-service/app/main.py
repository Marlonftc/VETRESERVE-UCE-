from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.records import router as records_router
from app.messaging.kafka_consumer import start_kafka_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔥 Lifespan startup executed", flush=True)

    # Start Kafka consumer (non-blocking, internal thread)
    start_kafka_consumer()

    yield

    print("🛑 Lifespan shutdown executed", flush=True)


app = FastAPI(
    title="Clinical Records Service",
    lifespan=lifespan
)

app.include_router(records_router)


@app.get("/health")
def health():
    return {"status": "ok"}
