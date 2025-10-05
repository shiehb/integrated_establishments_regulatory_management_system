import React from "react";

/* ---------------------------
   Internal Header
   ---------------------------*/
export default function InternalHeader({ 
  onSave, 
  onDraft, 
  onClose, 
  onComplete, 
  lastSaveTime, 
  isOnline, 
  isSaving = false,
  saveError = null,
  hasDataChanged = false,
  showCompleteButton = false 
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full px-6 py-2 bg-white border-b border-gray-200">
      <div className="text-xl font-bold text-sky-700">Inspection Form</div>
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className={`text-sm ${isOnline ? "text-green-600" : "text-red-600"}`}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </div>
        
        {/* Auto-save Status */}
        {isSaving && (
          <div className="text-sm text-blue-600 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
        
        {/* Save Error */}
        {saveError && (
          <div className="text-sm text-red-600" title={saveError}>
            ⚠️ Save Error
          </div>
        )}
        
        {/* Data Changed Indicator */}
        {hasDataChanged && !isSaving && (
          <div className="text-sm text-orange-600">
            📝 Unsaved Changes
          </div>
        )}
        
        {/* Last Save Time */}
        <div className="text-sm text-gray-600">
          {lastSaveTime
            ? `Last saved: ${new Date(lastSaveTime).toLocaleString()}`
            : "Not saved yet"}
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close Form
        </button>
        <button
          onClick={onDraft}
          className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
        >
          Draft
        </button>
        {showCompleteButton ? (
          <button
            onClick={onComplete}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Submit and Complete
          </button>
        ) : (
          <button
            onClick={onSave}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
    </header>
  );
}
