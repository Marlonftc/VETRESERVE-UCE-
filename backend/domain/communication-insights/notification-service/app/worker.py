import json
import uuid
import os
import pika

from app.infrastructure.redis_client import redis_client
from app.messaging.mqtt_client import MQTTSubscriber


def handle_event(event: dict):
    print(f"[Worker] Event received: {event}")

    event_type = event.get("event_type")

    if event_type == "PetCreated":
        handle_pet_created(event)
    else:
        print(f"[Worker] Ignored event type: {event_type}")


def handle_pet_created(event: dict):
    notification_id = str(uuid.uuid4())

    notification = {
        "id": notification_id,
        "type": "PetCreated",
        "pet_id": event.get("pet_id"),
        "owner_id": event.get("owner_id"),
        "message": "New pet registered successfully"
    }

    # Store notification in Redis (5 min TTL)
    redis_client.setex(
        name=f"notification:{notification_id}",
        time=300,
        value=json.dumps(notification)
    )

    print(f"[Worker] Notification stored in Redis: {notification}")

    # Publish notification to RabbitMQ (internal queue)
    try:
        rabbitmq_host = os.getenv("RABBITMQ_HOST", "rabbitmq")

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=rabbitmq_host)
        )
        channel = connection.channel()

        channel.queue_declare(
            queue="notifications.queue",
            durable=True
        )

        channel.basic_publish(
            exchange="",
            routing_key="notifications.queue",
            body=json.dumps(notification),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        connection.close()
        print("[RABBITMQ] Published to notifications.queue")

    except Exception as e:
        print(f"[RABBITMQ] Error publishing message: {e}")


def run_worker():
    print("[Worker] Starting Notification Service (MQTT subscriber)...")

    subscriber = MQTTSubscriber(on_event_callback=handle_event)
    subscriber.start()
