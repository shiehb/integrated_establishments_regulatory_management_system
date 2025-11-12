import React from "react";

export default function ConfirmationDialog({
  open,
  title,
  message,
  loading = false,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "sky", // Added flexibility for different action types
  size = "sm", // sm, md, lg
  icon = null, // Optional icon component
  headerColor = null, // Optional header color (blue, orange, green, etc.)
  children = null,
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const colorClasses = {
    sky: "bg-sky-600 hover:bg-sky-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-green-600 hover:bg-green-700",
    amber: "bg-amber-600 hover:bg-amber-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  const headerColorClasses = {
    blue: "bg-blue-50 border-b border-blue-200",
    orange: "bg-orange-50 border-b border-orange-200",
    green: "bg-green-50 border-b border-green-200",
    sky: "bg-sky-50 border-b border-sky-200",
    indigo: "bg-indigo-50 border-b border-indigo-200",
    purple: "bg-purple-50 border-b border-purple-200",
    red: "bg-red-50 border-b border-red-200",
    amber: "bg-amber-50 border-b border-amber-200",
  };

  // Check if message is a React element, string, or function
  const renderMessage = () => {
    if (typeof message === "string") {
      return <p className="mb-4 text-gray-600">{message}</p>;
    } else if (typeof message === "function") {
      return <div className="mb-4 text-gray-600">{message()}</div>;
    } else {
      return <div className="mb-4 text-gray-600">{message}</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl mx-4 overflow-hidden`}
      >
        {/* Header Section */}
        {headerColor && (
          <div className={`px-6 py-4 ${headerColorClasses[headerColor]}`}>
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-6">
          {!headerColor && (
            <div className="flex items-center gap-3 mb-4">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
          )}
          {renderMessage()}
          {children && <div className="mt-4">{children}</div>}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center justify-center min-w-[100px] font-medium ${colorClasses[confirmColor]} disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple spinner component
function Spinner({ size = "sm" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-white ${sizeClasses[size]}`}
    ></div>
  );
}
