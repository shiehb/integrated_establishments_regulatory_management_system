import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorMessage({ 
  title = 'Error', 
  message, 
  onClose, 
  actionText, 
  onAction 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onAction && actionText && (
            <div className="mt-3">
              <button
                onClick={onAction}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                {actionText}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-red-100 rounded"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}
