import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X, Bell } from 'lucide-react';

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  PASSWORD_CHANGE: 'password_change',
  LOGIN: 'login',
  SYSTEM: 'system'
};

// Notification manager class
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.nextId = 1;
  }

  // Add notification
  add(notification) {
    const id = this.nextId++;
    const newNotification = {
      id,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      title: notification.title || '',
      message: notification.message || '',
      duration: notification.duration || 5000,
      persistent: notification.persistent || false,
      actions: notification.actions || [],
      timestamp: new Date(),
      ...notification
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  // Remove notification
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods
  success(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }

  error(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }

  warning(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }

  info(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }

  passwordChange(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.PASSWORD_CHANGE,
      title: 'Password Change',
      message,
      duration: 6000,
      ...options
    });
  }

  login(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.LOGIN,
      title: 'Login',
      message,
      ...options
    });
  }

  system(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'System',
      message,
      ...options
    });
  }
}

// Global notification manager instance
const notificationManager = new NotificationManager();

// Professional notification component
function ProfessionalNotification({ notification, onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle size={20} className="text-green-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle size={20} className="text-red-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertCircle size={20} className="text-amber-500" />;
      case NOTIFICATION_TYPES.INFO:
        return <Info size={20} className="text-blue-500" />;
      case NOTIFICATION_TYPES.PASSWORD_CHANGE:
        return <CheckCircle size={20} className="text-purple-500" />;
      case NOTIFICATION_TYPES.LOGIN:
        return <Bell size={20} className="text-indigo-500" />;
      case NOTIFICATION_TYPES.SYSTEM:
        return <Info size={20} className="text-gray-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          title: 'text-green-900'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          title: 'text-red-900'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          title: 'text-amber-900'
        };
      case NOTIFICATION_TYPES.INFO:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          title: 'text-blue-900'
        };
      case NOTIFICATION_TYPES.PASSWORD_CHANGE:
        return {
          bg: 'bg-purple-50 border-purple-200',
          text: 'text-purple-800',
          title: 'text-purple-900'
        };
      case NOTIFICATION_TYPES.LOGIN:
        return {
          bg: 'bg-indigo-50 border-indigo-200',
          text: 'text-indigo-800',
          title: 'text-indigo-900'
        };
      case NOTIFICATION_TYPES.SYSTEM:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          title: 'text-gray-900'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          title: 'text-blue-900'
        };
    }
  };

  const styles = getStyles(notification.type);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        relative max-w-md w-full flex items-start p-4 border rounded-lg shadow-lg
        transition-all duration-300 ease-in-out transform
        animate-slide-in-right ${styles.bg}
      `}
    >
      <div className="flex-shrink-0">{getIcon(notification.type)}</div>
      <div className="ml-3 flex-1 min-w-0">
        {notification.title && (
          <p className={`text-sm font-semibold ${styles.title} mb-1`}>
            {notification.title}
          </p>
        )}
        <p className={`text-sm ${styles.text} break-words`}>
          {notification.message}
        </p>
        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-3 flex gap-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                  action.primary
                    ? 'bg-white text-gray-700 hover:bg-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="ml-4 flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Close notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// Notification container component
function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const handleClose = useCallback((id) => {
    notificationManager.remove(id);
  }, []);

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-h-screen overflow-y-auto">
      {notifications.map((notification) => (
        <ProfessionalNotification
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>,
    document.body
  );
}

// Hook for using notifications
export function useNotifications() {
  return {
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
    passwordChange: notificationManager.passwordChange.bind(notificationManager),
    login: notificationManager.login.bind(notificationManager),
    system: notificationManager.system.bind(notificationManager),
    add: notificationManager.add.bind(notificationManager),
    remove: notificationManager.remove.bind(notificationManager),
    clear: notificationManager.clear.bind(notificationManager)
  };
}

// Global notification functions for backward compatibility
export const showNotification = (type, message, options = {}) => {
  return notificationManager.add({ type, message, ...options });
};

// Export the notification manager and container
export { notificationManager, NotificationContainer, NOTIFICATION_TYPES };
export default NotificationContainer;
