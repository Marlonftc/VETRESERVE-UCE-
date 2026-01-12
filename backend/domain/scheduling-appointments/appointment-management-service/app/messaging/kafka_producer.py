import os
import json
from kafka import KafkaProducer
from kafka.errors import KafkaError


KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")


class KafkaEventProducer:
    def __init__(self):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                retries=3
            )
            print(f"[KAFKA] Connected to {KAFKA_BROKER}")
        except KafkaError as e:
            print(f"[KAFKA] Connection failed: {e}")
            self.producer = None

    def publish(self, topic: str, event: dict):
        if not self.producer:
            print("[KAFKA] Producer not available")
            return

        try:
            self.producer.send(topic, event)
            self.producer.flush()
            print(f"[KAFKA] Event published to {topic}: {event}")
        except KafkaError as e:
            print(f"[KAFKA] Failed to publish event: {e}")
