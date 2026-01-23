import { API_BASE, authHeaders } from "./apiConfig";

const PET_SERVICE_URL = `${API_BASE}/api/pets/`;

export async function listPetsByOwner(ownerId) {
  const res = await fetch(`${PET_SERVICE_URL}owner/${ownerId}`);

  if (!res.ok) {
    throw new Error("Failed to load pets");
  }

  return res.json();
}

export async function createPet(data, token) {
  const res = await fetch(`${PET_SERVICE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create pet");
  }

  return res.json();
}
