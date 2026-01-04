const USER_SERVICE_URL = "http://127.0.0.1:8001/users";

/* ✅ REGISTER USER (CLIENT / VET) */
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

/* ✅ GET PENDING VETS (ADMIN) */
export async function getPendingVets(token) {
  const res = await fetch(`${USER_SERVICE_URL}/vets/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Role": "ADMIN", // 🔥 OBLIGATORIO
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pending vets");
  }

  return res.json();
}

/* ✅ APPROVE VET (ADMIN) */
export async function approveVet(id, token) {
  const res = await fetch(`${USER_SERVICE_URL}/${id}/approve`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Role": "ADMIN", // 🔥 OBLIGATORIO
    },
  });

  if (!res.ok) {
    throw new Error("Approval failed");
  }

  return res.json();
}
