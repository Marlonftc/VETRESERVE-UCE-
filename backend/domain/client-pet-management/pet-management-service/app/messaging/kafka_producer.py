from kafka import KafkaProducer
import json
import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"
)

PET_CREATED_TOPIC = os.getenv(
    "PET_CREATED_TOPIC", "pet.created"
)

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda v: v.encode("utf-8") if v else None,
)

def publish_pet_created(event: dict) -> None:
    """
    Publish PetCreated event to Kafka
    """
    producer.send(
        topic=PET_CREATED_TOPIC,
        key=str(event.get("pet_id")),
        value=event
    )
    producer.flush()
