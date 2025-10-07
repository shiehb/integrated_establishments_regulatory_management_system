// LayoutWithSidebar.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import InternalHeader from "./InternalHeader";
import Footer from "./Footer";
import { getProfile } from "../services/api";

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

export default function LayoutWithSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [profile, setProfile] = useState(() => {
    return getCache("profile"); // ⏳ get cached profile with expiry
  });

  // ✅ Save sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // ✅ Fetch profile if not cached or expired
  useEffect(() => {
    if (!profile) {
      getProfile()
        .then((data) => {
          setProfile(data);
          setCache("profile", data, 10); // ⏳ cache for 10 minutes
        })
        .catch(() => setProfile(null));
    }
  }, [profile]);

  return (
    <div className="h-full flex">
      <Sidebar
        userLevel={profile?.userlevel || "public"}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        <InternalHeader
          userLevel={profile?.userlevel || "public"}
          userName={
            profile ? `${profile.first_name} ${profile.last_name}` : "Guest"
          }
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 pb-0">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
