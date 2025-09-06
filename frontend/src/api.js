import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function fetchInfo(url) {
  const res = await axios.get(`${API_BASE}/api/info`, {
    params: { url }
  });
  return res.data;
}

export function downloadUrl(url) {
  // return URL to hit backend download endpoint
  return `${API_BASE}/api/download?url=${encodeURIComponent(url)}`;
}