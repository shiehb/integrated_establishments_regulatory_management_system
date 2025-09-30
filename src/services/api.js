// src/services/api.js
import axios from "axios";

// -------------------------------------------------
// Axios Instance
// -------------------------------------------------
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/auth/token/refresh/",
            { refresh: refreshToken }
          );

          // Save new tokens
          localStorage.setItem("access", res.data.access);
          if (res.data.refresh) {
            localStorage.setItem("refresh", res.data.refresh);
          }

          // Retry request with new token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// -------------------------------------------------
// Authentication
// -------------------------------------------------
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

export const getUsers = async () => {
  const res = await api.get("auth/list/");
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`auth/users/${id}/`, userData);
  return res.data;
};

export const logoutUser = async (refreshToken) => {
  const res = await api.post("auth/logout/", { refresh: refreshToken });
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  return res.data;
};

export const toggleUserActive = async (id) => {
  try {
    const response = await api.post(`auth/toggle-active/${id}/`);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to update user status. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const firstTimeChangePassword = async (newPassword) => {
  try {
    const res = await api.post("auth/first-time-change-password/", {
      new_password: newPassword,
    });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.new_password?.[0] ||
        "Failed to change password. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const res = await api.post("auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.new_password?.[0] ||
        error.response?.data?.old_password?.[0] ||
        "Failed to change password. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// -------------------------------------------------
// Establishments
// -------------------------------------------------
export const getEstablishments = async (params = {}) => {
  const res = await api.get("establishments/", { params });
  return res.data;
};

export const getEstablishment = async (id) => {
  const res = await api.get(`establishments/${id}/`);
  return res.data;
};

export const createEstablishment = async (establishmentData) => {
  const res = await api.post("establishments/", establishmentData);
  return res.data;
};

export const updateEstablishment = async (id, establishmentData) => {
  const res = await api.put(`establishments/${id}/`, establishmentData);
  return res.data;
};

export const deleteEstablishment = async (id) => {
  const res = await api.delete(`establishments/${id}/`);
  return res.data;
};

export const setEstablishmentPolygon = async (id, polygonData) => {
  const res = await api.post(`establishments/${id}/set_polygon/`, {
    polygon: polygonData || [],
  });
  return res.data;
};

export const getEstablishmentSearchSuggestions = async (query) => {
  const res = await api.get("establishments/search_suggestions/", {
    params: { q: query },
  });
  return res.data;
};

export const getEstablishmentSearchOptions = async () => {
  const res = await api.get("establishments/search_options/");
  return res.data;
};

export const searchEstablishments = async (query, page = 1, pageSize = 10) => {
  const res = await api.get("establishments/search/", {
    params: { q: query, page, page_size: pageSize },
  });
  return res.data;
};

// -------------------------------------------------
// Inspections
// -------------------------------------------------
export const getInspections = async (params = {}) => {
  const res = await api.get("inspections/", { params });
  return res.data;
};

export const searchInspections = async (query, page = 1, pageSize = 10) => {
  const res = await api.get("inspections/search/", {
    params: { q: query, page, page_size: pageSize },
  });
  return res.data;
};

export const getInspectionSearchSuggestions = async (query) => {
  const res = await api.get("inspections/search_suggestions/", {
    params: { q: query },
  });
  return res.data;
};

export const createInspection = async (inspectionData) => {
  try {
    console.log("Sending inspection data:", inspectionData);
    const res = await api.post("inspections/", inspectionData);
    console.log("Inspection created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("Create inspection error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.establishment?.[0] ||
        error.response?.data?.section?.[0] ||
        "Failed to create inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const assignInspection = async (id, payload) => {
  const res = await api.post(`inspections/${id}/assign/`, payload);
  return res.data;
};

export const advanceInspection = async (id) => {
  const res = await api.post(`inspections/${id}/advance/`);
  return res.data;
};

export const getDistricts = async (province) => {
  const res = await api.get("inspections/districts/", { params: { province } });
  return res.data;
};

export const getAssignableUsers = async (district, role) => {
  const res = await api.get("inspections/assignable_users/", {
    params: { district, role },
  });
  return res.data;
};

// -------------------------------------------------
// Notifications
// -------------------------------------------------
export const getNotifications = async () => {
  const res = await api.get("notifications/");
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await api.post(`notifications/${id}/read/`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await api.post("notifications/mark-all-read/");
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`notifications/${id}/delete/`);
  return res.data;
};

export const deleteAllNotifications = async () => {
  const res = await api.delete("notifications/delete-all/");
  return res.data;
};

export const getUnreadNotificationsCount = async () => {
  const res = await api.get("notifications/unread-count/");
  return res.data;
};

export const getEstablishmentNotifications = async () => {
  const res = await api.get("notifications/", {
    params: { notification_type: "new_establishment" },
  });
  return res.data;
};

// -------------------------------------------------
// Activity Logs
// -------------------------------------------------
export const getActivityLogs = async () => {
  const res = await api.get("activity-logs/");
  return res.data;
};

export const getFilteredActivityLogs = async (params) => {
  const res = await api.get("activity-logs/", { params });
  return res.data;
};

// -------------------------------------------------
// OTP
// -------------------------------------------------
export const sendOtp = async (email) => {
  const res = await api.post("auth/send-otp/", { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await api.post("auth/verify-otp/", { email, otp });
  return res.data;
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const res = await api.post("auth/reset-password-otp/", {
    email,
    otp,
    new_password: newPassword,
  });
  return res.data;
};

// -------------------------------------------------
// Global Search
// -------------------------------------------------
export const globalSearch = async (params) => {
  const token = localStorage.getItem("access");
  if (!token) {
    throw new Error("User not authenticated");
  }
  const res = await api.get("search/", { params: { q: params.q } });
  return res.data;
};

export const getSearchSuggestions = async (query) => {
  const token = localStorage.getItem("access");
  if (!token) {
    throw new Error("User not authenticated");
  }
  if (!query || query.length < 2) {
    return { suggestions: [] };
  }
  const res = await api.get("search/suggestions/", { params: { q: query } });
  return res.data;
};

export const getSearchOptions = async () => {
  const token = localStorage.getItem("access");
  if (!token) {
    throw new Error("User not authenticated");
  }
  const res = await api.get("search/options/");
  return res.data;
};

export const searchUsers = async (query, page = 1, pageSize = 10) => {
  const res = await api.get("auth/search/", {
    params: { q: query, page, page_size: pageSize },
  });
  return res.data;
};

// -------------------------------------------------
// Database Backup & Restore
// -------------------------------------------------

// Create a backup
export const createBackup = async (format = "sql", path = "") => {
  const res = await api.post("db/backup/", { format, path });
  return res.data;
};

// Restore from a file (uploaded)
export const restoreBackupFromFile = async (file, path = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (path) formData.append("path", path);

  const res = await api.post("db/restore/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Restore from an existing backup file
export const restoreBackupByName = async (fileName) => {
  const res = await api.post("db/restore/", { fileName });
  return res.data;
};

// List all available backups
export const getBackups = async () => {
  const res = await api.get("db/backups/");
  return res.data;
};

// Delete a backup
export const deleteBackup = async (fileName) => {
  const res = await api.delete(`db/delete/${fileName}/`);
  return res.data;
};
