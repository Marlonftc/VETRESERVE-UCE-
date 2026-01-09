import time
from app.core.config import KAFKA_TOPIC_APPOINTMENT_CREATED
from app.messaging.kafka_consumer import build_consumer
from app.messaging.rabbitmq_client import RabbitMQPublisher
from app.messaging.mqtt_client import MQTTPublisher


def run_worker():
    consumer = build_consumer(KAFKA_TOPIC_APPOINTMENT_CREATED)
    rabbit = RabbitMQPublisher()
    mqtt = MQTTPublisher()

    print("[WORKER] Notification Service worker started.")
    print(f"[WORKER] Listening Kafka topic: {KAFKA_TOPIC_APPOINTMENT_CREATED}")

    try:
        while True:
            for msg in consumer:
                event = msg.value
                print(f"[KAFKA] Received: {event}")

                # 1) RabbitMQ queue (internal workflow)
                rabbit.publish(event)

                # 2) MQTT topic (realtime push)
                mqtt.publish(event)

            time.sleep(0.2)
    except KeyboardInterrupt:
        print("[WORKER] Stopping...")
    finally:
        rabbit.close()
        mqtt.close()
        try:
            consumer.close()
        except Exception:
            pass
