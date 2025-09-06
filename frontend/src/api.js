import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || ""; // set this in Vercel env if you host backend elsewhere

export async function fetchInfo(url) {
  const endpoint = API_BASE ? `${API_BASE}/api/info` : `/api/info`;
  const res = await axios.get(endpoint, { params: { url } });
  return res.data;
}

export function downloadUrl(url) {
  // Return backend download URL. If API_BASE is empty, this points to same origin /api/download
  const base = API_BASE || "";
  const prefix = base ? `${base}` : "";
  return `${prefix}/api/download?url=${encodeURIComponent(url)}`;
}

// Ping backend root to check availability
export async function pingBackend() {
  const base = API_BASE || "";
  const pingUrl = base ? `${base}/` : `/`;
  try {
    const res = await axios.get(pingUrl, { timeout: 3000 });
    return res.status >= 200 && res.status < 500;
  } catch (err) {
    return false;
  }
}