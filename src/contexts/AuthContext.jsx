import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, getProfile } from '../services/api';
import { useNotifications } from '../components/NotificationManager';
import { API_BASE_URL } from '../config/api';

// Cache configuration
const CACHE_CONFIG = {
  PROFILE_TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_CACHE_SIZE: 50, // Maximum number of cached items
};

// Cache keys
const CACHE_KEYS = {
  PROFILE: 'auth_profile',
  TOKENS: 'auth_tokens',
  LAST_LOGIN: 'auth_last_login',
  USER_PREFERENCES: 'auth_preferences',
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced cache utilities
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
      
      // Check if cache is expired
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
      // Remove all auth-related cache items
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Remove any other auth-related items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('auth_') || key === 'access' || key === 'refresh') {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage as well
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear auth cache:', error);
    }
  }

  static cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(key => key.startsWith('auth_'));
      
      if (authKeys.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
        // Remove oldest items
        const items = authKeys.map(key => ({
          key,
          timestamp: JSON.parse(localStorage.getItem(key))?.timestamp || 0
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        const toRemove = items.slice(0, authKeys.length - CACHE_CONFIG.MAX_CACHE_SIZE);
        toRemove.forEach(item => this.remove(item.key));
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

// Token management utilities
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
      
      // Cache token info with expiry
      AuthCache.set(CACHE_KEYS.TOKENS, {
        access,
        refresh,
        timestamp: Date.now()
      }, CACHE_CONFIG.PROFILE_TTL);
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
      return payload.exp < now + (CACHE_CONFIG.TOKEN_REFRESH_THRESHOLD / 1000);
    } catch {
      return true;
    }
  }

  static needsRefresh() {
    const { access } = this.getTokens();
    return this.isTokenExpired(access);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const notifications = useNotifications();

  // Initialize auth state from cache
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { access, refresh } = TokenManager.getTokens();
        
        if (!access || !refresh) {
          setLoading(false);
          return;
        }

        // Check if token needs refresh
        if (TokenManager.needsRefresh()) {
          AuthCache.clear();
          setLoading(false);
          return;
        }

        // Try to get cached profile first
        const cachedProfile = AuthCache.get(CACHE_KEYS.PROFILE);
        if (cachedProfile) {
          setUser(cachedProfile);
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        // Fetch fresh profile
        const profile = await getProfile();
        setUser(profile);
        setAuthenticated(true);
        
        // Cache the profile
        AuthCache.set(CACHE_KEYS.PROFILE, profile);
        
      } catch (error) {
        console.error('Auth initialization failed:', error);
        AuthCache.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      
      const response = await loginUser(email, password);
      
      // Store tokens
      TokenManager.setTokens(response.access, response.refresh);
      
      // Fetch and cache user profile
      const profile = await getProfile();
      setUser(profile);
      setAuthenticated(true);
      
      // Cache profile and login info
      AuthCache.set(CACHE_KEYS.PROFILE, profile);
      AuthCache.set(CACHE_KEYS.LAST_LOGIN, {
        email,
        timestamp: Date.now()
      });

      notifications.success('Login successful! Welcome back.', {
        title: 'Login Successful',
        duration: 3000
      });

      return {
        user: profile,
        mustChangePassword: response.must_change_password
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout API if tokens exist
      const { access, refresh } = TokenManager.getTokens();
      if (refresh) {
        try {
          const headers = {
            'Content-Type': 'application/json',
          };
          if (access) {
            headers.Authorization = `Bearer ${access}`;
          }

          await fetch(`${API_BASE_URL}auth/logout/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ refresh }),
          });
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }

      // Clear all auth data
      AuthCache.clear();
      TokenManager.clearTokens();
      
      // Reset state
      setUser(null);
      setAuthenticated(false);
      
      notifications.success('Logged out successfully!', {
        title: 'Logout Successful',
        duration: 3000
      });

      // Dispatch logout event for other components
      window.dispatchEvent(new CustomEvent('authLogout'));
      
    } catch (error) {
      console.error('Logout failed:', error);
      notifications.error('Logout failed!', {
        title: 'Logout Error',
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      AuthCache.set(CACHE_KEYS.PROFILE, profile);
      return profile;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If profile refresh fails, user might be logged out
      if (error.response?.status === 401) {
        await logout();
      }
      throw error;
    }
  }, [logout]);

  const updateUserPreferences = useCallback((preferences) => {
    if (user) {
      const updatedUser = { ...user, preferences };
      setUser(updatedUser);
      AuthCache.set(CACHE_KEYS.PROFILE, updatedUser);
      AuthCache.set(CACHE_KEYS.USER_PREFERENCES, preferences);
    }
  }, [user]);

  // Auto-refresh profile periodically
  useEffect(() => {
    if (!authenticated) return;

    const interval = setInterval(async () => {
      try {
        // Only refresh if cache is getting old
        const cachedProfile = AuthCache.get(CACHE_KEYS.PROFILE);
        if (!cachedProfile) {
          await refreshProfile();
        }
      } catch (error) {
        console.warn('Auto profile refresh failed:', error);
      }
    }, CACHE_CONFIG.PROFILE_TTL);

    return () => clearInterval(interval);
  }, [authenticated, refreshProfile]);

  const value = {
    user,
    loading,
    authenticated,
    login,
    logout,
    refreshProfile,
    updateUserPreferences,
    // Cache utilities
    cache: AuthCache,
    tokenManager: TokenManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
