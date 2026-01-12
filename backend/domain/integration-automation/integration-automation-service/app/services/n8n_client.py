import requests
from app.core.config import N8N_BASE_URL, N8N_WEBHOOK_PATH, N8N_TIMEOUT_SECONDS


def forward_to_n8n(payload: dict) -> dict:
    """
    Forward an event payload to n8n via HTTP webhook.
    """
    url = f"{N8N_BASE_URL}{N8N_WEBHOOK_PATH}"

    resp = requests.post(
        url,
        json=payload,
        timeout=N8N_TIMEOUT_SECONDS,
        headers={"Content-Type": "application/json"},
    )

    # If n8n returns non-2xx, raise an exception to make the error visible
    resp.raise_for_status()

    # n8n can return plain text or json depending on workflow response
    try:
        return resp.json()
    except Exception:
        return {"status": "ok", "raw": resp.text}
