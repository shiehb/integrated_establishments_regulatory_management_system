// src/services/api.js
import axios from "axios";
import apiCache from "./apiCache";
import { API_BASE_URL } from "../config/api";

// -------------------------------------------------
// Axios Instance
// -------------------------------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const authExcludedPaths = [
    "auth/login/",
    "auth/register/",
    "auth/token/refresh/",
  ];

  if (config?.url && authExcludedPaths.some((path) => config.url.includes(path))) {
    return config;
  }

  const token = localStorage.getItem("access");
  if (token) {
    config.headers = config.headers ?? {};
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
            `${API_BASE_URL}auth/token/refresh/`,
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

export const firstTimeChangePassword = async (oldPassword, newPassword) => {
  try {
    const res = await api.post("auth/first-time-change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.old_password?.[0] ||
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

export const setEstablishmentPolygon = async (id, polygonData, markerIcon = null) => {
  const data = {
    polygon: polygonData || [],
  };
  
  if (markerIcon) {
    data.marker_icon = markerIcon;
  }
  
  const res = await api.post(`establishments/${id}/set_polygon/`, data);
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

/**
 * Check if an establishment name already exists
 * @param {string} name - The establishment name to check
 * @returns {Promise<boolean>} - True if name exists, false otherwise
 */
export const checkEstablishmentNameExists = async (name) => {
  try {
    if (!name || name.trim().length === 0) {
      return false;
    }
    
    const res = await api.get("establishments/search/", {
      params: { 
        q: name.trim(),
        page_size: 1 
      }
    });
    
    // Check if any result has the exact same name (case-insensitive)
    return res.data.results && res.data.results.some(
      est => est.name.toUpperCase() === name.toUpperCase()
    );
  } catch (error) {
    console.error('Error checking establishment name:', error);
    return false; // Don't block on error
  }
};

// -------------------------------------------------
// Inspections - Updated for new backend
// -------------------------------------------------
export const getInspections = async (params = {}) => {
  // Disable caching for inspections to ensure fresh data
  const res = await api.get("inspections/", { params });
  return res.data;
};

export const getInspection = async (id) => {
  const res = await api.get(`inspections/${id}/`);
  return res.data;
};

export const getReinspectionReminders = async () => {
  const res = await api.get("inspections/reinspection-reminders/");
  return res.data;
};

export const createInspection = async (inspectionData) => {
  try {
    const res = await api.post("inspections/", inspectionData);
    
    // Clear inspection-related cache
    apiCache.clearByPattern('inspections');
    
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
  
  // Clear inspection-related cache
  apiCache.clearByPattern('inspections');
  
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

export const returnInspection = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/return_to_previous/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to return inspection. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const returnToMonitoring = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/return_to_monitoring/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to return inspection to monitoring. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const returnToUnit = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/return_to_unit/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to return inspection to unit. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const returnToSection = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/return_to_section/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to return inspection to section. Please try again."
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
  const res = await api.delete(`inspections/${inspectionId}/findings/documents/`, {
    data: { document_id: documentId }
  });
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

// Quota management functions
export const getQuotas = async (params = {}) => {
  const res = await api.get('inspections/get_quotas/', { params });
  return res.data;
};

export const setQuota = async (quotaData) => {
  // Support both single quota and bulk (array) quotas
  const res = await api.post('inspections/set_quota/', quotaData);
  
  // If bulk response, return the full response object (includes results and errors)
  if (res.data.results) {
    return res.data; // Return full object with results, errors, message
  }
  
  // Single quota response
  return res.data;
};

export const autoAdjustQuotas = async (params = {}) => {
  const res = await api.post('inspections/auto_adjust_quotas/', params);
  return res.data;
};

export const getQuotaLaws = async () => {
  const res = await api.get('inspections/quota-laws/');
  return res.data;
};

// Quarterly evaluation functions
export const evaluateQuarter = async (evaluationData) => {
  const res = await api.post('inspections/evaluate_quarter/', evaluationData);
  return res.data;
};

export const getQuarterlyEvaluations = async (params = {}) => {
  const res = await api.get('inspections/get_quarterly_evaluations/', { params });
  return res.data;
};

export const manualEvaluateQuarter = async (evaluationData) => {
  const res = await api.post('inspections/manual_evaluate_quarter/', evaluationData);
  return res.data;
};

export const applyCarryOver = async (carryOverData) => {
  const res = await api.post('inspections/apply_carry_over/', carryOverData);
  return res.data;
};

export const getYearlySummary = async (year) => {
  const res = await api.get('inspections/yearly-summary/', { params: { year } });
  return res.data;
};

// Get tab counts for role-based dashboards
export const getTabCounts = async () => {
  try {
    // Check cache first
    const cached = apiCache.get('inspections/tab_counts/');
    if (cached) {
      return cached;
    }

    const res = await api.get('inspections/tab_counts/');
    
    // Cache the response for 3 minutes
    apiCache.set('inspections/tab_counts/', {}, res.data, 3 * 60 * 1000);
    
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
// Laws Management
// -------------------------------------------------
export const getLaws = async (params = {}) => {
  const res = await api.get("laws/", { params });
  return res.data;
};

export const getLawById = async (id) => {
  const res = await api.get(`laws/${id}/`);
  return res.data;
};

export const createLaw = async (payload) => {
  const res = await api.post("laws/", payload);
  return res.data;
};

export const updateLaw = async (id, payload) => {
  const res = await api.put(`laws/${id}/`, payload);
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
export const createBackup = async (path) => {
  try {
    if (!path) {
      throw new Error("Backup directory path is required");
    }
    const res = await api.post("db/backup/", { path });
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to create backup. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const restoreBackupFromFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

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

export const restoreBackupById = async (backupRecordId) => {
  try {
    const res = await api.post("db/restore/", { backupRecordId });
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

// -------------------------------------------------
// Billing Records API
// -------------------------------------------------

/**
 * Get all billing records with optional filters
 */
export const getBillingRecords = async (params = {}) => {
  try {
    const response = await api.get('billing/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch billing records. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Get a single billing record by ID
 */
export const getBillingRecord = async (id) => {
  try {
    const response = await api.get(`billing/${id}/`);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch billing record. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Get billing statistics
 */
export const getBillingStatistics = async () => {
  try {
    const response = await api.get('billing/statistics/');
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch billing statistics. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Generate printable billing receipt
 */
export const printBillingReceipt = async (id) => {
  try {
    const response = await api.get(`billing/${id}/print_receipt/`);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to generate receipt. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Mark a billing record as paid
 */
export const markBillingAsPaid = async (id, payload = {}) => {
  try {
    const response = await api.post(`billing/${id}/mark-paid/`, payload);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to update payment status. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const markBillingAsUnpaid = async (id, payload = {}) => {
  try {
    const response = await api.post(`billing/${id}/mark-unpaid/`, payload);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to revert payment status. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// -------------------------------------------------
// Signature Management
// -------------------------------------------------
export const uploadInspectionSignature = async (id, formData) => {
  const res = await api.post(`inspections/${id}/upload_signature/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteInspectionSignature = async (id, slot) => {
  const res = await api.delete(`inspections/${id}/delete_signature/`, {
    data: { slot }
  });
  return res.data;
};

// -------------------------------------------------
// Recommendation Management
// -------------------------------------------------
export const addRecommendation = async (id, recommendationData) => {
  const res = await api.post(`inspections/${id}/add_recommendation/`, recommendationData);
  return res.data;
};

export const updateRecommendation = async (id, recId, recommendationData) => {
  const res = await api.put(`inspections/${id}/update_recommendation/${recId}/`, recommendationData);
  return res.data;
};

export const deleteRecommendation = async (id, recId) => {
  const res = await api.delete(`inspections/${id}/delete_recommendation/${recId}/`);
  return res.data;
};

// -------------------------------------------------
// Legal Report Generation
// -------------------------------------------------
export const getLegalReportData = async (params = {}) => {
  try {
    const response = await api.get('legal-reports/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch legal report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getLegalReportStatistics = async (params = {}) => {
  try {
    const response = await api.get('legal-reports/statistics/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch legal report statistics. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getLegalReportRecommendations = async (params = {}) => {
  try {
    const response = await api.get('legal-reports/recommendations/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch recommendations. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportLegalReportPDF = async (params = {}) => {
  try {
    const response = await api.get('legal-reports/export_pdf/', {
      params,
      responseType: 'blob'
    });
    
    // Check if response is actually an error (JSON error returned as blob)
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      // Response is JSON error, parse it
      const text = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || errorData.error || 'Failed to export PDF');
    }
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `legal_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    // Handle blob error responses
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(error.response.data);
        });
        const errorData = JSON.parse(text);
        const enhancedError = new Error(
          errorData.detail || errorData.error || "Failed to export PDF. Please try again."
        );
        enhancedError.response = error.response;
        throw enhancedError;
      } catch (parseError) {
        // If parsing fails, use generic error
        const enhancedError = new Error(
          error.response?.data?.detail ||
            error.response?.data?.error ||
            "Failed to export PDF. Please try again."
        );
        enhancedError.response = error.response;
        throw enhancedError;
      }
    }
    
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportLegalReportExcel = async (params = {}) => {
  try {
    const response = await api.get('legal-reports/export_excel/', {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `legal_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Division Report Generation
// -------------------------------------------------
export const getDivisionReportData = async (params = {}) => {
  try {
    const response = await api.get('division-reports/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch division report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getDivisionReportStatistics = async (params = {}) => {
  try {
    const response = await api.get('division-reports/statistics/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch division report statistics. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getDivisionReportRecommendations = async (params = {}) => {
  try {
    const response = await api.get('division-reports/recommendations/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch recommendations. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportDivisionReportPDF = async (params = {}) => {
  try {
    const response = await api.get('division-reports/export_pdf/', {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `division_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportDivisionReportExcel = async (params = {}) => {
  try {
    const response = await api.get('division-reports/export_excel/', {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `division_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Section Report Generation
// -------------------------------------------------
export const getSectionReportData = async (params = {}) => {
  try {
    const response = await api.get('section-reports/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch section report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportSectionReportPDF = async (params = {}) => {
  try {
    const response = await api.get('section-reports/export_pdf/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `section_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportSectionReportExcel = async (params = {}) => {
  try {
    const response = await api.get('section-reports/export_excel/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `section_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Unit Report Generation
// -------------------------------------------------
export const getUnitReportData = async (params = {}) => {
  try {
    const response = await api.get('unit-reports/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch unit report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportUnitReportPDF = async (params = {}) => {
  try {
    const response = await api.get('unit-reports/export_pdf/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unit_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportUnitReportExcel = async (params = {}) => {
  try {
    const response = await api.get('unit-reports/export_excel/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unit_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Monitoring Report Generation
// -------------------------------------------------
export const getMonitoringReportData = async (params = {}) => {
  try {
    const response = await api.get('monitoring-reports/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch monitoring report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportMonitoringReportPDF = async (params = {}) => {
  try {
    const response = await api.get('monitoring-reports/export_pdf/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monitoring_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportMonitoringReportExcel = async (params = {}) => {
  try {
    const response = await api.get('monitoring-reports/export_excel/', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monitoring_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Admin Report Generation
// -------------------------------------------------
export const getAdminReportEstablishments = async (params = {}) => {
  try {
    const response = await api.get('admin-reports/establishments/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch establishments report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getAdminReportUsers = async (params = {}) => {
  try {
    const response = await api.get('admin-reports/users/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch users report data. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getAdminReportFilterOptions = async (params = {}) => {
  try {
    const response = await api.get('admin-reports/filter_options/', { params });
    return response.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to fetch filter options. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportAdminReportPDF = async (params = {}, reportType = 'establishments') => {
  try {
    const endpoint = reportType === 'establishments' 
      ? 'admin-reports/export_establishments_pdf/' 
      : 'admin-reports/export_users_pdf/';
    
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin_${reportType}_report_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export PDF. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const exportAdminReportExcel = async (params = {}, reportType = 'establishments') => {
  try {
    const endpoint = reportType === 'establishments' 
      ? 'admin-reports/export_establishments_excel/' 
      : 'admin-reports/export_users_excel/';
    
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin_${reportType}_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to export Excel. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

