import json
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

from app.core.config import (
    KAFKA_BOOTSTRAP_SERVERS,
    APPOINTMENT_COMPLETED_TOPIC,
    KAFKA_CONSUMER_GROUP,
)

from app.services.record_service import create_record
from app.messaging.rabbitmq_publisher import publish_clinical_event
from app.messaging.n8n_publisher import notify_n8n


def start_kafka_consumer():
    """
    Starts the Kafka consumer for Clinical Records Service.
    Listens to AppointmentCompleted events and creates clinical records.
    """
    try:
        print("🔥 Kafka consumer thread started", flush=True)
        print("[Kafka] Starting Clinical Records consumer...", flush=True)
        print(f"[Kafka] Bootstrap servers: {KAFKA_BOOTSTRAP_SERVERS}", flush=True)
        print(f"[Kafka] Consumer group: {KAFKA_CONSUMER_GROUP}", flush=True)
        print(f"[Kafka] Topic: {APPOINTMENT_COMPLETED_TOPIC}", flush=True)

        # Retry loop until Kafka broker is available
        while True:
            try:
                time.sleep(10)

                consumer = KafkaConsumer(
                    APPOINTMENT_COMPLETED_TOPIC,
                    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                    group_id=KAFKA_CONSUMER_GROUP,
                    auto_offset_reset="earliest",
                    enable_auto_commit=True,
                    value_deserializer=safe_json_deserializer,

                    # Stable Kafka 7.x settings
                    api_version=(3, 6, 0),
                    request_timeout_ms=40000,
                    session_timeout_ms=30000,
                    metadata_max_age_ms=30000,
                )

                print("✅ Kafka consumer connected successfully", flush=True)
                break

            except NoBrokersAvailable:
                print("⏳ Kafka broker not ready, retrying in 5s...", flush=True)
                time.sleep(5)

            except Exception as e:
                print(f"❌ Kafka unexpected error: {e}", flush=True)
                time.sleep(5)

        # Consume messages
        for message in consumer:
            if message.value is None:
                continue

            event = message.value
            print(f"[Kafka] Event received: {event}", flush=True)

            if event.get("event_type") == "AppointmentCompleted":
                handle_appointment_completed(event)
            else:
                print(
                    f"[Kafka] Ignored event type: {event.get('event_type')}",
                    flush=True
                )

    except Exception as e:
        print(f"❌ Kafka consumer crashed: {e}", flush=True)


def safe_json_deserializer(message):
    """
    Safely deserialize Kafka messages to JSON.
    """
    try:
        if not message:
            return None
        return json.loads(message.decode("utf-8"))
    except Exception as e:
        print(f"[Kafka] Invalid message skipped: {e}", flush=True)
        return None


def handle_appointment_completed(event: dict):
    """
    Handles AppointmentCompleted event:
    - Creates a clinical record
    - Publishes event to RabbitMQ
    - Notifies n8n via webhook
    """

    # Prepare clinical record data
    record_data = {
        "pet_id": event["pet_id"],
        "vet_id": event.get("vet_id"),
        "summary": event.get("summary", "Appointment completed"),
        "diagnosis": event.get("diagnosis"),
        "treatment": event.get("treatment"),
        "notes": event.get("notes"),
    }

    # Create clinical record in MongoDB
    record = create_record(record_data)

    print(
        f"[Kafka] Clinical record created from appointment: {record['id']}",
        flush=True
    )

    # Event payload to be propagated
    event_out = {
        "event_type": "ClinicalRecordCreated",
        "record_id": record["id"],
        "pet_id": record_data["pet_id"],
        "vet_id": record_data["vet_id"],
        "summary": record_data["summary"],
    }

    # Publish to RabbitMQ
    publish_clinical_event(event_out)

    # Notify n8n (Integration & Automation)
    notify_n8n(event_out)
