import json
import threading
import time
import pika

from app.core.config import (
    RABBITMQ_HOST,
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
    SERVICE_NAME,
)
from app.observability.metrics import CLINICAL_RECORDS_CREATED_TOTAL


RETRY_DELAY_SECONDS = 5


def _on_message(channel, method, properties, body):
    """
    Handles incoming RabbitMQ messages and updates domain metrics.
    """
    try:
        payload = json.loads(body.decode("utf-8"))
        CLINICAL_RECORDS_CREATED_TOTAL.labels(service=SERVICE_NAME).inc()
    except Exception:
        # Ignore malformed messages to avoid blocking the consumer
        pass
    finally:
        channel.basic_ack(delivery_tag=method.delivery_tag)


def start_rabbitmq_consumer():
    """
    Starts RabbitMQ consumer with retry mechanism.
    This prevents startup failures when RabbitMQ is not ready yet.
    """
    while True:
        try:
            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                heartbeat=600,
                blocked_connection_timeout=300,
            )

            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()

            channel.exchange_declare(
                exchange=RABBITMQ_EXCHANGE,
                exchange_type="topic",
                durable=True,
            )

            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

            channel.queue_bind(
                exchange=RABBITMQ_EXCHANGE,
                queue=RABBITMQ_QUEUE,
                routing_key=RABBITMQ_ROUTING_KEY,
            )

            channel.basic_qos(prefetch_count=10)
            channel.basic_consume(
                queue=RABBITMQ_QUEUE,
                on_message_callback=_on_message,
            )

            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError:
            # RabbitMQ not ready yet, retry after delay
            time.sleep(RETRY_DELAY_SECONDS)
        except Exception:
            # Any unexpected error, wait and retry
            time.sleep(RETRY_DELAY_SECONDS)


def run_consumer_in_background():
    """
    Runs the consumer in a background daemon thread.
    """
    thread = threading.Thread(
        target=start_rabbitmq_consumer,
        daemon=True,
    )
    thread.start()
