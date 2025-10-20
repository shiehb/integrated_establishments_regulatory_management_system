import { useEffect } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { getUnreadNotificationsCount } from "../services/api";
import RoleBasedSearch from "./header/RoleBasedSearch";
import UserDropdown from "./header/UserDropdown";
import NotificationButton from "./header/NotificationButton";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
  onSidebarToggle,
  sidebarOpen = true,
}) {
  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        await getUnreadNotificationsCount();
      } catch (err) {
        console.error("Unread notifications fetch error:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-50 p-2 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Left Side - Toggle Button and Search */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Sidebar Toggle Button */}
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
          )}
          
          {/* Role-based Search */}
          <div className="flex-1 max-w-2xl">
            <RoleBasedSearch userLevel={userLevel} />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <NotificationButton />

          {/* User Dropdown */}
          <UserDropdown userLevel={userLevel} userName={userName} />
        </div>
      </div>
    </header>
  );
}
