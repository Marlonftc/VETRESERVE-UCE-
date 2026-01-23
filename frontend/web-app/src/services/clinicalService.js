import { API_BASE } from "./apiConfig";

const CLINICAL_URL = `${API_BASE}/api/clinical-records`;

export async function listRecordsByPet(petId) {
  const res = await fetch(`${CLINICAL_URL}/pet/${petId}`);

  if (!res.ok) {
    throw new Error("Failed to load clinical records");
  }

  return res.json();
}

export async function getRecordById(recordId) {
  const res = await fetch(`${CLINICAL_URL}/${recordId}`);

  if (!res.ok) {
    throw new Error("Failed to load clinical record");
  }

  return res.json();
}

export async function createRecord(data) {
  const res = await fetch(`${CLINICAL_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create clinical record");
  }

  return res.json();
}

export async function updateRecord(recordId, data) {
  const res = await fetch(`${CLINICAL_URL}/${recordId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update clinical record");
  }

  return res.json();
}

export async function deleteRecord(recordId) {
  const res = await fetch(`${CLINICAL_URL}/${recordId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete clinical record");
  }

  return res.json();
}
