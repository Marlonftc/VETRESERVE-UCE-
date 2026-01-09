import json
from kafka import KafkaConsumer
from app.core.config import KAFKA_BOOTSTRAP_SERVERS


def build_consumer(topic: str) -> KafkaConsumer:
    return KafkaConsumer(
        topic,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        consumer_timeout_ms=1000,  # allows graceful loop
    )
