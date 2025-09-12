// components/Notifications.jsx
import { useEffect, useState, useRef } from "react";
import { Bell, UserPlus, X, CheckCircle, Trash2 } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteAllNotifications,
} from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Reset auto-close timer on hover or interaction
  const resetAutoClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  };

  // Handle clicks outside the dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Check if the click is not on the bell icon
      const bellButton = event.target.closest("button");
      if (!bellButton || !bellButton.contains(event.target)) {
        setIsOpen(false);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsData = await getNotifications();
      setNotifications(notificationsData);

      // Count unread notifications
      const unread = notificationsData.filter((notif) => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => prev - 1);
      resetAutoClose(); // Reset auto-close timer on interaction
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      resetAutoClose(); // Reset auto-close timer on interaction
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      resetAutoClose(); // Reset auto-close timer on interaction
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_user":
        return <UserPlus size={16} className="text-blue-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const handleDropdownToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set new timeout if opening
    if (newIsOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 transition-colors bg-transparent rounded-lg hover:text-sky-600 hover:bg-gray-100"
        onClick={handleDropdownToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-0 -right-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80"
          onMouseEnter={resetAutoClose}
          onMouseMove={resetAutoClose}
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 rounded text-sky-600 hover:text-sky-700 hover:bg-sky-100"
                  title="Mark all as read"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-1 text-red-600 rounded hover:text-red-700 hover:bg-red-100"
                  title="Clear all notifications"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 rounded hover:text-gray-700 hover:bg-gray-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() =>
                    !notification.is_read && markAsRead(notification.id)
                  }
                >
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1.5"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
