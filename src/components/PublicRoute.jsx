// src/components/PublicRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const PublicRoute = ({ children, restricted = false }) => {
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
          setHasError(false);
          return;
        }

        // Basic token validation (similar to PrivateRoute)
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
        console.error("PublicRoute auth validation error:", error);
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
          <span className="text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    // If there's an error, still show the public route content
    // This prevents blocking users from accessing login/forgot password pages
    return children;
  }

  // If route is restricted and user is authenticated, redirect to intended destination or dashboard
  if (restricted && isAuthenticated) {
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
