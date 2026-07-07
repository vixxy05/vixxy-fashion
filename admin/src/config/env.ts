export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3003/api",
  socketUrl: import.meta.env.VITE_SOCKET_URL || "http://localhost:3003",
  storeUrl: import.meta.env.VITE_STORE_URL || "http://localhost:3000",
};

export const API_BASE = env.apiUrl;
export const SOCKET_URL = env.socketUrl;
export const STORE_URL = env.storeUrl;
