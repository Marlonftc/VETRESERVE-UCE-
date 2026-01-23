import { API_BASE, authHeaders } from "./apiConfig";

const USER_SERVICE_URL = `${API_BASE}/api/users`;

export async function registerUser(data) {
  const res = await fetch(`${USER_SERVICE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Register failed");
  }

  return res.json();
}

export async function getPendingVets(token) {
  const res = await fetch(`${USER_SERVICE_URL}/vets/pending`, {
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pending vets");
  }

  return res.json();
}

export async function getActiveVets(token) {
  const res = await fetch(`${USER_SERVICE_URL}/vets/active`, {
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch vets");
  }

  return res.json();
}

export async function approveVet(id, token) {
  const res = await fetch(`${USER_SERVICE_URL}/${id}/approve`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    throw new Error("Approval failed");
  }

  return res.json();
}
