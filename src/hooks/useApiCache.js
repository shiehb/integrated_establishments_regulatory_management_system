import { useCallback, useRef } from 'react';
import apiCache from '../services/apiCache';

// Custom hook for API caching with React integration
export const useApiCache = () => {
  const pendingRequests = useRef(new Map());

  // Cached API call function
  const cachedApiCall = useCallback(async (apiFunction, params = {}, options = {}) => {
    const { 
      ttl = 5 * 60 * 1000, // 5 minutes default
      cacheKey = null,
      forceRefresh = false 
    } = options;

    // Generate cache key
    const key = cacheKey || `${apiFunction.name}?${JSON.stringify(params)}`;
    
    // Check if request is already pending
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = apiCache.get(key, params);
      if (cached) {
        console.log(`🚀 Cache hit for ${key}`);
        return cached;
      }
    }

    // Make API call
    console.log(`🌐 API call for ${key}`);
    const promise = apiFunction(params)
      .then(response => {
        // Cache the response
        apiCache.set(key, params, response, ttl);
        pendingRequests.current.delete(key);
        return response;
      })
      .catch(error => {
        pendingRequests.current.delete(key);
        throw error;
      });

    // Store pending request
    pendingRequests.current.set(key, promise);
    return promise;
  }, []);

  // Clear cache for specific pattern
  const clearCache = useCallback((pattern) => {
    if (pattern) {
      apiCache.clearByPattern(pattern);
    } else {
      apiCache.clearAll();
    }
  }, []);

  // Clear specific cache entry
  const clearCacheEntry = useCallback((apiFunction, params = {}) => {
    const key = `${apiFunction.name}?${JSON.stringify(params)}`;
    apiCache.clear(key, params);
  }, []);

  return {
    cachedApiCall,
    clearCache,
    clearCacheEntry,
    getCacheStats: () => apiCache.getStats()
  };
};

export default useApiCache;
