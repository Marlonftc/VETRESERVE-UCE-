import json
import time
import threading
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

from app.core.config import (
    KAFKA_ENABLED,
    KAFKA_BOOTSTRAP_SERVERS,
    APPOINTMENT_COMPLETED_TOPIC,
    KAFKA_CONSUMER_GROUP,
)

from app.services.record_service import create_record
from app.messaging.rabbitmq_publisher import publish_clinical_record_created
from app.messaging.n8n_publisher import notify_n8n


def start_kafka_consumer():
    """
    Starts Kafka consumer ONLY if KAFKA_ENABLED is true.
    This consumer is NON-BLOCKING and runs in a background thread.
    """

    if not KAFKA_ENABLED:
        print("[Kafka] Disabled by configuration – consumer will not start", flush=True)
        return

    thread = threading.Thread(
        target=_consume_loop,
        daemon=True
    )
    thread.start()


def _consume_loop():
    print("[Kafka] Clinical Records consumer thread started", flush=True)

    consumer = None

    while consumer is None:
        try:
            print(f"[Kafka] Connecting to {KAFKA_BOOTSTRAP_SERVERS}", flush=True)

            consumer = KafkaConsumer(
                APPOINTMENT_COMPLETED_TOPIC,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                group_id=KAFKA_CONSUMER_GROUP,
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=_safe_json_deserializer,
                api_version=(3, 6, 0),
                request_timeout_ms=40000,
                session_timeout_ms=30000,
            )

            print("[Kafka] Connected successfully", flush=True)

        except NoBrokersAvailable:
            print("[Kafka] Broker not available, retrying in 10s...", flush=True)
            time.sleep(10)

        except Exception as e:
            print(f"[Kafka] Unexpected error: {e}", flush=True)
            time.sleep(10)

    for message in consumer:
        if not message.value:
            continue

        event = message.value
        print(f"[Kafka] Event received: {event}", flush=True)

        if event.get("event_type") == "AppointmentCompleted":
            _handle_appointment_completed(event)
        else:
            print(
                f"[Kafka] Ignored event type: {event.get('event_type')}",
                flush=True
            )


def _safe_json_deserializer(message):
    try:
        if not message:
            return None
        return json.loads(message.decode("utf-8"))
    except Exception as e:
        print(f"[Kafka] Invalid message skipped: {e}", flush=True)
        return None


def _handle_appointment_completed(event: dict):
    """
    Handles AppointmentCompleted event:
    - Creates clinical record
    - Publishes ClinicalRecordCreated to RabbitMQ
    - Notifies n8n
    """

    record_data = {
        "pet_id": event["pet_id"],
        "vet_id": event.get("vet_id"),
        "summary": event.get("summary", "Appointment completed"),
        "diagnosis": event.get("diagnosis"),
        "treatment": event.get("treatment"),
        "notes": event.get("notes"),
    }

    record = create_record(record_data)

    print(
        f"[Kafka] Clinical record created: {record['id']}",
        flush=True
    )

    event_out = {
        "event_type": "ClinicalRecordCreated",
        "record_id": record["id"],
        "pet_id": record_data["pet_id"],
        "vet_id": record_data.get("vet_id"),
        "summary": record_data["summary"],
    }

    publish_clinical_record_created(event)
    notify_n8n(event_out)
