// src/services/lawApi.js
import api from './api';

/**
 * Get all laws from the API
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>} Array of laws
 */
export const getLaws = async (params = {}) => {
  try {
    const response = await api.get('/laws/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching laws:', error);
    throw error;
  }
};

/**
 * Get a single law by ID
 * @param {number|string} id - Law ID
 * @returns {Promise<Object>} Law object
 */
export const getLaw = async (id) => {
  try {
    const response = await api.get(`/laws/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching law:', error);
    throw error;
  }
};

/**
 * Create a new law
 * @param {Object} lawData - Law data to create
 * @returns {Promise<Object>} Created law object
 */
export const createLaw = async (lawData) => {
  try {
    const response = await api.post('/laws/', lawData);
    return response.data;
  } catch (error) {
    console.error('Error creating law:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      Object.values(error.response?.data || {}).flat().join(', ') ||
      'Failed to create law. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Update an existing law
 * @param {number|string} id - Law ID
 * @param {Object} lawData - Updated law data
 * @returns {Promise<Object>} Updated law object
 */
export const updateLaw = async (id, lawData) => {
  try {
    const response = await api.put(`/laws/${id}/`, lawData);
    return response.data;
  } catch (error) {
    console.error('Error updating law:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      Object.values(error.response?.data || {}).flat().join(', ') ||
      'Failed to update law. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Partially update an existing law
 * @param {number|string} id - Law ID
 * @param {Object} lawData - Partial law data to update
 * @returns {Promise<Object>} Updated law object
 */
export const patchLaw = async (id, lawData) => {
  try {
    const response = await api.patch(`/laws/${id}/`, lawData);
    return response.data;
  } catch (error) {
    console.error('Error patching law:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      Object.values(error.response?.data || {}).flat().join(', ') ||
      'Failed to update law. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Delete a law
 * @param {number|string} id - Law ID
 * @returns {Promise<void>}
 */
export const deleteLaw = async (id) => {
  try {
    await api.delete(`/laws/${id}/`);
  } catch (error) {
    console.error('Error deleting law:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to delete law. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Toggle law status (Active/Inactive)
 * @param {number|string} id - Law ID
 * @returns {Promise<Object>} Updated law object
 */
export const toggleLawStatus = async (id) => {
  try {
    const response = await api.patch(`/laws/${id}/toggle-status/`);
    return response.data;
  } catch (error) {
    console.error('Error toggling law status:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to toggle law status. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

