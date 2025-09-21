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

// 🔑 Login
export const loginUser = async (email, password) => {
  const res = await api.post("auth/token/", { email, password });
  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
  return res.data;
};

// ➕ Register user
export const registerUser = async (userData) => {
  const res = await api.post("auth/register/", userData);
  return res.data;
};

// 🙍 Profile
export const getProfile = async () => {
  const res = await api.get("auth/me/");
  return res.data;
};

// 📋 User list
export const getUsers = async () => {
  const res = await api.get("auth/list/");
  return res.data;
};

// ✏️ Update user
export const updateUser = async (id, userData) => {
  const res = await api.put(`auth/users/${id}/`, userData);
  return res.data;
};

// 🚪 Logout
export const logoutUser = async (refreshToken) => {
  const res = await api.post("auth/logout/", { refresh: refreshToken });
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  return res.data;
};

// 🚦 Toggle user active status
export const toggleUserActive = async (id) => {
  try {
    const response = await api.post(`auth/toggle-active/${id}/`);
    return response.data;
  } catch (error) {
    // Enhance error message for better notifications
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

// 🔑 Change password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const res = await api.post("auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  } catch (error) {
    // Enhance error message for better notifications
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

// ----------------------
// Establishment Functions
// ----------------------

// 📋 Get all establishments
export const getEstablishments = async () => {
  const res = await api.get("establishments/");
  return res.data;
};

// 📋 Get single establishment
export const getEstablishment = async (id) => {
  const res = await api.get(`establishments/${id}/`);
  return res.data;
};

// ➕ Create establishment
export const createEstablishment = async (establishmentData) => {
  const res = await api.post("establishments/", establishmentData);
  return res.data;
};

// ✏️ Update establishment
export const updateEstablishment = async (id, establishmentData) => {
  const res = await api.put(`establishments/${id}/`, establishmentData);
  return res.data;
};

// 🗑️ Delete establishment
export const deleteEstablishment = async (id) => {
  const res = await api.delete(`establishments/${id}/`);
  return res.data;
};

// 🔺 Set establishment polygon (store in database as JSON)
export const setEstablishmentPolygon = async (id, polygonData) => {
  const res = await api.post(`establishments/${id}/set_polygon/`, {
    polygon: polygonData || [],
  });
  return res.data;
};

// ----------------------
// Notification Functions (UPDATED)
// ----------------------

// 🔔 Get all notifications
export const getNotifications = async () => {
  const res = await api.get("notifications/"); // Changed from "auth/notifications/"
  return res.data;
};

// ✅ Mark notification as read
export const markNotificationAsRead = async (id) => {
  const res = await api.post(`notifications/${id}/read/`); // Changed from "auth/notifications/"
  return res.data;
};

// ✅ Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const res = await api.post("notifications/mark-all-read/"); // Changed from "auth/notifications/"
  return res.data;
};

// 🗑️ Delete single notification
export const deleteNotification = async (id) => {
  const res = await api.delete(`notifications/${id}/delete/`);
  return res.data;
};

// 🗑️ Delete all notifications
export const deleteAllNotifications = async () => {
  const res = await api.delete("notifications/delete-all/"); // Changed from "auth/notifications/"
  return res.data;
};

// 🔢 Get unread notifications count
export const getUnreadNotificationsCount = async () => {
  const res = await api.get("notifications/unread-count/"); // Changed from "auth/notifications/"
  return res.data;
};

// 📋 Get establishment notifications
export const getEstablishmentNotifications = async () => {
  const res = await api.get("notifications/", {
    // Changed from "auth/notifications/"
    params: { notification_type: "new_establishment" },
  });
  return res.data;
};

// ----------------------
// OTP Functions
// ----------------------

// 🔐 Send OTP
export const sendOtp = async (email) => {
  const res = await api.post("auth/send-otp/", { email });
  return res.data;
};

// ✅ Verify OTP
export const verifyOtp = async (email, otp) => {
  const res = await api.post("auth/verify-otp/", { email, otp });
  return res.data;
};

// 🔑 Reset password with OTP
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const res = await api.post("auth/reset-password-otp/", {
    email,
    otp,
    new_password: newPassword,
  });
  return res.data;
};

// Mock API service for inspections (no backend required)

let mockInspections = [
  {
    id: "EIA-2025-0001",
    law: "PD-1586",
    status: "PENDING",
    created_at: new Date().toISOString(),
    metadata: { establishmentName: "Sample Establishment" },
    details: {},
  },
];

let idCounter = 2;

// 🔹 Fetch all inspections
export async function fetchInspectionLists() {
  return Promise.resolve(mockInspections);
}

// 🔹 Create a new inspection list
export async function createInspectionList(payload) {
  const newInspection = {
    id: `${payload.law || "GEN"}-${new Date().getFullYear()}-${idCounter
      .toString()
      .padStart(4, "0")}`,
    ...payload,
    created_at: new Date().toISOString(),
    status: "PENDING",
  };
  idCounter++;
  mockInspections.push(newInspection);
  return Promise.resolve(newInspection);
}

// 🔹 Get one inspection by ID
export async function fetchInspectionList(id) {
  const insp = mockInspections.find((i) => i.id === id);
  return Promise.resolve(insp);
}

// 🔹 Update inspection by ID
export async function updateInspectionList(id, updates) {
  mockInspections = mockInspections.map((i) =>
    i.id === id ? { ...i, ...updates } : i
  );
  return Promise.resolve(mockInspections.find((i) => i.id === id));
}

// 🔹 Forward inspection (just change status)
export async function forwardInspectionList(id, fromUser, toUser) {
  mockInspections = mockInspections.map((i) =>
    i.id === id ? { ...i, status: "FORWARDED" } : i
  );
  return Promise.resolve(mockInspections.find((i) => i.id === id));
}

// 🔹 Complete inspection item
export async function completeInspectionItem(id, payload) {
  mockInspections = mockInspections.map((i) =>
    i.id === id ? { ...i, status: "COMPLETED", ...payload } : i
  );
  return Promise.resolve(mockInspections.find((i) => i.id === id));
}

// ✅ also export api instance
export default api;
