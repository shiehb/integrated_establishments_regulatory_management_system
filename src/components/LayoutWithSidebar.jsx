import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import InternalHeader from "./InternalHeader";
import { getProfile } from "../services/api"; // 🔥 API call

export default function LayoutWithSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        <Sidebar
          userLevel={profile?.userlevel || "public"}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex flex-col flex-1 transition-all duration-300">
          <InternalHeader
            userLevel={profile?.userlevel || "public"}
            userName={
              profile ? `${profile.first_name} ${profile.last_name}` : "Guest"
            }
          />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
