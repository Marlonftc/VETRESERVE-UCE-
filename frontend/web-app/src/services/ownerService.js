import { API_BASE, authHeaders } from "./apiConfig";

const OWNER_SERVICE_URL = `${API_BASE}/api/owners`;

export async function listOwners(token) {
  const res = await fetch(`${OWNER_SERVICE_URL}`, {
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load owners");
  }

  return res.json();
}

export async function createOwner(data, token) {
  const res = await fetch(`${OWNER_SERVICE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create owner");
  }

  return res.json();
}
