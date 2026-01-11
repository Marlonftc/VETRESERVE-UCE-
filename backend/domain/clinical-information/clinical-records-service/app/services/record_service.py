from datetime import datetime
from typing import Optional, List, Dict, Any

from bson import ObjectId
from pymongo.collection import Collection

from app.core.database import get_db
from app.core.config import CLINICAL_RECORDS_COLLECTION
from app.models.record import record_to_response


def _collection() -> Collection:
    db = get_db()
    return db[CLINICAL_RECORDS_COLLECTION]


def create_record(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow().isoformat()

    doc = {
        "pet_id": data["pet_id"],
        "vet_id": data.get("vet_id"),
        "summary": data.get("summary"),
        "diagnosis": data.get("diagnosis"),
        "treatment": data.get("treatment"),
        "notes": data.get("notes"),
        "created_at": now,
        "updated_at": now,
    }

    col = _collection()
    result = col.insert_one(doc)
    created = col.find_one({"_id": result.inserted_id})
    return record_to_response(created)


def get_record_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    col = _collection()
    try:
        doc = col.find_one({"_id": ObjectId(record_id)})
    except Exception:
        return None

    if not doc:
        return None

    return record_to_response(doc)


def list_records_by_pet(pet_id: int) -> List[Dict[str, Any]]:
    col = _collection()
    docs = col.find({"pet_id": pet_id}).sort("created_at", -1)
    return [record_to_response(d) for d in docs]


def update_record(record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    col = _collection()
    try:
        oid = ObjectId(record_id)
    except Exception:
        return None

    update_fields = {}
    for key in ["summary", "diagnosis", "treatment", "notes", "vet_id"]:
        if key in data and data[key] is not None:
            update_fields[key] = data[key]

    update_fields["updated_at"] = datetime.utcnow().isoformat()

    result = col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return None

    updated = col.find_one({"_id": oid})
    return record_to_response(updated)


def delete_record(record_id: str) -> bool:
    col = _collection()
    try:
        oid = ObjectId(record_id)
    except Exception:
        return False

    result = col.delete_one({"_id": oid})
    return result.deleted_count == 1
