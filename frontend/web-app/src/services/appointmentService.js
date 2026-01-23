import { API_BASE, authHeaders } from "./apiConfig";

const APPOINTMENT_URL = `${API_BASE}/api/appointments`;

export async function createAppointment(data, token) {
  const res = await fetch(`${APPOINTMENT_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create appointment");
  }

  return res.json();
}

export async function getVetAppointments(token) {
  const res = await fetch(`${APPOINTMENT_URL}/vet`, {
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load appointments");
  }

  return res.json();
}
