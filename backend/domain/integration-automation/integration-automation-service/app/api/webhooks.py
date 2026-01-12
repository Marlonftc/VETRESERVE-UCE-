from fastapi import APIRouter, Header, HTTPException
from app.core.config import INTEGRATION_WEBHOOK_SECRET
from app.services.n8n_client import forward_to_n8n

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/appointment-completed")
def appointment_completed(payload: dict, x_webhook_secret: str | None = Header(default=None)):
    """
    Receives appointment completed event and forwards it to n8n.
    """
    if INTEGRATION_WEBHOOK_SECRET:
        if not x_webhook_secret or x_webhook_secret != INTEGRATION_WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    result = forward_to_n8n(payload)
    return {"forwarded": True, "n8n_result": result}
