// API Response Caching Service
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  // Get cached data if valid
  get(url, params = {}) {
    const key = this.generateKey(url, params);
    const timestamp = this.cacheTimestamps.get(key);
    
    if (!timestamp || !this.cache.has(key)) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - timestamp > this.defaultTTL) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Set cache data
  set(url, params = {}, data, ttl = this.defaultTTL) {
    const key = this.generateKey(url, params);
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
    
    // Set expiration timer
    setTimeout(() => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    }, ttl);
  }

  // Clear specific cache entry
  clear(url, params = {}) {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Clear cache by pattern (e.g., all inspection-related calls)
  clearByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const apiCache = new ApiCache();

export default apiCache;
