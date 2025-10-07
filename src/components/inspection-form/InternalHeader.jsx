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
  showCompleteButton = false,
  isDraft = false
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full px-6 py-2 bg-white border-b border-gray-200">
      <div className="text-xl font-bold text-sky-700">Inspection Form</div>
      <div className="flex items-center gap-4">
        {/* Draft Status */}
        {isDraft && (
          <div className="text-sm text-yellow-600 flex items-center gap-1">
            📝 Draft
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
