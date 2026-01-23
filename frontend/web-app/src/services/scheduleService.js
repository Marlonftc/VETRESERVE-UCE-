import { API_BASE, authHeaders } from "./apiConfig";

const SCHEDULE_URL = `${API_BASE}/api/vet-schedules`;

export async function createSchedule(data, token) {
  const res = await fetch(`${SCHEDULE_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create schedule");
  }

  return res.json();
}
