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

export const getDistrictUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.userlevel) params.append('userlevel', filters.userlevel);
    if (filters.district) params.append('district', filters.district);
    if (filters.section) params.append('section', filters.section);
    
    const response = await api.get(`auth/district-users/?${params.toString()}`);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to fetch district users. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const assignDistrict = async (userId, district) => {
  try {
    const response = await api.post(`auth/assign-district/${userId}/`, { district });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to assign district. Please try again."
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

export const deleteInspection = async (id) => {
  try {
    const res = await api.delete(`inspections/${id}/`);
    return res.data;
  } catch (error) {
    console.error("Delete inspection error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to delete inspection. Please try again."
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

export const makeInspectionDecision = async (id, decisionData) => {
  const res = await api.post(`inspections/${id}/make_decision/`, decisionData);
  return res.data;
};

export const getInspectionWorkflowHistory = async (id) => {
  const res = await api.get(`inspections/${id}/workflow_history/`);
  return res.data;
};

export const getAvailablePersonnel = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.section) params.append('section', filters.section);
  if (filters.district) params.append('district', filters.district);
  if (filters.userlevel) params.append('userlevel', filters.userlevel);
  
  const res = await api.get(`inspections/available_personnel/?${params.toString()}`);
  return res.data;
};

// Workflow action functions
export const makeWorkflowDecision = async (id, action, comments = '') => {
  try {
    const res = await api.post(`inspections/${id}/make_decision/`, { 
      action, 
      comments 
    });
    return res.data;
  } catch (error) {
    console.error("Workflow decision error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to perform workflow decision. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sectionReview = async (id, comments = '') => {
  try {
    const res = await api.post(`inspections/${id}/section_review/`, { comments });
    return res.data;
  } catch (error) {
    console.error("Section review error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to perform section review. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const forwardToMonitoring = async (id, comments = '') => {
  try {
    const res = await api.post(`inspections/${id}/forward_to_monitoring/`, { comments });
    return res.data;
  } catch (error) {
    console.error("Forward to monitoring error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to forward to monitoring. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const unitReview = async (id, comments = '') => {
  try {
    const res = await api.post(`inspections/${id}/unit_review/`, { comments });
    return res.data;
  } catch (error) {
    console.error("Unit review error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to perform unit review. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const monitoringInspection = async (id, comments = '') => {
  try {
    const res = await api.post(`inspections/${id}/monitoring_inspection/`, { comments });
    return res.data;
  } catch (error) {
    console.error("Monitoring inspection error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to perform monitoring inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Return path handling
export const advanceReturnPath = async (id) => {
  try {
    const res = await api.post(`inspections/${id}/advance_return_path/`);
    return res.data;
  } catch (error) {
    console.error("Advance return path error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to advance return path. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Legal Unit actions
export const sendNoticeOfViolation = async (id, novData) => {
  try {
    const res = await api.post(`inspections/${id}/send_notice_of_violation/`, novData);
    return res.data;
  } catch (error) {
    console.error("Send NOV error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to send Notice of Violation. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sendNoticeOfOrder = async (id, nooData) => {
  try {
    const res = await api.post(`inspections/${id}/send_notice_of_order/`, nooData);
    return res.data;
  } catch (error) {
    console.error("Send NOO error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to send Notice of Order. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const closeCase = async (id, closureData) => {
  try {
    const res = await api.post(`inspections/${id}/close_case/`, closureData);
    return res.data;
  } catch (error) {
    console.error("Close case error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to close case. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Compliance tracking
export const updateComplianceStatus = async (id, complianceData) => {
  try {
    const res = await api.post(`inspections/${id}/update_compliance/`, complianceData);
    return res.data;
  } catch (error) {
    console.error("Update compliance error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to update compliance status. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Tab counts for role-based dashboards
export const getTabCounts = async () => {
  try {
    const res = await api.get('inspections/tab_counts/');
    return res.data;
  } catch (error) {
    console.error("Get tab counts error:", error.response?.data || error);
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to get tab counts. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
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
export const createBackup = async (format, path = "") => {
  try {
    const res = await api.post("db/backup/", { format, path });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to create backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const restoreBackupFromFile = async (file, restoreOptions = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("restoreOptions", JSON.stringify({
      conflictHandling: restoreOptions.conflictHandling || 'skip'
    }));

    const res = await api.post("db/restore/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to restore backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const restoreBackupByName = async (fileName, restoreOptions = {}) => {
  try {
    const res = await api.post("db/restore/", { 
      fileName, 
      restoreOptions: {
        conflictHandling: restoreOptions.conflictHandling || 'skip'
      }
    });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to restore backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getBackups = async () => {
  try {
    const res = await api.get("db/backups/");
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to fetch backups. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const deleteBackup = async (fileName) => {
  try {
    const res = await api.delete(`db/delete/${fileName}/`);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to delete backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const downloadBackup = async (fileName) => {
  try {
    const response = await api.get(`db/download/${fileName}/`, {
      // Fixed URL pattern
      responseType: "blob",
    });
    return response;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to download backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};
