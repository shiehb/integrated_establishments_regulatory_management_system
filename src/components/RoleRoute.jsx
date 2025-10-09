import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../services/api";

export default function RoleRoute({ children, allowed = [] }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const maxRetries = 3;

  useEffect(() => {
    async function check() {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          console.warn("RoleRoute: No access token found");
          setOk(false);
          setHasError(false);
          return;
        }

        const me = await getProfile();
        const level = me.userlevel || "public";
        const hasAccess = allowed.includes(level);
        
        setOk(hasAccess);
        setHasError(false);
        setRetryCount(0); // Reset retry count on success
        
        localStorage.setItem("userLevel", level);
        localStorage.setItem("lastRoleCheck", Date.now().toString());
        
        // Log unauthorized access attempts
        if (!hasAccess) {
          console.warn(`RoleRoute: User '${me.email}' with level '${level}' denied access to roles:`, allowed);
        }
        
      } catch (e) {
        console.error("RoleRoute check failed:", e);
        setHasError(true);
        
        // Retry logic for network errors
        if (retryCount < maxRetries && (e.code === 'NETWORK_ERROR' || e.message?.includes('Network Error'))) {
          console.log(`RoleRoute: Retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            setLoading(true);
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        // Fallback to saved userLevel if API call fails
        const fallbackLevel = localStorage.getItem("userLevel") || "public";
        const lastCheck = localStorage.getItem("lastRoleCheck");
        const fallbackAge = lastCheck ? Date.now() - parseInt(lastCheck) : Infinity;
        
        // Only use fallback if it's recent (within 30 minutes)
        if (fallbackAge < 30 * 60 * 1000) {
          const hasAccess = allowed.includes(fallbackLevel);
          setOk(hasAccess);
          console.warn(`RoleRoute: Using fallback level '${fallbackLevel}' (age: ${Math.round(fallbackAge / 1000)}s)`);
        } else {
          setOk(false);
          console.error("RoleRoute: Fallback level too old, denying access");
        }
      } finally {
        setLoading(false);
      }
    }
    
    // Only check if we have a valid token
    const token = localStorage.getItem("access");
    if (token) {
      check();
    } else {
      setOk(false);
      setLoading(false);
    }
  }, [allowed, retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
          <span className="text-sm">
            {retryCount > 0 ? `Checking permissions... (Retry ${retryCount}/${maxRetries})` : "Checking permissions..."}
          </span>
          {hasError && retryCount > 0 && (
            <span className="text-xs text-red-500 mt-1">
              Connection issue, retrying...
            </span>
          )}
        </div>
      </div>
    );
  }

  if (hasError && retryCount >= maxRetries) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-2 font-semibold">Permission Check Failed</div>
          <p className="text-sm text-gray-600 mb-4">
            Unable to verify your permissions. Please check your connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return ok ? children : (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-600 mb-2 font-semibold text-lg">Access Denied</div>
        <p className="text-sm text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
