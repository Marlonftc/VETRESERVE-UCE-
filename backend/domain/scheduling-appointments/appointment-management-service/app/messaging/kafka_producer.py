import json
from kafka import KafkaProducer
from kafka.errors import KafkaError


class KafkaEventProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers="localhost:9092",
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            retries=3
        )

    def publish(self, topic: str, event: dict):
        try:
            self.producer.send(topic, event)
            self.producer.flush()
            print(f"[KAFKA] Event published to {topic}: {event}")
        except KafkaError as e:
            # IMPORTANT: do not break business flow
            print(f"[KAFKA] Failed to publish event: {e}")
