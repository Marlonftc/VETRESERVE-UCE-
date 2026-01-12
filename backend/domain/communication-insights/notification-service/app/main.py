import threading
from fastapi import FastAPI
from app.worker import run_worker

app = FastAPI(title="Notification Service")


@app.on_event("startup")
def start_worker():
    print("[Main] Starting Notification Service worker thread...")
    thread = threading.Thread(target=run_worker, daemon=True)
    thread.start()


@app.get("/health")
def health():
    return {"status": "ok"}
