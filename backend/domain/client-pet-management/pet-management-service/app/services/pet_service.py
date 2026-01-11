from sqlalchemy.orm import Session
from datetime import datetime

from app.models.pet import Pet
from app.schemas.pet import PetCreate

# Kafka (se mantiene)
from app.messaging.kafka_producer import publish_pet_created

# MQTT (nuevo)
from app.messaging.mqtt_publisher import publish_pet_created_to_mqtt


def create_pet(db: Session, data: PetCreate) -> Pet:
    """
    Create a new pet in the database and publish a PetCreated domain event
    to Kafka and MQTT.
    """

    # Create Pet entity from request data
    pet = Pet(**data.dict())

    # Persist pet in the database
    db.add(pet)
    db.commit()
    db.refresh(pet)

    # Build PetCreated event payload
    event = {
        "event_type": "PetCreated",
        "pet_id": pet.id,
        "owner_id": pet.owner_id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "created_at": datetime.utcnow().isoformat()
    }

    # 🔹 Publish event to Kafka (EDA - future use)
    publish_pet_created(event)

    # 🔹 Publish event to MQTT (Notification Service)
    publish_pet_created_to_mqtt(event)

    return pet


def get_pets_by_owner(db: Session, owner_id: int):
    """
    Retrieve all pets associated with a specific owner.
    """
    return db.query(Pet).filter(Pet.owner_id == owner_id).all()
