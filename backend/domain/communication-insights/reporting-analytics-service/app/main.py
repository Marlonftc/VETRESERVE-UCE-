import time
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.core.config import SERVICE_NAME
from app.observability.metrics import (
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    CLINICAL_RECORDS_CREATED_TOTAL,
    APPOINTMENTS_CREATED_TOTAL,
)

app = FastAPI(title="Reporting & Analytics Service", version="1.0.0")


@app.middleware("http")
async def prometheus_http_metrics(request: Request, call_next):
    """
    Records Prometheus metrics for every HTTP request.
    """
    start = time.perf_counter()
    method = request.method
    path = request.url.path

    response = await call_next(request)

    duration = time.perf_counter() - start
    HTTP_REQUEST_DURATION_SECONDS.labels(
        service=SERVICE_NAME, method=method, path=path
    ).observe(duration)

    HTTP_REQUESTS_TOTAL.labels(
        service=SERVICE_NAME, method=method, path=path, status=str(response.status_code)
    ).inc()

    return response


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME}


@app.get("/metrics")
def metrics():
    """
    Prometheus scrape endpoint.
    """
    data = generate_latest()
    return PlainTextResponse(data, media_type=CONTENT_TYPE_LATEST)


# --- Demo endpoints to simulate domain analytics events ---
# Later you can replace these with Kafka/Rabbit consumers or DB aggregation.

@app.post("/analytics/events/clinical-record-created")
def event_clinical_record_created():
    """
    Demo endpoint: increments clinical record created counter.
    """
    CLINICAL_RECORDS_CREATED_TOTAL.labels(service=SERVICE_NAME).inc()
    return {"ok": True, "event": "ClinicalRecordCreated"}


@app.post("/analytics/events/appointment-created")
def event_appointment_created():
    """
    Demo endpoint: increments appointment created counter.
    """
    APPOINTMENTS_CREATED_TOTAL.labels(service=SERVICE_NAME).inc()
    return {"ok": True, "event": "AppointmentCreated"}

from app.messaging.rabbitmq_consumer import run_consumer_in_background

@app.on_event("startup")
def startup_event():
    run_consumer_in_background()