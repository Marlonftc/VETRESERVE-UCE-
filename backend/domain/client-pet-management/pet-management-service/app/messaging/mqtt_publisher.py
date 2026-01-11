import json
import os
import paho.mqtt.client as mqtt

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "mqtt")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_PET_CREATED_TOPIC = os.getenv(
    "MQTT_PET_CREATED_TOPIC", "pet/created"
)


def publish_pet_created_to_mqtt(event: dict) -> None:
    """
    Publish PetCreated event to MQTT broker.
    """
    client = mqtt.Client(protocol=mqtt.MQTTv311)

    client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)

    payload = json.dumps(event)

    client.publish(
        topic=MQTT_PET_CREATED_TOPIC,
        payload=payload,
        qos=1
    )

    client.disconnect()

    print(f"[MQTT-PUBLISHER] PetCreated event published: {event}")
