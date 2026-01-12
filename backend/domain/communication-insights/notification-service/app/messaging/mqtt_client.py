import json
import paho.mqtt.client as mqtt

from app.core.config import (
    MQTT_BROKER_HOST,
    MQTT_BROKER_PORT,
    MQTT_PET_CREATED_TOPIC,
)


class MQTTSubscriber:
    """
    Final MQTT subscriber for Notification Service.
    """

    def __init__(self, on_event_callback):
        self.on_event_callback = on_event_callback

        self.client = mqtt.Client(protocol=mqtt.MQTTv311)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

        print(f"[MQTT] Connecting to {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        self.client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("[MQTT] Connected successfully")
            client.subscribe(MQTT_PET_CREATED_TOPIC)
            print(f"[MQTT] Subscribed to topic: {MQTT_PET_CREATED_TOPIC}")
        else:
            print(f"[MQTT] Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        try:
            payload = msg.payload.decode("utf-8")
            event = json.loads(payload)
        except Exception as e:
            print(f"[MQTT] Invalid payload: {e}")
            return

        print(f"[MQTT] Event received: {event}")
        self.on_event_callback(event)

    def start(self):
        print("[MQTT] Waiting for events...")
        self.client.loop_forever()
