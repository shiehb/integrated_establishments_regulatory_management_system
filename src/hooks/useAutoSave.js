import { useEffect, useRef, useCallback, useState } from 'react';
import { autoSaveInspection } from '../services/api';

/**
 * Custom hook for auto-saving form data to backend every 30 seconds
 * @param {Object} formData - The form data to save
 * @param {string} inspectionId - The inspection ID
 * @param {Object} options - Configuration options
 * @returns {Object} - Auto-save state and controls
 */
export const useAutoSave = (formData, inspectionId, options = {}) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onSaveSuccess = () => {},
    onSaveError = () => {},
    validateBeforeSave = () => true, // Default validation always passes
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const intervalRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if data has changed since last save
  const hasDataChanged = useCallback(() => {
    if (!lastSavedDataRef.current) return true;
    
    try {
      const currentDataString = JSON.stringify(formData);
      const lastSavedDataString = JSON.stringify(lastSavedDataRef.current);
      return currentDataString !== lastSavedDataString;
    } catch (error) {
      console.error('Error comparing form data:', error);
      return true; // If we can't compare, assume it changed
    }
  }, [formData]);

  // Validate form data before saving
  const validateFormData = useCallback(() => {
    try {
      return validateBeforeSave(formData);
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, [formData, validateBeforeSave]);

  // Save data to backend
  const saveToBackend = useCallback(async () => {
    if (!inspectionId || !isOnline || isSaving) {
      return;
    }

    // Check if data has changed
    if (!hasDataChanged()) {
      console.log('📝 No changes detected, skipping auto-save');
      return;
    }

    // Validate data before saving
    if (!validateFormData()) {
      console.log('❌ Validation failed, skipping auto-save');
      setSaveError('Form validation failed');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('💾 Auto-saving form data to backend...');
      
      const saveData = {
        general: formData.general,
        purpose: formData.purpose,
        permits: formData.permits,
        complianceItems: formData.complianceItems,
        systems: formData.systems,
        recommendationState: formData.recommendationState,
        lawFilter: formData.lawFilter,
        lastSaved: new Date().toISOString(),
        isDraft: true,
      };

      const response = await autoSaveInspection(inspectionId, saveData);
      
      // Update last saved data reference
      lastSavedDataRef.current = { ...formData };
      setLastSaveTime(new Date().toISOString());
      
      console.log('✅ Auto-save successful:', response);
      onSaveSuccess(response);
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      setSaveError(error.message || 'Failed to save form data');
      onSaveError(error);
    } finally {
      setIsSaving(false);
    }
  }, [
    inspectionId,
    isOnline,
    isSaving,
    formData,
    hasDataChanged,
    validateFormData,
    onSaveSuccess,
    onSaveError,
  ]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled || !inspectionId || !isOnline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`🔄 Setting up auto-save interval: ${interval}ms`);
    
    intervalRef.current = setInterval(() => {
      saveToBackend();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, inspectionId, isOnline, interval, saveToBackend]);

  // Save immediately when coming back online
  useEffect(() => {
    if (isOnline && enabled && inspectionId && hasDataChanged()) {
      console.log('🌐 Back online, saving pending changes...');
      // Add a small delay to ensure the connection is stable
      saveTimeoutRef.current = setTimeout(() => {
        saveToBackend();
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isOnline, enabled, inspectionId, hasDataChanged, saveToBackend]);

  // Manual save function
  const saveNow = useCallback(() => {
    return saveToBackend();
  }, [saveToBackend]);

  // Reset last saved data (useful when loading new data)
  const resetLastSavedData = useCallback(() => {
    lastSavedDataRef.current = { ...formData };
  }, [formData]);

  return {
    isSaving,
    lastSaveTime,
    saveError,
    isOnline,
    saveNow,
    resetLastSavedData,
    hasDataChanged: hasDataChanged(),
  };
};
