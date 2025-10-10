import React from "react";
import TabNavigation from "./TabNavigation";

/* ---------------------------
   Unified Inspection Header
   Combines: Main Header + Internal Header + Tab Navigation
   ---------------------------*/
export default function UnifiedInspectionHeader({
  // Internal Header props
  onSave,
  onDraft,
  onClose,
  onComplete,
  onSendToSection,
  onSendToDivision,
  onSendToNextLevel,
  onFinalize,
  onReview,
  onForwardToLegal,
  onSendNOV,
  onSendNOO,
  onSaveRecommendation,
  onMarkAsCompliant,
  lastSaveTime,
  autoSaveStatus = 'saved',
  showCompleteButton = false,
  showSendToSectionButton = false,
  showSendToDivisionButton = false,
  showSendToNextLevelButton = false,
  nextLevelName = 'Next Level',
  showFinalizeButton = false,
  showReviewButton = false,
  showForwardToLegalButton = false,
  showSendNOVButton = false,
  showSendNOOButton = false,
  showSaveRecommendationButton = false,
  showMarkAsCompliantButton = false,
  showDraftButton = false,
  showSubmitButton = false,
  showSubmitForReviewButton = false,
  showCloseButton = false,
  isDraft = false,
  complianceStatus = null,
  
  // Tab Navigation props
  activeSection,
  onTabClick
}) {
  return (
    <div className="bg-white shadow-lg">
      {/* Internal Header Section */}
      <header className="flex items-center justify-between w-full px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-sky-700">Inspection Form</div>
          
          {/* Compliance Status Badge */}
          {complianceStatus && (
            <div className={`px-3 py-1 text-sm font-semibold rounded-full ${
              complianceStatus === 'COMPLIANT' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {complianceStatus === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Draft Status */}
          {isDraft && (
            <div className="text-sm text-yellow-600 flex items-center gap-1">
              📝 Draft
            </div>
          )}
          
          {/* Auto-Save Status */}
          <div className="flex items-center gap-2">
            <div className={`text-sm flex items-center gap-1 ${
              autoSaveStatus === 'saving' ? 'text-blue-600' :
              autoSaveStatus === 'saved' ? 'text-green-600' :
              autoSaveStatus === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <span>✅</span>
                  <span>Saved</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <span>❌</span>
                  <span>Save failed</span>
                </>
              )}
            </div>
            
            {/* Last Save Time */}
            <div className="text-sm text-gray-600">
              {lastSaveTime
                ? `Last saved: ${new Date(lastSaveTime).toLocaleString()}`
                : "Not saved yet"}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showCloseButton && (
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close Form
              </button>
            )}
            
            {showDraftButton && (
              <button
                onClick={onDraft}
                className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                Draft
              </button>
            )}
            
            {showSubmitButton && (
              <button
                onClick={onSave}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Submit
              </button>
            )}
            
            {showSubmitForReviewButton && (
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Submit for Review
              </button>
            )}
            
            {showCompleteButton && (
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Submit for Review
              </button>
            )}
            
            {showSendToSectionButton && (
              <button
                onClick={onSendToSection}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Send to Section
              </button>
            )}
            
            {showSendToDivisionButton && (
              <button
                onClick={onSendToDivision}
                className="px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                Send to Division
              </button>
            )}
            
            {showReviewButton && (
              <button
                onClick={onReview}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Review Form
              </button>
            )}
            
            {showSendToNextLevelButton && (
              <button
                onClick={onSendToNextLevel}
                className="px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                Send to {nextLevelName}
              </button>
            )}
            
            {showForwardToLegalButton && (
              <button
                onClick={onForwardToLegal}
                className="px-3 py-1 text-sm text-white bg-orange-600 rounded hover:bg-orange-700"
              >
                Send to Legal
              </button>
            )}
            
            {showFinalizeButton && (
              <button
                onClick={onFinalize}
                className="px-3 py-1 text-sm text-white bg-gray-800 rounded hover:bg-gray-900"
              >
                Close Form
              </button>
            )}
            
            {showSendNOVButton && (
              <button
                onClick={onSendNOV}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Send NOV
              </button>
            )}
            
            {showSendNOOButton && (
              <button
                onClick={onSendNOO}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Send NOO
              </button>
            )}
            
            {showSaveRecommendationButton && (
              <button
                onClick={onSaveRecommendation}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Save Recommendation
              </button>
            )}
            
            {showMarkAsCompliantButton && (
              <button
                onClick={onMarkAsCompliant}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Compliant
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'general', label: 'General Information' },
              { id: 'purpose', label: 'Purpose of Inspection' },
              { id: 'compliance-status', label: 'Compliance Status' },
              { id: 'summary-compliance', label: 'Summary of Compliance' },
              { id: 'findings', label: 'Summary of Findings and Observations' },
              { id: 'recommendations', label: 'Recommendations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`
                  relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200
                  ${activeSection === tab.id
                    ? 'text-sky-700 border-b-2 border-sky-700 bg-sky-50'
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {activeSection === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-700" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
