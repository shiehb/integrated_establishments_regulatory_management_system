// LayoutWithSidebar.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import InternalHeader from "./InternalHeader";
import Footer from "./Footer";
import { getProfile } from "../services/api";

// Configuration constants
const PROFILE_CACHE_TTL_MINUTES = 10; // Configurable cache TTL
const PROFILE_CACHE_KEY = "profile";
const SIDEBAR_STATE_KEY = "sidebarOpen";

// Helper: set cache with expiry
function setCache(key, value, ttlMinutes) {
  const expiry = Date.now() + ttlMinutes * 60 * 1000; // TTL in ms
  localStorage.setItem(key, JSON.stringify({ value, expiry }));
}

// Helper: get cache and check expiry
function getCache(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { value, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(key); // expired → remove
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

// Helper: invalidate cache
function invalidateCache(key) {
  localStorage.removeItem(key);
}

export default function LayoutWithSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [profile, setProfile] = useState(() => {
    return getCache(PROFILE_CACHE_KEY);
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Fetch profile if not cached or expired
  useEffect(() => {
    if (!profile && !profileLoading) {
      setProfileLoading(true);
      setProfileError(null);
      
      getProfile()
        .then((data) => {
          setProfile(data);
          setCache(PROFILE_CACHE_KEY, data, PROFILE_CACHE_TTL_MINUTES);
          setProfileError(null);
        })
        .catch((error) => {
          console.error("Failed to fetch profile:", error);
          setProfileError(error);
          setProfile(null);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [profile, profileLoading]);

  // Listen for logout events to invalidate profile cache
  useEffect(() => {
    const handleLogout = () => {
      invalidateCache(PROFILE_CACHE_KEY);
      setProfile(null);
      setProfileError(null);
    };

    const handleStorageChange = (e) => {
      if (e.key === "access" && !e.newValue) {
        // Token removed, invalidate profile
        handleLogout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom logout event
    window.addEventListener("userLogout", handleLogout);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogout", handleLogout);
    };
  }, []);

  // Show loading state while fetching profile
  if (profileLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
          <span className="text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (profileError && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-2">Profile Loading Error</div>
          <p className="text-sm text-gray-600 mb-4">
            Unable to load your profile. Please check your connection and try again.
          </p>
          <button 
            onClick={() => {
              invalidateCache(PROFILE_CACHE_KEY);
              setProfile(null);
              setProfileError(null);
              setProfileLoading(false);
            }} 
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const userLevel = profile?.userlevel || "public";
  const userName = profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : "Guest";

  return (
    <div className="h-[calc(100vh-100px)] flex">
      <Sidebar
        userLevel={userLevel}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        <InternalHeader
          userLevel={userLevel}
          userName={userName}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
