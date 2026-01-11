import json
import os
import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "clinical.events")
RABBITMQ_ROUTING_KEY = os.getenv(
    "RABBITMQ_ROUTING_KEY",
    "clinical.record.created"
)


def publish_clinical_event(event: dict) -> None:
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )
    channel = connection.channel()

    channel.exchange_declare(
        exchange=RABBITMQ_EXCHANGE,
        exchange_type="fanout",
        durable=True
    )

    channel.basic_publish(
        exchange=RABBITMQ_EXCHANGE,
        routing_key=RABBITMQ_ROUTING_KEY,
        body=json.dumps(event).encode("utf-8")
    )

    print(
        "[RabbitMQ] Published event to exchange clinical.events",
        flush=True
    )

    connection.close()
