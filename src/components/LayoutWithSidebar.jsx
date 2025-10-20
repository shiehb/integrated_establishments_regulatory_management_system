// LayoutWithSidebar.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import InternalHeader from "./InternalHeader";
import Footer from "./Footer";
import HelpModal from "./header/HelpModal";
import { useAuth } from "../contexts/AuthContext";

// Configuration constants
const SIDEBAR_STATE_KEY = "sidebarOpen";

export default function LayoutWithSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const { user: profile, loading: profileLoading, refreshProfile } = useAuth();
  const [profileError, setProfileError] = useState(null);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Listen for auth logout events
  useEffect(() => {
    const handleAuthLogout = () => {
      setProfileError(null);
    };

    window.addEventListener("authLogout", handleAuthLogout);
    
    return () => {
      window.removeEventListener("authLogout", handleAuthLogout);
    };
  }, []);

  // Keyboard shortcuts for Help Center (F1 or ?)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1 key
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpModalOpen(true);
      }
      // ? key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input field
        const activeElement = document.activeElement;
        const isInputField = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable
        );
        if (!isInputField) {
          e.preventDefault();
          setHelpModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
            onClick={async () => {
              try {
                await refreshProfile();
                setProfileError(null);
              } catch (error) {
                setProfileError(error);
              }
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
        onHelpClick={() => setHelpModalOpen(true)}
      />
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        <InternalHeader
          userLevel={userLevel}
          userName={userName}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div>
            {children}
          </div>
        </main>
      </div>
      
      {/* Help Modal */}
      <HelpModal 
        userLevel={userLevel} 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
      />
    </div>
  );
}
