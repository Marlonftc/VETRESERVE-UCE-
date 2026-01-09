import json
import pika
from app.core.config import RABBITMQ_URL, RABBITMQ_QUEUE


class RabbitMQPublisher:
    def __init__(self):
        params = pika.URLParameters(RABBITMQ_URL)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

    def publish(self, message: dict):
        body = json.dumps(message).encode("utf-8")
        self.channel.basic_publish(
            exchange="",
            routing_key=RABBITMQ_QUEUE,
            body=body,
            properties=pika.BasicProperties(delivery_mode=2),  # persistent
        )
        print(f"[RABBITMQ] Published to {RABBITMQ_QUEUE}: {message}")

    def close(self):
        try:
            self.connection.close()
        except Exception:
            pass
