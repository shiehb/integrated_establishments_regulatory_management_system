import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import InspectionsCore from "../components/inspections/InspectionsCore";
import { getProfile } from "../services/api";

// Enhanced role configuration with more granular permissions
const ROLE_CONFIG = {
  "Legal Unit": {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    displayName: "Legal Unit",
    sidebarLabel: "Legal Unit",
  },
  "Division Chief": {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    displayName: "Division Chief",
    sidebarLabel: "Division Chief",
  },
  "Section Chief": {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    displayName: "Section Chief",
    sidebarLabel: "Section Chief",
  },
  "Unit Head": {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    displayName: "Unit Head",
    sidebarLabel: "Unit Head",
  },
  "Monitoring Personnel": {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    displayName: "Monitoring Personnel",
    sidebarLabel: "Monitoring Personnel",
  },
  public: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    displayName: "Public User",
    sidebarLabel: "Inspections",
  },
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    displayName: "Administrator",
    sidebarLabel: "Administrator",
  },
};

// Custom hook for user profile management
const useUserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLevel, setUserLevel] = useState("public");
  const [userProfile, setUserProfile] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserProfile = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      let profile = null;

      // Try to get profile from API
      try {
        profile = await getProfile();
      } catch (apiError) {
        console.warn("API profile fetch failed:", apiError);
        // Don't immediately throw, try fallback first
      }

      if (profile) {
        setUserProfile(profile);
        const level = normalizeUserLevel(profile);
        setUserLevel(level);

        // Store in localStorage for fallback
        if (!skipCache) {
          try {
            localStorage.setItem("userLevel", level);
            localStorage.setItem("userProfile", JSON.stringify(profile));
            localStorage.setItem("profileTimestamp", Date.now().toString());
          } catch (storageError) {
            console.warn("Failed to cache profile:", storageError);
          }
        }
      } else {
        // Use fallback data
        const fallbackData = getFallbackUserData();
        if (fallbackData.level) {
          setUserLevel(fallbackData.level);
          setUserProfile(fallbackData.profile);
          setError("Using cached profile data");
        } else {
          throw new Error("No profile data available");
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load user profile. Using guest access.");

      // Set safe defaults
      setUserLevel("public");
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const normalizeUserLevel = (profile) => {
    if (!profile) return "public";

    // Try multiple possible field names for user level
    const level =
      profile.userlevel ||
      profile.role ||
      profile.userLevel ||
      profile.user_level ||
      profile.level;

    // Validate against known roles
    if (level && ROLE_CONFIG[level]) {
      return level;
    }

    // Try to map common variations
    const levelStr = String(level || "").toLowerCase();
    const mappings = {
      legal: "Legal Unit",
      division: "Division Chief",
      section: "Section Chief",
      unit: "Unit Head",
      monitor: "Monitoring Personnel",
      monitoring: "Monitoring Personnel",
      admin: "admin",
      administrator: "admin",
    };

    for (const [key, value] of Object.entries(mappings)) {
      if (levelStr.includes(key)) {
        return value;
      }
    }

    return "public";
  };

  const getFallbackUserData = () => {
    try {
      const storedLevel = localStorage.getItem("userLevel");
      const storedProfile = localStorage.getItem("userProfile");
      const timestamp = localStorage.getItem("profileTimestamp");

      // Check if cached data is not too old (24 hours)
      const isStale =
        timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000;

      if (!isStale && storedLevel && storedProfile) {
        return {
          level: storedLevel,
          profile: JSON.parse(storedProfile),
        };
      }
    } catch (e) {
      console.warn("Failed to read cached profile:", e);
    }

    return {
      level: "public",
      profile: null,
    };
  };

  const retry = () => {
    setRetryCount((prev) => prev + 1);
    fetchUserProfile(true);
  };

  return {
    loading,
    error,
    userLevel,
    userProfile,
    fetchUserProfile,
    retry,
    retryCount,
  };
};

// Loading component with better accessibility
const LoadingState = ({ message = "Loading inspections..." }) => (
  <div
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-8 h-8 border-b-2 rounded-full animate-spin border-sky-600"
        aria-hidden="true"
      ></div>
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
);

// Enhanced error component
const ErrorState = ({ message, onRetry, retryCount = 0 }) => (
  <div
    className="flex flex-col items-center justify-center min-h-screen gap-4"
    role="alert"
  >
    <div className="flex items-center gap-2 text-lg text-red-600">
      <span aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </div>
    {onRetry && (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={retryCount > 3}
        >
          {retryCount > 3
            ? "Max retries reached"
            : `Try Again ${retryCount > 0 ? `(${retryCount})` : ""}`}
        </button>
        {retryCount > 2 && (
          <p className="text-sm text-gray-600">
            Having trouble? Try refreshing the page.
          </p>
        )}
      </div>
    )}
  </div>
);

export default function Inspections() {
  const {
    loading,
    error,
    userLevel,
    userProfile,
    fetchUserProfile,
    retry,
    retryCount,
  } = useUserProfile();

  // Initialize profile fetch on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Get role configuration with fallback
  const roleConfig = useMemo(
    () => ROLE_CONFIG[userLevel] || ROLE_CONFIG.public,
    [userLevel]
  );

  const handleRetry = () => {
    retry();
  };

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading user profile..." />;
  }

  // Show error only if we have no user level (complete failure)
  if (error && !userLevel) {
    return (
      <ErrorState
        message={error}
        onRetry={handleRetry}
        retryCount={retryCount}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header userLevel={userLevel} userProfile={userProfile} />

      <main className="flex-1">
        <LayoutWithSidebar
          userLevel={userLevel}
          sidebarLabel={roleConfig.sidebarLabel}
          userProfile={userProfile}
        >
          {error && (
            <div
              className="p-4 mb-4 border border-yellow-200 rounded bg-yellow-50"
              role="alert"
            >
              <div className="flex items-center justify-between">
                <div className="text-yellow-800">
                  <strong>Notice:</strong> {error}
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 text-sm bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                  type="button"
                >
                  Refresh Profile
                </button>
              </div>
            </div>
          )}

          <InspectionsCore
            canCreate={roleConfig.canCreate}
            canEdit={roleConfig.canEdit}
            canDelete={roleConfig.canDelete}
            userLevel={userLevel}
            userProfile={userProfile}
            permissions={roleConfig}
          />
        </LayoutWithSidebar>
      </main>

      <Footer />
    </div>
  );
}
