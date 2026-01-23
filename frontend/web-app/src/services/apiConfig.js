export const API_BASE = import.meta.env.VITE_API_BASE || "http://ec2-34-237-174-159.compute-1.amazonaws.com/api/owners";

export function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
