import json
import paho.mqtt.client as mqtt
from app.core.config import MQTT_HOST, MQTT_PORT, MQTT_TOPIC


class MQTTPublisher:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
        self.client.loop_start()

    def publish(self, message: dict):
        payload = json.dumps(message)
        self.client.publish(MQTT_TOPIC, payload)
        print(f"[MQTT] Published to {MQTT_TOPIC}: {message}")

    def close(self):
        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception:
            pass
