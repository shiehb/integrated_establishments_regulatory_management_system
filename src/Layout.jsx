// Layout.jsx
import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Notification from "./components/Notification";

export default function Layout() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, [addNotification]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <div className="fixed z-50 flex flex-col gap-2 top-4 right-4">
        {notifications.map((notif, index) => (
          <Notification
            key={notif.id}
            type={notif.type}
            message={notif.message}
            onClose={() => removeNotification(notif.id)}
            style={{ transform: `translateY(${index * 70}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
