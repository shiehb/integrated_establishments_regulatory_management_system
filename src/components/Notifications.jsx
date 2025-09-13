// components/Notifications.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, UserPlus, X, CheckCircle, Trash2, Building } from "lucide-react";
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
  const [hoveredNotification, setHoveredNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const notificationsData = await getNotifications();
      setNotifications(notificationsData);

      // Count unread notifications
      const unread = notificationsData.filter((notif) => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch only unread count (for polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const countData = await getUnreadNotificationsCount();
      setUnreadCount(countData.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Set up polling to check for new unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Reset auto-close timer on hover or interaction
  const resetAutoClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  }, []);

  // Handle clicks outside the dropdown
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Check if the click is not on the bell icon
      const bellButton = event.target.closest("button");
      if (!bellButton || !bellButton.contains(event.target)) {
        setIsOpen(false);
      }
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      resetAutoClose();
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
      resetAutoClose();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      resetAutoClose();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_user":
        return <UserPlus size={16} className="text-blue-500" />;
      case "new_establishment":
        return <Building size={16} className="text-green-500" />;
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

      // Refresh notifications when dropdown opens
      fetchNotifications();
    }
  };

  const handleNotificationHover = (id) => {
    setHoveredNotification(id);
  };

  const handleNotificationLeave = () => {
    setHoveredNotification(null);
  };

  const closeSingleNotification = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 transition-colors bg-transparent rounded-lg hover:text-sky-600 hover:bg-gray-100"
        onClick={handleDropdownToggle}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-0 -right-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-1000 w-120"
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
                  disabled={isLoading}
                >
                  <CheckCircle size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-1 text-red-600 rounded hover:text-red-700 hover:bg-red-100"
                  title="Clear all notifications"
                  disabled={isLoading}
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
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-b-2 rounded-full animate-spin border-sky-600"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() =>
                    !notification.is_read && markAsRead(notification.id)
                  }
                  onMouseEnter={() => handleNotificationHover(notification.id)}
                  onMouseLeave={handleNotificationLeave}
                >
                  {/* Close button for individual notification */}
                  {hoveredNotification === notification.id && (
                    <button
                      className="absolute p-1 text-gray-400 transition-colors rounded-full top-2 right-2 hover:text-gray-600 hover:bg-gray-200"
                      onClick={(e) =>
                        closeSingleNotification(e, notification.id)
                      }
                      title="Mark as read"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1.5 flex-shrink-0"></div>
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
