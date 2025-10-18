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
          // Only redirect if not already on login page to prevent page refresh during login
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      } else {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        // Only redirect if not already on login page to prevent page refresh during login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
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
  const res = await api.post("auth/login/", { email, password });
  localStorage.setItem("access", res.data.tokens.access);
  localStorage.setItem("refresh", res.data.tokens.refresh);
  return {
    ...res.data,
    access: res.data.tokens.access,
    refresh: res.data.tokens.refresh,
    must_change_password: res.data.user?.must_change_password || false
  };
};

export const registerUser = async (userData) => {
  const res = await api.post("auth/register/", userData);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("auth/me/");
  return res.data;
};

export const getUsers = async (params = {}) => {
  const res = await api.get("auth/list/", { params });
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

export const getMyEstablishments = async (params = {}) => {
  const res = await api.get("establishments/my_establishments/", { params });
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

export const getAvailableEstablishments = async (params = {}) => {
  const res = await api.get("establishments/available_for_inspection/", { params });
  return res.data;
};

// -------------------------------------------------
// Inspections - Updated for new backend
// -------------------------------------------------
export const getInspections = async (params = {}) => {
  const res = await api.get("inspections/", { params });
  return res.data;
};

export const getInspection = async (id) => {
  const res = await api.get(`inspections/${id}/`);
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
        error.response?.data?.establishments?.[0] ||
        error.response?.data?.law?.[0] ||
        "Failed to create inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const updateInspection = async (id, inspectionData) => {
  const res = await api.patch(`inspections/${id}/`, inspectionData);
  return res.data;
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

// Workflow Action Functions
export const assignToMe = async (id) => {
  try {
    const res = await api.post(`inspections/${id}/assign_to_me/`);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to assign inspection to yourself. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const inspectInspection = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/inspect/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to move inspection to My Inspections. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const startInspection = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/start/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to start inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const continueInspection = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/continue/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to continue inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const saveInspectionDraft = async (id, formData) => {
  try {
    const res = await api.post(`inspections/${id}/save_draft/`, formData);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to save draft. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const autoSaveInspection = async (id, formData) => {
  try {
    const res = await api.post(`inspections/${id}/auto_save/`, formData);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to auto-save. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const checkInspectionFormData = async (id) => {
  try {
    const res = await api.get(`inspections/${id}/check_form_data/`);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to check form data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const completeInspection = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/complete/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to complete inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const forwardInspection = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/forward/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to forward inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const reviewInspection = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/review/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to review inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const forwardToLegal = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/forward_to_legal/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to forward to legal unit. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sendToSection = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/send_to_section/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to send to section. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sendToDivision = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/send_to_division/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to send to division. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sendNOV = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/send_nov/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to send Notice of Violation. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const sendNOO = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/send_noo/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to send Notice of Order. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const closeInspection = async (id, data = {}) => {
  try {
  const res = await api.post(`inspections/${id}/close/`, data);
  return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to close inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getInspectionHistory = async (id) => {
  const res = await api.get(`inspections/${id}/history/`);
  return res.data;
};

export const getInspectionDocuments = async (id) => {
  const res = await api.get(`inspections/${id}/documents/`);
  return res.data;
};

export const uploadInspectionDocument = async (id, formData) => {
  const res = await api.post(`inspections/${id}/documents/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Upload finding document with system association
export const uploadFindingDocument = async (inspectionId, systemId, file, caption = '', findingType = 'individual') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('system_id', systemId);
  formData.append('caption', caption);
  formData.append('finding_type', findingType);
  
  const res = await api.post(`inspections/${inspectionId}/findings/documents/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Delete finding document
export const deleteFindingDocument = async (inspectionId, documentId) => {
  const res = await api.delete(`inspections/${inspectionId}/documents/${documentId}/`);
  return res.data;
};

// Update document caption
export const updateDocumentCaption = async (inspectionId, documentId, caption) => {
  const res = await api.patch(`inspections/${inspectionId}/documents/${documentId}/`, {
    caption
  });
  return res.data;
};

// Get finding documents for an inspection
export const getFindingDocuments = async (inspectionId) => {
  const res = await api.get(`inspections/${inspectionId}/findings/documents/`);
  return res.data;
};

// Get available actions for an inspection
export const getAvailableActions = async (id) => {
  const res = await api.get(`inspections/${id}/available_actions/`);
  return res.data;
};

// Get available monitoring personnel for an inspection
export const getInspectionAvailableMonitoringPersonnel = async (inspectionId) => {
  const res = await api.get(`inspections/${inspectionId}/available_monitoring_personnel/`);
  return res.data;
};

// Dashboard compliance statistics
export const getComplianceStats = async (params = {}) => {
  const res = await api.get('inspections/compliance_stats/', { params });
  return res.data;
};

// Quarterly comparison data
export const getQuarterlyComparison = async (params = {}) => {
  const res = await api.get('inspections/quarterly_comparison/', { params });
  return res.data;
};

// Compliance by law data
export const getComplianceByLaw = async (params = {}) => {
  const res = await api.get('inspections/compliance_by_law/', { params });
  return res.data;
};

// Get tab counts for role-based dashboards
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

// Bulk operations for notifications
export const bulkMarkNotificationsAsRead = async (notificationIds) => {
  const res = await api.post("notifications/bulk-mark-read/", {
    notification_ids: notificationIds
  });
  return res.data;
};

export const bulkDeleteNotifications = async (notificationIds) => {
  const res = await api.post("notifications/bulk-delete/", {
    notification_ids: notificationIds
  });
  return res.data;
};

export const getNotificationStats = async () => {
  const res = await api.get("notifications/stats/");
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

export const getSearchSuggestions = async (params) => {
  const token = localStorage.getItem("access");
  if (!token) {
    throw new Error("User not authenticated");
  }
  
  // Handle both string and object params for backward compatibility
  const searchParams = typeof params === 'string' ? { q: params } : params;
  const q = searchParams.q;
  
  if (!q || q.length < 2) {
    return { suggestions: [] };
  }
  
  const res = await api.get("search/suggestions/", { params: searchParams });
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
