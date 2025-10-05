import React from "react";

/* ---------------------------
   Internal Header
   ---------------------------*/
export default function InternalHeader({ onSave, onClose, lastSaveTime, isOnline }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full px-6 py-2 bg-white border-b border-gray-200">
      <div className="text-xl font-bold text-sky-700">Inspection Form</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {isOnline ? "Online" : "Offline"}
        </div>
        <div className="text-sm text-gray-600">
          {lastSaveTime
            ? `Saved: ${new Date(lastSaveTime).toLocaleString()}`
            : ""}
        </div>
        <button
          onClick={onClose}
          className="px-2 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close Form
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          Save
        </button>
      </div>
    </header>
  );
}
