import os

# =========================
# MongoDB
# =========================
MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))
MONGO_DB = os.getenv("MONGO_DB", "clinical_db")

CLINICAL_RECORDS_COLLECTION = os.getenv(
    "CLINICAL_RECORDS_COLLECTION",
    "clinical_records"
)

# =========================
# Kafka
# =========================
KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS",
    "kafka:9092"
)

APPOINTMENT_COMPLETED_TOPIC = os.getenv(
    "APPOINTMENT_COMPLETED_TOPIC",
    "appointment.completed"
)

KAFKA_CONSUMER_GROUP = os.getenv(
    "KAFKA_CONSUMER_GROUP",
    "clinical-records-service"
)
