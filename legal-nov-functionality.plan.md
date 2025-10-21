# Add NOV Functionality for Legal Unit

## Overview
Add functionality for Legal Unit to review inspections and send Notice of Violation (NOV) emails from the Legal Review tab. When NOV is sent, the inspection status transitions to `NOV_SENT`.

## Requirements

### For Legal Unit Users in Review Tab (status: LEGAL_REVIEW)

1. **Review Button**: Opens the inspection review page (read-only view)
2. **Send NOV Button**: Opens a modal to send Notice of Violation email
   - Modal includes email form with recipient, subject, message template
   - Automatically populates establishment email from inspection data
   - Includes fields for violation details and compliance deadline
   - Sends email and transitions status to `NOV_SENT`

## Current State

### Existing Implementation
- `sendNOV` API function exists in `src/services/api.js` (line 524)
- Backend endpoint `/api/inspections/{id}/send_nov/` exists (server/inspections/views.py:1958)
- NOVSerializer requires:
  - `violations` (string): Detailed list of violations
  - `compliance_instructions` (string): Required compliance actions
  - `compliance_deadline` (datetime): Deadline for compliance
  - `remarks` (string, optional): Additional remarks

### Data Available
- Inspection data includes:
  - `establishments_detail`: Array with establishment info including contact details
  - `form.checklist`: Complete inspection form data
  - `code`: Inspection reference number
  - Current violation/compliance data

## Solution

### 1. Update InspectionReviewPage for Legal Unit

**File**: `src/pages/InspectionReviewPage.jsx`

Add Legal Unit button logic after Division Chief section (around line 594):

```javascript
{/* Legal Unit buttons for LEGAL_REVIEW status */}
{!userLoading && currentUser?.userlevel === 'Legal Unit' && 
 inspectionData?.current_status === 'LEGAL_REVIEW' && (
  <>
    <button
      onClick={() => handleActionClick('send_nov')}
      className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
      disabled={loading}
    >
      <Mail className="w-4 h-4 mr-1" />
      Send NOV
    </button>
  </>
)}
```

### 2. Create NOV Modal Component

**File**: `src/components/inspections/NOVModal.jsx` (new file)

```javascript
import React, { useState, useEffect } from 'react';
import { X, Mail, Calendar, FileText } from 'lucide-react';

const NOVModal = ({ open, onClose, onConfirm, inspection, loading }) => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    violations: '',
    complianceInstructions: '',
    complianceDeadline: '',
    remarks: ''
  });

  useEffect(() => {
    if (open && inspection) {
      // Auto-populate establishment email from inspection data
      const establishment = inspection.establishments_detail?.[0];
      setFormData(prev => ({
        ...prev,
        recipientEmail: establishment?.contact_email || '',
        recipientName: establishment?.name || '',
        complianceDeadline: getDefaultDeadline(30) // 30 days from now
      }));
    }
  }, [open, inspection]);

  const getDefaultDeadline = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  if (!open) return null;

  const emailTemplate = `Subject: Notice of Violation – ${inspection?.code || '[Reference No.]'}

Dear ${formData.recipientName || '[Name of Owner/Manager]'},

Good day.

This is to formally notify you that during the recent inspection conducted on ${inspection?.form?.checklist?.general?.inspection_date_time ? new Date(inspection.form.checklist.general.inspection_date_time).toLocaleDateString() : '[date of inspection]'} at ${formData.recipientName}, our team from the Department of Environment and Natural Resources – Environmental Management Bureau (DENR-EMB) has observed certain non-compliances with existing environmental regulations.

Based on the inspection report, your establishment was found to be in violation of the following:

${formData.violations || '• [Specify the violation/s]'}

In view of this, you are hereby directed to submit a written explanation and corresponding compliance plan within the specified deadline upon receipt of this notice. Failure to respond within the given period may result in further administrative or legal actions as provided under relevant environmental law or regulation.

Compliance Instructions:
${formData.complianceInstructions || '[Compliance actions required]'}

Compliance Deadline: ${formData.complianceDeadline ? new Date(formData.complianceDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Deadline]'}

We encourage your immediate attention to this matter to ensure compliance with environmental standards and to avoid further penalties.

Should you have any questions or require clarification, you may contact our office during working hours.

Thank you for your prompt cooperation.

Sincerely,
Environmental Management Bureau – Region 1
Department of Environment and Natural Resources (DENR)

${formData.remarks ? `\nAdditional Remarks:\n${formData.remarks}` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-red-600" />
            Send Notice of Violation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Inspection Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Inspection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Code:</span>
                  <span className="ml-2 font-medium">{inspection?.code}</span>
                </div>
                <div>
                  <span className="text-gray-500">Establishment:</span>
                  <span className="ml-2 font-medium">{inspection?.establishments_detail?.[0]?.name}</span>
                </div>
              </div>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="email@example.com"
              />
            </div>

            {/* Violations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Violations Found <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.violations}
                onChange={(e) => setFormData({ ...formData, violations: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="• Violation 1&#10;• Violation 2&#10;• Violation 3"
              />
              <p className="mt-1 text-xs text-gray-500">List each violation on a new line, starting with •</p>
            </div>

            {/* Compliance Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.complianceInstructions}
                onChange={(e) => setFormData({ ...formData, complianceInstructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Required actions for compliance..."
              />
            </div>

            {/* Compliance Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.complianceDeadline}
                onChange={(e) => setFormData({ ...formData, complianceDeadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Remarks (Optional)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Email Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Email Preview
              </label>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{emailTemplate}</pre>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send NOV
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NOVModal;
```

### 3. Integrate NOV Modal in InspectionReviewPage

**File**: `src/pages/InspectionReviewPage.jsx`

Add state and handlers:

```javascript
// Add imports
import NOVModal from '../components/inspections/NOVModal';
import { sendNOV } from '../services/api';

// Add state (around line 33)
const [showNOVModal, setShowNOVModal] = useState(false);

// Update handleActionClick to handle send_nov
const handleActionClick = (type) => {
  if (type === 'send_nov') {
    setShowNOVModal(true);
  } else {
    setActionType(type);
    setShowConfirm(true);
  }
};

// Add NOV confirmation handler
const handleNOVConfirm = async (novData) => {
  try {
    setLoading(true);
    await sendNOV(id, {
      violations: novData.violations,
      compliance_instructions: novData.complianceInstructions,
      compliance_deadline: new Date(novData.complianceDeadline).toISOString(),
      remarks: novData.remarks || 'Notice of Violation sent'
    });
    
    notifications.success('Notice of Violation sent successfully!');
    setShowNOVModal(false);
    navigate('/inspections');
  } catch (error) {
    console.error('Error sending NOV:', error);
    notifications.error(
      error.response?.data?.error || error.response?.data?.message || 'Failed to send NOV'
    );
  } finally {
    setLoading(false);
  }
};

// Add modal component before closing tag (around line 1230)
<NOVModal
  open={showNOVModal}
  onClose={() => setShowNOVModal(false)}
  onConfirm={handleNOVConfirm}
  inspection={inspectionData}
  loading={loading}
/>
```

### 4. Update sendNOV API (if needed)

**File**: `src/services/api.js` (line 524)

The existing implementation should work, but verify it sends email notification:

```javascript
export const sendNOV = async (id, data = {}) => {
  try {
    const res = await api.post(`inspections/${id}/send_nov/`, data);
    return res.data;
  } catch (error) {
    const enhancedError = new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to send Notice of Violation. Please try again."
    );
    enhancedError.response = error.response;
    throw enhancedError;
  }
};
```

## Implementation Steps

1. **Create NOV Modal Component** (`src/components/inspections/NOVModal.jsx`)
2. **Update InspectionReviewPage** to add Legal Unit buttons and integrate NOV modal
3. **Test the workflow**:
   - Legal Unit logs in
   - Navigates to Review tab
   - Opens inspection with LEGAL_REVIEW status
   - Clicks "Send NOV" button
   - Fills out NOV form with violations and deadline
   - Sends NOV
   - Verifies status transitions to NOV_SENT
   - Verifies email is sent (check backend logs)

## Expected Outcome

- Legal Unit can view inspections in LEGAL_REVIEW status
- "Send NOV" button opens modal with email template
- Modal auto-populates establishment email and inspection details
- User can customize violations, compliance instructions, and deadline
- Email preview shows complete formatted message
- On confirmation, NOV is sent and status transitions to NOV_SENT
- Success notification confirms action completed

## Notes

- The email template follows the professional format provided
- Backend handles actual email sending (verify Django email settings)
- Modal includes all required fields per NOVSerializer
- Status transition happens automatically on successful NOV send

