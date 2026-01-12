import os

# =========================
# MQTT
# =========================
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "mqtt")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_PET_CREATED_TOPIC = os.getenv(
    "MQTT_PET_CREATED_TOPIC", "pet/created"
)

# =========================
# REDIS
# =========================
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
