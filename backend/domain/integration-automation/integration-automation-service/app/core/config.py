import os

# =========================
# Service
# =========================
SERVICE_NAME = os.getenv("SERVICE_NAME", "Integration & Automation Service")

# =========================
# n8n
# =========================
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://n8n:5678")
N8N_WEBHOOK_PATH = os.getenv("N8N_WEBHOOK_PATH", "/webhook/clinical-record-created")
N8N_TIMEOUT_SECONDS = int(os.getenv("N8N_TIMEOUT_SECONDS", "8"))

# Optional: simple shared secret to protect your webhook endpoint
INTEGRATION_WEBHOOK_SECRET = os.getenv("INTEGRATION_WEBHOOK_SECRET", "")
