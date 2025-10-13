import { useEffect, useState } from "react";
import { getUnreadNotificationsCount } from "../services/api";
import SearchBar from "./header/SearchBar";
import UserDropdown from "./header/UserDropdown";
import NotificationButton from "./header/NotificationButton";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
}) {
  const [unreadCount, setUnreadCount] = useState(0);


  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationsCount();
        setUnreadCount(data.count);
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
      <div className="flex items-center justify-between mx-4">
        {/* Search Bar */}
        <SearchBar />

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
