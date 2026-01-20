import json
import os
import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")

RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "clinical.events")
RABBITMQ_EXCHANGE_TYPE = os.getenv("RABBITMQ_EXCHANGE_TYPE", "topic")  # topic recommended
RABBITMQ_ROUTING_KEY = os.getenv("RABBITMQ_ROUTING_KEY", "clinical.record.created")


def publish_clinical_record_created(event: dict) -> None:
    """
    Publishes ClinicalRecordCreated event to RabbitMQ.
    Exchange defaults to 'topic' so routing_key is respected.
    """

    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    params = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        virtual_host=RABBITMQ_VHOST,
        credentials=credentials,
        heartbeat=30,
        blocked_connection_timeout=10,
        connection_attempts=3,
        retry_delay=2,
    )

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # If you want fanout, set RABBITMQ_EXCHANGE_TYPE=fanout and ignore routing_key
    channel.exchange_declare(
        exchange=RABBITMQ_EXCHANGE,
        exchange_type=RABBITMQ_EXCHANGE_TYPE,
        durable=True,
    )

    body = json.dumps(event).encode("utf-8")

    channel.basic_publish(
        exchange=RABBITMQ_EXCHANGE,
        routing_key=RABBITMQ_ROUTING_KEY if RABBITMQ_EXCHANGE_TYPE != "fanout" else "",
        body=body,
        properties=pika.BasicProperties(
            content_type="application/json",
            delivery_mode=2,  # persistent
        ),
    )

    print(f"[RabbitMQ] Published event to exchange={RABBITMQ_EXCHANGE}", flush=True)
    connection.close()
