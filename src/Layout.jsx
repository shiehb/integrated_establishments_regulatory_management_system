// Layout.jsx
import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Notification from "./components/Notification";

export default function Layout() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Make the notification function available globally
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, [addNotification]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          type={notif.type}
          message={notif.message}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
}
