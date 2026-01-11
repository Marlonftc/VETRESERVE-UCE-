import json
import os
import pika

from app.messaging.mqtt_publisher import publish_pet_created_to_mqtt

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
PET_CREATED_QUEUE = os.getenv(
    "PET_CREATED_QUEUE", "notifications.queue"
)


def start_pet_created_mqtt_consumer():
    """
    Consume PetCreated events from RabbitMQ and forward them to MQTT.
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

    channel.queue_declare(
        queue=PET_CREATED_QUEUE,
        durable=True
    )

    def callback(ch, method, properties, body):
        event = json.loads(body.decode("utf-8"))

        print(f"[RabbitMQ -> MQTT] Event forwarded: {event}")

        publish_pet_created_to_mqtt(event)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(
        queue=PET_CREATED_QUEUE,
        on_message_callback=callback
    )

    channel.start_consuming()


if __name__ == "__main__":
    start_pet_created_mqtt_consumer()
