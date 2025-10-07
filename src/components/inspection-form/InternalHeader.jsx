import React from "react";

/* ---------------------------
   Internal Header
   ---------------------------*/
export default function InternalHeader({
  onSave,
  onDraft,
  onClose,
  onComplete,
  onSendToSection,
  onSendToDivision,
  onFinalize,
  lastSaveTime,
  showCompleteButton = false,
  showSendToSectionButton = false,
  showSendToDivisionButton = false,
  showFinalizeButton = false,
  showDraftButton = false,
  showSubmitButton = false,
  showSubmitForReviewButton = false,
  showCloseButton = false,
  isDraft = false,
  currentUser = null,
  inspectionStatus = null
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
        {/* Action Buttons - Conditional Rendering Based on Status and User Role */}
        
        {/* Close Form Button - Always visible except in review statuses */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close Form
          </button>
        )}
        
        {/* Draft Button - Only visible for CREATED or DRAFT status */}
        {showDraftButton && (
          <button
            onClick={onDraft}
            className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
          >
            Draft
          </button>
        )}
        
        {/* Submit Button - Only visible for CREATED or DRAFT status */}
        {showSubmitButton && (
          <button
            onClick={onSave}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Submit
          </button>
        )}
        
        {/* Submit for Review Button - For Section Chief in SECTION_IN_PROGRESS and Unit Head in UNIT_IN_PROGRESS */}
        {showSubmitForReviewButton && (
          <button
            onClick={onComplete}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Submit for Review
          </button>
        )}
        
        {/* Submit for Review Button - Only for Monitoring Personnel in MONITORING_IN_PROGRESS */}
        {showCompleteButton && (
          <button
            onClick={onComplete}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Submit for Review
          </button>
        )}
        
        {/* Send to Section Button - Only for Unit Head in UNIT_REVIEWED */}
        {showSendToSectionButton && (
          <button
            onClick={onSendToSection}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Send to Section
          </button>
        )}
        
        {/* Send to Division Button - Only for Section Chief in SECTION_REVIEWED */}
        {showSendToDivisionButton && (
          <button
            onClick={onSendToDivision}
            className="px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
          >
            Send to Division
          </button>
        )}
        
        {/* Finalize Button - Only for Division Chief in DIVISION_REVIEWED */}
        {showFinalizeButton && (
          <button
            onClick={onFinalize}
            className="px-3 py-1 text-sm text-white bg-gray-800 rounded hover:bg-gray-900"
          >
            Close Form
          </button>
        )}
      </div>
    </header>
  );
}
