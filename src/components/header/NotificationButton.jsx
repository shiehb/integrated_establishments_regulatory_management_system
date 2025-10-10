// src/components/header/NotificationButton.jsx
import { useState } from "react";
import Notifications from "../Notifications";

export default function NotificationButton() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div title="Notifications" className="relative">
      <div onClick={() => setShowNotifications(!showNotifications)}>
        <Notifications
          unreadCount={unreadCount}
          showDropdown={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>
    </div>
  );
}
