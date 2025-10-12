import axios from 'axios';
import { AuthCache } from '../contexts/AuthContext';

// Enhanced API service with caching and request deduplication
class EnhancedApiService {
  constructor() {
    this.baseURL = "http://127.0.0.1:8000/api/";
    this.pendingRequests = new Map();
    this.requestCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes default TTL
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for token attachment
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for caching
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh and caching
    this.api.interceptors.response.use(
      (response) => {
        // Add response time for performance monitoring
        if (response.config.metadata) {
          const duration = Date.now() - response.config.metadata.startTime;
          console.debug(`API Request completed in ${duration}ms:`, response.config.url);
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem("refresh");
          if (refreshToken) {
            try {
              const res = await axios.post(
                `${this.baseURL}auth/token/refresh/`,
                { refresh: refreshToken }
              );

              // Save new tokens
              localStorage.setItem("access", res.data.access);
              if (res.data.refresh) {
                localStorage.setItem("refresh", res.data.refresh);
              }

              // Retry request with new token
              originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              this.clearAuthData();
              return Promise.reject(refreshError);
            }
          } else {
            this.clearAuthData();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  clearAuthData() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    AuthCache.clear();
    
    // Clear all caches
    this.requestCache.clear();
    this.pendingRequests.clear();
    
    // Only redirect if not already on login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // Generate cache key for requests
  generateCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}_${JSON.stringify(sortedParams)}`;
  }

  // Check if cache is valid
  isCacheValid(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  // Get cached response
  getCachedResponse(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    return cached ? cached.data : null;
  }

  // Set cache
  setCache(cacheKey, data) {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries periodically
    if (this.requestCache.size > 100) {
      this.cleanupCache();
    }
  }

  // Cleanup old cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.requestCache.delete(key);
      }
    }
  }

  // Request deduplication
  async deduplicatedRequest(config) {
    const cacheKey = this.generateCacheKey(config.url, config.params);
    
    // Check if same request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.debug('Deduplicating request:', config.url);
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    if (config.method === 'get' && this.isCacheValid(cacheKey)) {
      console.debug('Returning cached response:', config.url);
      return { data: this.getCachedResponse(cacheKey) };
    }

    // Make the request
    const requestPromise = this.api(config).then(response => {
      // Cache GET requests
      if (config.method === 'get') {
        this.setCache(cacheKey, response.data);
      }
      
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
      
      return response;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Add to pending requests
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Enhanced GET with caching
  async get(url, params = {}, options = {}) {
    const config = {
      method: 'get',
      url,
      params,
      ...options
    };
    
    return this.deduplicatedRequest(config);
  }

  // Enhanced POST
  async post(url, data = {}, options = {}) {
    const config = {
      method: 'post',
      url,
      data,
      ...options
    };
    
    // Invalidate related caches on POST
    this.invalidateRelatedCaches(url);
    
    return this.api(config);
  }

  // Enhanced PUT
  async put(url, data = {}, options = {}) {
    const config = {
      method: 'put',
      url,
      data,
      ...options
    };
    
    // Invalidate related caches on PUT
    this.invalidateRelatedCaches(url);
    
    return this.api(config);
  }

  // Enhanced PATCH
  async patch(url, data = {}, options = {}) {
    const config = {
      method: 'patch',
      url,
      data,
      ...options
    };
    
    // Invalidate related caches on PATCH
    this.invalidateRelatedCaches(url);
    
    return this.api(config);
  }

  // Enhanced DELETE
  async delete(url, options = {}) {
    const config = {
      method: 'delete',
      url,
      ...options
    };
    
    // Invalidate related caches on DELETE
    this.invalidateRelatedCaches(url);
    
    return this.api(config);
  }

  // Invalidate related caches
  invalidateRelatedCaches(url) {
    const urlParts = url.split('/');
    const resource = urlParts[0]; // e.g., 'inspections', 'users', etc.
    
    // Remove all cache entries related to this resource
    for (const [key] of this.requestCache.entries()) {
      if (key.includes(resource)) {
        this.requestCache.delete(key);
      }
    }
    
    console.debug(`Invalidated caches for resource: ${resource}`);
  }

  // Clear all caches
  clearAllCaches() {
    this.requestCache.clear();
    this.pendingRequests.clear();
  }

  // Set cache TTL
  setCacheTTL(ttl) {
    this.cacheTTL = ttl;
  }
}

// Create singleton instance
const enhancedApi = new EnhancedApiService();

// Enhanced API functions with caching
export const enhancedLoginUser = async (email, password) => {
  const response = await enhancedApi.post("auth/token/", { email, password });
  
  // Store tokens
  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);
  
  return response.data;
};

export const enhancedGetProfile = async () => {
  const response = await enhancedApi.get("auth/me/");
  return response.data;
};

export const enhancedGetUsers = async (params = {}) => {
  const response = await enhancedApi.get("auth/list/", { params });
  return response.data;
};

export const enhancedGetEstablishments = async (params = {}) => {
  const response = await enhancedApi.get("establishments/", { params });
  return response.data;
};

export const enhancedGetInspections = async (params = {}) => {
  const response = await enhancedApi.get("inspections/", { params });
  return response.data;
};

export const enhancedGetTabCounts = async () => {
  const response = await enhancedApi.get("inspections/tab_counts/");
  return response.data;
};

export const enhancedGetNotifications = async () => {
  const response = await enhancedApi.get("notifications/");
  return response.data;
};

// Enhanced logout with cache clearing
export const enhancedLogoutUser = async (refreshToken) => {
  try {
    const response = await enhancedApi.post("auth/logout/", { refresh: refreshToken });
    
    // Clear all caches and auth data
    enhancedApi.clearAllCaches();
    AuthCache.clear();
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    
    return response.data;
  } catch (error) {
    // Even if logout API fails, clear local data
    enhancedApi.clearAllCaches();
    AuthCache.clear();
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    throw error;
  }
};

// Cache management utilities
export const clearApiCaches = () => {
  enhancedApi.clearAllCaches();
};

export const setApiCacheTTL = (ttl) => {
  enhancedApi.setCacheTTL(ttl);
};

export const getCacheStats = () => {
  return {
    requestCacheSize: enhancedApi.requestCache.size,
    pendingRequestsSize: enhancedApi.pendingRequests.size,
    cacheTTL: enhancedApi.cacheTTL
  };
};

export default enhancedApi;
