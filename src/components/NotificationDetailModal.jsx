import { X, User, Building, Bell, Calendar, UserCheck, Mail } from "lucide-react";

export default function NotificationDetailModal({ 
  notification, 
  isOpen, 
  onClose 
}) {
  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_user":
        return <User size={24} className="text-blue-500" />;
      case "new_establishment":
        return <Building size={24} className="text-green-500" />;
      case "password_reset":
        return <UserCheck size={24} className="text-orange-500" />;
      default:
        return <Bell size={24} className="text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "new_user":
        return "New User Registration";
      case "new_establishment":
        return "New Establishment Created";
      case "password_reset":
        return "Password Reset Request";
      default:
        return "Notification";
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "new_user":
        return "bg-blue-50 border-blue-200";
      case "new_establishment":
        return "bg-green-50 border-green-200";
      case "password_reset":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getRelativeTime = (dateString) => {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Landscape Rectangle */}
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getNotificationTypeColor(notification.notification_type)}`}>
              {getNotificationIcon(notification.notification_type)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Details
              </h2>
              <p className="text-sm text-gray-500">
                {getNotificationTypeLabel(notification.notification_type)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Landscape Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  notification.is_read 
                    ? "bg-green-100 text-green-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {notification.is_read ? "Read" : "Unread"}
                </span>
                <span className="text-sm text-gray-500">
                  {getRelativeTime(notification.created_at)}
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">
                    {notification.title}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <div className="p-3 bg-gray-50 rounded-lg min-h-[120px]">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              {/* Notification ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification ID
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Bell size={16} className="text-gray-400" />
                  <span className="text-sm font-mono text-gray-600">
                    #{notification.id}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created Date
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatFullDate(notification.created_at)}
                  </span>
                </div>
              </div>

              {/* Recipient Info */}
              {notification.recipient && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.recipient.first_name} {notification.recipient.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.recipient.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sender Info */}
              {notification.sender && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.sender.first_name} {notification.sender.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.sender.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
