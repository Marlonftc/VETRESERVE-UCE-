import os
import time
import requests

N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "http://n8n:5678/webhook/clinical-record-created"
)

N8N_TIMEOUT_SECONDS = int(os.getenv("N8N_TIMEOUT_SECONDS", "5"))
N8N_RETRIES = int(os.getenv("N8N_RETRIES", "2"))
N8N_RETRY_DELAY_SECONDS = float(os.getenv("N8N_RETRY_DELAY_SECONDS", "1.0"))


def notify_n8n(event: dict) -> None:
    """
    Non-blocking style webhook call with small retry.
    Raises exception only after retries are exhausted.
    """
    last_error = None

    for attempt in range(1, N8N_RETRIES + 2):
        try:
            resp = requests.post(
                N8N_WEBHOOK_URL,
                json=event,
                timeout=N8N_TIMEOUT_SECONDS,
            )
            resp.raise_for_status()
            print("[n8n] Webhook sent successfully", flush=True)
            return
        except Exception as e:
            last_error = e
            print(f"[n8n] Attempt {attempt} failed: {e}", flush=True)
            if attempt <= N8N_RETRIES:
                time.sleep(N8N_RETRY_DELAY_SECONDS)

    raise last_error
