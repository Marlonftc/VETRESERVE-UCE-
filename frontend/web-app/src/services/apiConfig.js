const RAW_API_BASE =
  import.meta.env.VITE_API_BASE || "http://ec2-34-237-174-159.compute-1.amazonaws.com";
const TRIMMED_BASE = RAW_API_BASE.replace(/\/+$/, "");
export const API_BASE = TRIMMED_BASE.replace(/\/api$/, "");

export function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
