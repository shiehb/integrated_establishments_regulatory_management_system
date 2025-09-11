// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// 🔑 Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 Handle token expiry and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/auth/token/refresh/",
            {
              refresh: refreshToken,
            }
          );

          // Save new tokens
          localStorage.setItem("access", res.data.access);
          if (res.data.refresh) {
            localStorage.setItem("refresh", res.data.refresh);
          }

          // Retry original request with new token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (err) {
          // Refresh also failed → logout
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        // No refresh token → logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------
// Named exports
// ----------------------
export const loginUser = async (email, password) => {
  const res = await api.post("auth/token/", { email, password });
  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("auth/register/", userData);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("auth/me/");
  return res.data;
};

// ✅ also export api instance
export default api;
