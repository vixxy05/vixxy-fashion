export const env = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "/admin/dashboard",
};

export const API_BASE = env.apiUrl;
export const SOCKET_URL = env.socketUrl;
