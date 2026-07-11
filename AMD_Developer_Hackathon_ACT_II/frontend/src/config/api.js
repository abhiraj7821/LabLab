const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";

export const API_ENDPOINTS = {
  CAPTION: `${API_BASE_URL}/api/${API_VERSION}/caption`,
  HEALTH: `${API_BASE_URL}/health`,
  READY: `${API_BASE_URL}/ready`,
};
