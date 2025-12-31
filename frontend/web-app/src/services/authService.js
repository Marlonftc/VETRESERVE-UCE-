export async function loginRequest(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }

  return res.json();
}

export async function getMe(token) {
  const res = await fetch("http://127.0.0.1:8000/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}
