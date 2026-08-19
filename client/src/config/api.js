const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();

// Strip any trailing slashes and trailing /api if the user entered it in Vercel env
const cleanUrl = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");

export const API_URL = cleanUrl;
export const API_BASE = `${cleanUrl}/api`;
