import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

PET_CREATED_QUEUE = os.getenv(
    "PET_CREATED_QUEUE", "notifications.queue"
)


def publish_pet_created_to_rabbitmq(event: dict) -> None:
    """
    Publish PetCreated event to RabbitMQ queue.
    """

    credentials = pika.PlainCredentials(
        RABBITMQ_USER,
        RABBITMQ_PASSWORD
    )

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT,
            credentials=credentials
        )
    )

    channel = connection.channel()

    # Ensure queue exists
    channel.queue_declare(
        queue=PET_CREATED_QUEUE,
        durable=True
    )

    channel.basic_publish(
        exchange="",
        routing_key=PET_CREATED_QUEUE,
        body=json.dumps(event),
        properties=pika.BasicProperties(
            delivery_mode=2  # Make message persistent
        )
    )

    connection.close()
