from typing import Dict, Any


def record_to_response(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert Mongo document to API response.
    """
    return {
        "id": str(doc["_id"]),
        "pet_id": doc.get("pet_id"),
        "vet_id": doc.get("vet_id"),
        "summary": doc.get("summary"),
        "diagnosis": doc.get("diagnosis"),
        "treatment": doc.get("treatment"),
        "notes": doc.get("notes"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }
