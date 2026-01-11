import requests
import os

N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "http://n8n:5678/webhook/clinical-record-created"
)

def notify_n8n(event: dict):
    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=event,
            timeout=5
        )
        response.raise_for_status()
        print("[n8n] Webhook sent successfully", flush=True)
    except Exception as e:
        print(f"[n8n] Error sending webhook: {e}", flush=True)
