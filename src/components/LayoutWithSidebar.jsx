import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import InternalHeader from "./InternalHeader";

export default function LayoutWithSidebar({
  children,
  userLevel = "public",
  userName = "Jericho Urbano",
}) {
  // Initialize state with value from localStorage or default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Save to localStorage whenever sidebarOpen changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        <Sidebar
          userLevel={userLevel}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300`}>
          <InternalHeader userLevel={userLevel} userName={userName} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
