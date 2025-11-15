// src/services/helpApi.js
import api from './api';

/**
 * Get all help topics from the API
 */
export const getHelpTopics = async () => {
  try {
    const response = await api.get('/help/topics/');
    return response.data;
  } catch (error) {
    console.error('Error fetching help topics:', error);
    throw error;
  }
};

/**
 * Get all help categories from the API
 */
export const getHelpCategories = async () => {
  try {
    const response = await api.get('/help/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching help categories:', error);
    throw error;
  }
};

/**
 * Save help topics (admin only)
 */
export const saveHelpTopics = async (topics) => {
  try {
    const response = await api.post('/help/topics/save/', topics);
    return response.data;
  } catch (error) {
    console.error('Error saving help topics:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to save help topics. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Save help categories (admin only)
 */
export const saveHelpCategories = async (categories) => {
  try {
    const response = await api.post('/help/categories/save/', categories);
    return response.data;
  } catch (error) {
    console.error('Error saving help categories:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to save help categories. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Export help data as ZIP archive with images (admin only)
 */
export const exportHelpData = async () => {
  try {
    const response = await api.get('/help/backup/', {
      responseType: 'blob', // Important: receive binary data
    });
    return response.data; // Returns Blob
  } catch (error) {
    console.error('Error exporting help data:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to export help data. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Import/restore help data from ZIP archive or JSON (admin only)
 * @param {File|Object} fileOrData - ZIP file (File object) or JSON data (Object)
 */
export const importHelpData = async (fileOrData) => {
  try {
    let response;
    
    // If it's a File object (ZIP), send as FormData
    if (fileOrData instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrData);
      
      response = await api.post('/help/restore/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // JSON data (backward compatibility)
      response = await api.post('/help/restore/', fileOrData);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error importing help data:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to import help data. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

/**
 * Upload help image (admin only)
 */
export const uploadHelpImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/help/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading help image:', error);
    const enhancedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Failed to upload image. Please try again.'
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

