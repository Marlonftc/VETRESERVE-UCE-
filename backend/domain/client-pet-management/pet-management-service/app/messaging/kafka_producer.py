import json
import os
from kafka import KafkaProducer

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"
)

PET_CREATED_TOPIC = os.getenv(
    "PET_CREATED_TOPIC", "pet.created"
)

_producer = None


def get_producer():
    """
    Lazy Kafka producer initialization.
    This avoids creating connections during module import (e.g., during tests).
    """
    global _producer

    # Skip Kafka initialization in unit tests
    if os.getenv("TESTING") == "true":
        return None

    if _producer is None:
        _producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda v: v.encode("utf-8") if v else None,
        )

    return _producer


def publish_pet_created(event: dict) -> None:
    """
    Publish PetCreated event to Kafka.
    """
    producer = get_producer()
    if producer is None:
        # In tests we do nothing, in runtime it will never be None
        return

    producer.send(
        topic=PET_CREATED_TOPIC,
        key=str(event.get("pet_id")),
        value=event
    )
    producer.flush()
