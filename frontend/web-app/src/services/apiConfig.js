export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8080";

export function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
