// Enhanced Cache Manager for the Application
// Provides centralized cache management with TTL, persistence, and cleanup

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 100;
    this.cleanupInterval = 10 * 60 * 1000; // 10 minutes
    
    // Start periodic cleanup
    this.startCleanup();
    
    // Listen for storage events (multi-tab sync)
    this.setupStorageSync();
  }

  // Set cache item with TTL
  set(key, value, ttl = null) {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiry,
      timestamp: Date.now()
    });

    // Persist to localStorage for cross-session
    this.persistToStorage(key, value, expiry);
    
    // Check cache size
    if (this.cache.size > this.maxCacheSize) {
      this.cleanup();
    }
  }

  // Get cache item
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      // Try to restore from localStorage
      const restored = this.restoreFromStorage(key);
      if (restored) {
        this.cache.set(key, restored);
        return restored.value;
      }
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  // Delete cache item
  delete(key) {
    this.cache.delete(key);
    this.removeFromStorage(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.clearStorage();
  }

  // Check if cache item exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxCacheSize,
      defaultTTL: this.defaultTTL
    };
  }

  // Cleanup expired items
  cleanup() {
    const now = Date.now();
    const toDelete = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.delete(key));
    
    // Also cleanup localStorage
    this.cleanupStorage();
    
    console.debug(`Cache cleanup: removed ${toDelete.length} expired items`);
  }

  // Start periodic cleanup
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Persist to localStorage
  persistToStorage(key, value, expiry) {
    try {
      const storageKey = `cache_${key}`;
      const data = {
        value,
        expiry,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error);
    }
  }

  // Restore from localStorage
  restoreFromStorage(key) {
    try {
      const storageKey = `cache_${key}`;
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Check if still valid
      if (Date.now() > data.expiry) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to restore cache from storage:', error);
      return null;
    }
  }

  // Remove from localStorage
  removeFromStorage(key) {
    try {
      const storageKey = `cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error);
    }
  }

  // Clear all cache from localStorage
  clearStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  }

  // Cleanup expired items from localStorage
  cleanupStorage() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const stored = localStorage.getItem(key);
            const data = JSON.parse(stored);
            
            if (now > data.expiry) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove malformed entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup storage:', error);
    }
  }

  // Setup storage sync for multi-tab scenarios
  setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('cache_')) {
        const cacheKey = e.key.replace('cache_', '');
        
        if (e.newValue === null) {
          // Item was deleted in another tab
          this.cache.delete(cacheKey);
        } else {
          // Item was updated in another tab
          try {
            const data = JSON.parse(e.newValue);
            this.cache.set(cacheKey, data);
          } catch (error) {
            console.warn('Failed to sync cache from storage:', error);
          }
        }
      }
    });
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const toDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.delete(key));
    
    console.debug(`Invalidated ${toDelete.length} cache entries matching pattern: ${pattern}`);
  }

  // Set cache configuration
  configure(options = {}) {
    if (options.defaultTTL) {
      this.defaultTTL = options.defaultTTL;
    }
    
    if (options.maxCacheSize) {
      this.maxCacheSize = options.maxCacheSize;
    }
    
    if (options.cleanupInterval) {
      this.cleanupInterval = options.cleanupInterval;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Specialized cache utilities for different data types
export const apiCache = {
  set: (key, value, ttl = 5 * 60 * 1000) => cacheManager.set(`api_${key}`, value, ttl),
  get: (key) => cacheManager.get(`api_${key}`),
  delete: (key) => cacheManager.delete(`api_${key}`),
  invalidate: (pattern) => cacheManager.invalidatePattern(`api_${pattern}`),
  clear: () => cacheManager.invalidatePattern('^api_')
};

export const userCache = {
  set: (key, value, ttl = 10 * 60 * 1000) => cacheManager.set(`user_${key}`, value, ttl),
  get: (key) => cacheManager.get(`user_${key}`),
  delete: (key) => cacheManager.delete(`user_${key}`),
  invalidate: (pattern) => cacheManager.invalidatePattern(`user_${pattern}`),
  clear: () => cacheManager.invalidatePattern('^user_')
};

export const inspectionCache = {
  set: (key, value, ttl = 3 * 60 * 1000) => cacheManager.set(`inspection_${key}`, value, ttl),
  get: (key) => cacheManager.get(`inspection_${key}`),
  delete: (key) => cacheManager.delete(`inspection_${key}`),
  invalidate: (pattern) => cacheManager.invalidatePattern(`inspection_${pattern}`),
  clear: () => cacheManager.invalidatePattern('^inspection_')
};

export const establishmentCache = {
  set: (key, value, ttl = 10 * 60 * 1000) => cacheManager.set(`establishment_${key}`, value, ttl),
  get: (key) => cacheManager.get(`establishment_${key}`),
  delete: (key) => cacheManager.delete(`establishment_${key}`),
  invalidate: (pattern) => cacheManager.invalidatePattern(`establishment_${pattern}`),
  clear: () => cacheManager.invalidatePattern('^establishment_')
};

// Utility functions
export const clearAllCaches = () => {
  cacheManager.clear();
  console.debug('All caches cleared');
};

export const getCacheStats = () => {
  return cacheManager.getStats();
};

export const configureCache = (options) => {
  cacheManager.configure(options);
};

export default cacheManager;
