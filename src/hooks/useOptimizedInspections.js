import { useState, useEffect, useCallback, useRef } from 'react';
import { getInspections, getTabCounts } from '../services/api';
import { useApiCache } from './useApiCache';

// Custom hook for optimized inspections data fetching
export const useOptimizedInspections = (userLevel, currentUser) => {
  const [inspections, setInspections] = useState([]);
  const [tabCounts, setTabCounts] = useState({});
  const [paginationMeta, setPaginationMeta] = useState({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { cachedApiCall, clearCache } = useApiCache();
  const lastFetchTime = useRef(0);
  const fetchCooldown = 2000; // 2 seconds cooldown between fetches

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (params) => {
      try {
        setLoading(true);
        setError(null);
        
        // Call API directly without caching for fresh data
        const response = await getInspections(params);
        
        if (response.results) {
          setInspections(response.results);
          // Store pagination metadata
          setPaginationMeta({
            count: response.count || 0,
            next: response.next || null,
            previous: response.previous || null
          });
        } else {
          setInspections(response);
          // If no pagination, set count to array length
          setPaginationMeta({
            count: Array.isArray(response) ? response.length : 0,
            next: null,
            previous: null
          });
        }
      } catch (err) {
        console.error('Error fetching inspections:', err);
        setError(err);
        setInspections([]);
        setPaginationMeta({ count: 0, next: null, previous: null });
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Optimized tab counts fetching - single API call instead of multiple
  const fetchTabCounts = useCallback(async () => {
    if (!currentUser) {
      setTabCounts({});
      return;
    }

    try {
      // Use the dedicated tab counts endpoint instead of multiple individual calls
      const response = await cachedApiCall(getTabCounts, {}, {
        ttl: 3 * 60 * 1000, // 3 minutes cache for tab counts
        cacheKey: 'tab_counts'
      });
      
      setTabCounts(response || {});
    } catch (err) {
      console.error('Error fetching tab counts:', err);
      setTabCounts({});
    }
  }, [currentUser, cachedApiCall]);

  // Fetch inspections with cooldown protection
  const fetchInspections = useCallback(async (params = {}) => {
    const now = Date.now();
    if (now - lastFetchTime.current < fetchCooldown) {
      return;
    }
    
    lastFetchTime.current = now;
    await debouncedFetch(params);
  }, [debouncedFetch]);

  // Clear cache when needed (e.g., after creating/updating inspections)
  const refreshData = useCallback((clearCachePattern = 'inspections') => {
    clearCache(clearCachePattern);
    fetchTabCounts();
  }, [clearCache, fetchTabCounts]);

  // Initial data fetch
  useEffect(() => {
    if (currentUser) {
      fetchTabCounts();
    }
  }, [currentUser, fetchTabCounts]);

  return {
    inspections,
    tabCounts,
    paginationMeta,
    loading,
    error,
    fetchInspections,
    fetchTabCounts,
    refreshData
  };
};

// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default useOptimizedInspections;
