import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../services/api";

export default function RoleRoute({ children, allowed = [] }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setOk(false);
          return;
        }

        const me = await getProfile();
        const level = me.userlevel || "public";
        setOk(allowed.includes(level));
        localStorage.setItem("userLevel", level);
      } catch (e) {
        console.error("RoleRoute check failed:", e);
        // fallback to saved userLevel if API call fails
        const fallbackLevel = localStorage.getItem("userLevel") || "public";
        setOk(allowed.includes(fallbackLevel));
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [allowed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  return ok ? children : <Navigate to="/" replace />;
}
