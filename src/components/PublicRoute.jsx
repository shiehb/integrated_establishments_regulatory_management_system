// src/components/PublicRoute.jsx
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, restricted = false }) => {
  const token = localStorage.getItem("access");
  const isAuthenticated = !!token;

  // If route is restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
