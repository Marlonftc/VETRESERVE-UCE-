import os

# Service identity
SERVICE_NAME = os.getenv("SERVICE_NAME", "reporting-analytics-service")

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "clinical.events")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "analytics.clinical.records")
RABBITMQ_ROUTING_KEY = os.getenv(
    "RABBITMQ_ROUTING_KEY",
    "clinical.record.created"
)