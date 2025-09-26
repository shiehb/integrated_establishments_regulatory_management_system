// components/Notification.jsx
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export default function Notification({
  type = "success",
  message,
  onClose,
  duration = 10000,
  id, // Optional: for stacking multiple notifications
}) {
  // Validate type to prevent invalid props
  const validTypes = ["success", "error", "warning"];
  const safeType = validTypes.includes(type) ? type : "success";

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id); // Pass id if provided for multi-notification management
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertCircle size={20} className="text-amber-500" />, // Changed to amber for better contrast
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200", // Consistent with icon
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-amber-800",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed top-4 left-1/2 z-50 max-w-sm w-full -translate-x-1/2 flex items-start p-4 border rounded-lg shadow-lg 
        transition-all duration-300 ease-in-out transform 
        animate-slide-in-top ${bgColors[safeType]}
      `}
    >
      <div className="flex-shrink-0">{icons[safeType]}</div>
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${textColors[safeType]}`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => onClose?.(id)}
        className="ml-4 flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Close notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
