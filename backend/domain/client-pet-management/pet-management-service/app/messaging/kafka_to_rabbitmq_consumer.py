from kafka import KafkaConsumer
import json
import os

from app.messaging.rabbitmq_producer import publish_pet_created_to_rabbitmq

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"
)

PET_CREATED_TOPIC = os.getenv(
    "PET_CREATED_TOPIC", "pet.created"
)


def start_pet_created_consumer():
    """
    Consume PetCreated events from Kafka and forward them to RabbitMQ.
    """

    consumer = KafkaConsumer(
        PET_CREATED_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id="pet-management-rabbitmq-consumer"
    )

    for message in consumer:
        event = message.value

        print(f"[Kafka -> RabbitMQ] Event received: {event}")

        publish_pet_created_to_rabbitmq(event)


if __name__ == "__main__":
    start_pet_created_consumer()

