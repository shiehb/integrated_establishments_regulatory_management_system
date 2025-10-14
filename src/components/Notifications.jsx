// components/Notifications.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, UserPlus, X, CheckCircle, Trash2, Building } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteAllNotifications,
  deleteNotification, // ADD THIS IMPORT
} from "../services/api";
import NotificationDetailModal from "./NotificationDetailModal";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNotification, setHoveredNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const notificationsData = await getNotifications();
      
      // Handle both array and object responses
      const notifArray = Array.isArray(notificationsData) 
        ? notificationsData 
        : (notificationsData.results || []);
      
      setNotifications(notifArray);

      // Count unread notifications
      const unread = notifArray.filter((notif) => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
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

  // Handle clicks outside the dropdown
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      const bellButton = event.target.closest("button");
      if (!bellButton || !bellButton.contains(event.target)) {
        setIsOpen(false);
      }
    }
  }, []);

  // Reset auto-close timer on hover or interaction
  const resetAutoClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
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
  }, [fetchNotifications, fetchUnreadCount, handleClickOutside]);

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

  // ADD THIS FUNCTION
  const deleteSingleNotification = async (id, e) => {
    e.stopPropagation(); // Prevent marking as read
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif.id !== id));
      // If the deleted notification was unread, update count
      const deletedNotif = notifications.find((notif) => notif.id === id);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      resetAutoClose();
    } catch (error) {
      console.error("Error deleting notification:", error);
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

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (newIsOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 3000);

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

  // Handle notification click to open modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
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
        className="relative p-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:text-sky-600 hover:bg-gray-200"
        onClick={handleDropdownToggle}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 " />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-0 -right-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-1000 w-96"
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

          <div className="overflow-y-auto max-h-80 scrollbar-thin notification-list">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    notification.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => handleNotificationHover(notification.id)}
                  onMouseLeave={handleNotificationLeave}
                >
                  {hoveredNotification === notification.id && (
                    <div className="absolute flex space-x-1 top-3 right-3">
                      <button
                        className="p-1.5 text-gray-400 transition-all duration-200 rounded-full hover:text-green-600 hover:bg-green-100 shadow-sm"
                        onClick={(e) =>
                          closeSingleNotification(e, notification.id)
                        }
                        title="Mark as read"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 transition-all duration-200 rounded-full hover:text-red-600 hover:bg-red-100 shadow-sm"
                        onClick={(e) =>
                          deleteSingleNotification(notification.id, e)
                        }
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-start">
                    {/* Icon with blue dot if unread */}
                    <div className="mr-2 mt-0.5 flex-shrink-0 relative">
                      {getNotificationIcon(notification.notification_type)}
                      {!notification.is_read && (
                        <div className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-gray-400 font-medium">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
