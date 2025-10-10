// src/components/PrivateRoute.jsx (enhanced)
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = localStorage.getItem("access");
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Check if token is expired (basic JWT expiry check)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setIsAuthenticated(false);
            return;
          }
        } catch (parseError) {
          // Invalid token format
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        setHasError(false);
      } catch (error) {
        console.error("Auth validation error:", error);
        setHasError(true);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
          <span className="text-sm">Validating authentication...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-2">Authentication Error</div>
          <p className="text-sm text-gray-600 mb-4">Unable to verify your authentication status</p>
          <Navigate to="/login" replace state={{ from: location.pathname }} />
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

export default PrivateRoute;
