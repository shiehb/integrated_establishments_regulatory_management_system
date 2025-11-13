// Utilities for authentication context (cache + token helpers)

const CACHE_CONFIG = {
  PROFILE_TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_CACHE_SIZE: 50, // Maximum number of cached items
};

const CACHE_KEYS = {
  PROFILE: 'auth_profile',
  TOKENS: 'auth_tokens',
  LAST_LOGIN: 'auth_last_login',
  USER_PREFERENCES: 'auth_preferences',
};

class AuthCache {
  static set(key, value, ttl = null) {
    try {
      const cacheItem = {
        value,
        timestamp: Date.now(),
        ttl: ttl || CACHE_CONFIG.PROFILE_TTL,
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      this.cleanup();
    } catch (error) {
      console.warn('Failed to cache item:', error);
    }
  }

  static get(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.remove(key);
        return null;
      }

      return cacheItem.value;
    } catch (error) {
      console.warn('Failed to retrieve cache item:', error);
      this.remove(key);
      return null;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cache item:', error);
    }
  }

  static clear() {
    try {
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('auth_') || key === 'access' || key === 'refresh') {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear auth cache:', error);
    }
  }

  static cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter((key) => key.startsWith('auth_'));

      if (authKeys.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
        const items = authKeys
          .map((key) => ({
            key,
            timestamp: JSON.parse(localStorage.getItem(key))?.timestamp || 0,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        const toRemove = items.slice(0, authKeys.length - CACHE_CONFIG.MAX_CACHE_SIZE);
        toRemove.forEach((item) => this.remove(item.key));
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

class TokenManager {
  static getTokens() {
    return {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh'),
    };
  }

  static setTokens(access, refresh) {
    try {
      if (access) localStorage.setItem('access', access);
      if (refresh) localStorage.setItem('refresh', refresh);

      AuthCache.set(
        CACHE_KEYS.TOKENS,
        {
          access,
          refresh,
          timestamp: Date.now(),
        },
        CACHE_CONFIG.PROFILE_TTL,
      );
    } catch (error) {
      console.warn('Failed to store tokens:', error);
    }
  }

  static clearTokens() {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      AuthCache.remove(CACHE_KEYS.TOKENS);
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }

  static isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now + CACHE_CONFIG.TOKEN_REFRESH_THRESHOLD / 1000;
    } catch {
      return true;
    }
  }

  static needsRefresh() {
    const { access } = this.getTokens();
    return this.isTokenExpired(access);
  }
}

export { CACHE_CONFIG, CACHE_KEYS, AuthCache, TokenManager };

