from sqlalchemy.orm import Session
from datetime import datetime
import logging

from kafka.errors import KafkaError

from app.models.pet import Pet
from app.schemas.pet import PetCreate

# Kafka
from app.messaging.kafka_producer import publish_pet_created

# MQTT
from app.messaging.mqtt_publisher import publish_pet_created_to_mqtt


logger = logging.getLogger(__name__)


def create_pet(db: Session, data: PetCreate) -> Pet:
    """
    Create a new pet in the database and publish a PetCreated domain event.
    Kafka is non-blocking and must NOT break the business operation.
    """

    # Create Pet entity
    pet = Pet(**data.dict())

    # Persist pet in database
    db.add(pet)
    db.commit()
    db.refresh(pet)

    # Build domain event
    event = {
        "event_type": "PetCreated",
        "pet_id": pet.id,
        "owner_id": pet.owner_id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "created_at": datetime.utcnow().isoformat()
    }

    # 🔹 Kafka (NON-BLOCKING)
    try:
        publish_pet_created(event)
        logger.info("[KAFKA] PetCreated event published")
    except KafkaError as e:
        logger.warning(f"[KAFKA] Broker unavailable: {e}")
    except Exception as e:
        logger.error(f"[KAFKA] Unexpected error: {e}")

    # 🔹 MQTT (real-time notifications)
    try:
        publish_pet_created_to_mqtt(event)
        logger.info("[MQTT] PetCreated event published")
    except Exception as e:
        logger.error(f"[MQTT] Error publishing event: {e}")

    return pet


def get_pets_by_owner(db: Session, owner_id: int):
    """
    Retrieve all pets associated with a specific owner.
    """
    return db.query(Pet).filter(Pet.owner_id == owner_id).all()
