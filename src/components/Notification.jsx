// components/Notification.jsx
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export default function Notification({
  type = "success",
  message,
  onClose,
  duration = 10000,
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertCircle size={20} className="text-yellow-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      className={`fixed top-2 right-4 z-50 flex items-center p-4 border rounded-lg shadow-lg ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="ml-2 text-sm font-medium text-gray-800">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 bg-transparent hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}
