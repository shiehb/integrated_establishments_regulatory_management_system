// API Configuration
// Use VITE_API_BASE_URL environment variable or default to localhost for development
// For Vercel deployment, set VITE_API_BASE_URL in Vercel environment variables
// Example: https://your-backend-domain.com/api/
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

// Expose to window for debugging (only in development)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__API_CONFIG__ = {
    API_BASE_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    isDefault: !import.meta.env.VITE_API_BASE_URL
  };
  console.log('🔧 API Configuration:', window.__API_CONFIG__);
}

export default API_BASE_URL;
