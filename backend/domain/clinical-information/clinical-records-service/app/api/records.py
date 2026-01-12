from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.services.record_service import (
    create_record,
    get_record_by_id,
    list_records_by_pet,
    update_record,
    delete_record,
)

router = APIRouter(prefix="/clinical-records", tags=["Clinical Records"])


class ClinicalRecordCreate(BaseModel):
    pet_id: int
    vet_id: Optional[int] = None
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class ClinicalRecordUpdate(BaseModel):
    vet_id: Optional[int] = None
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class ClinicalRecordResponse(BaseModel):
    id: str
    pet_id: int
    vet_id: Optional[int] = None
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("", response_model=ClinicalRecordResponse)
def create(payload: ClinicalRecordCreate):
    return create_record(payload.model_dump())


@router.get("/{record_id}", response_model=ClinicalRecordResponse)
def get_one(record_id: str):
    record = get_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Clinical record not found")
    return record


@router.get("/pet/{pet_id}", response_model=List[ClinicalRecordResponse])
def list_by_pet(pet_id: int):
    return list_records_by_pet(pet_id)


@router.put("/{record_id}", response_model=ClinicalRecordResponse)
def update_one(record_id: str, payload: ClinicalRecordUpdate):
    record = update_record(record_id, payload.model_dump())
    if not record:
        raise HTTPException(status_code=404, detail="Clinical record not found")
    return record


@router.delete("/{record_id}")
def delete_one(record_id: str):
    ok = delete_record(record_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Clinical record not found")
    return {"deleted": True}
