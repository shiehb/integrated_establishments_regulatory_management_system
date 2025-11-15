import React, { useState, useEffect, useCallback } from 'react';
import { X, Mail, Calendar, FileText, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import LayoutForm from '../LayoutForm';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Layout presets guide:
// - Two Column Grid: Inspection & recipient details span the top row; violations fill bottom-left; remaining sections stack bottom-right.
// - Stacked Sections: Single scroll column with email preview positioned beneath (mobile-first).
// - Preview Focused: Form narrows to 60% width, dedicating more space to the email preview pane.

const NOVModal = ({ open, onClose, onSubmit, onConfirm, inspection, loading }) => {
  // Support both onSubmit and onConfirm for backward compatibility
  const handleSubmitProp = onSubmit || onConfirm;
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    contactPerson: '',
    violations: '',
    complianceInstructions: '',
    complianceDeadline: '',
    remarks: '',
    complianceStatus: null
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const formatLegacyViolations = useCallback((rawViolations) => {
    if (!rawViolations) return '';

    const hasLegacyMarkers = rawViolations.includes('•') || rawViolations.includes(',');
    if (!hasLegacyMarkers) {
      return rawViolations.trim();
    }

    const tokens = rawViolations
      .split(',')
      .map(token => token.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      return rawViolations.trim();
    }

    const grouped = [];
    let currentGroup = null;

    tokens.forEach((token) => {
      const isBullet = token.startsWith('•');
      const sanitized = token.replace(/^•\s*/, '').replace(/[;]+$/, '');

      if (!isBullet) {
        const law = sanitized.replace(/[:]+$/, '').trim();
        if (!law) return;
        currentGroup = {
          law,
          items: []
        };
        grouped.push(currentGroup);
      } else {
        if (!currentGroup) {
          currentGroup = {
            law: 'Violations',
            items: []
          };
          grouped.push(currentGroup);
        }
        if (sanitized) {
          currentGroup.items.push(sanitized);
        }
      }
    });

    const formatted = [];
    let lawCounter = 1;

    grouped.forEach(({ law, items }) => {
      if (!law) return;
      formatted.push(`${lawCounter}. ${law}:`);

      if (items.length > 0) {
        items.forEach((item, index) => {
          formatted.push(`   ${lawCounter}.${index + 1} ${item}`);
        });
      } else {
        formatted.push(`   ${lawCounter}.1 No specific violations recorded`);
      }

      formatted.push('');
      lawCounter += 1;
    });

    return formatted.join('\n').trim();
  }, []);

  useEffect(() => {
    if (open && inspection) {
      const establishment = inspection.establishments_detail?.[0];
      
      // Get email with priority order
      const recipientEmail = inspection?.form?.checklist?.general?.email_address || 
                            establishment?.contact_email || 
                            establishment?.email || '';
      
      // Get compliance status from inspection form
      const complianceStatus = inspection?.form?.checklist?.compliance_status;
      
      // Get violations found from inspection form - check direct field first
      const violationsFound = inspection?.form?.violations_found ||
                             inspection?.form?.checklist?.general?.violations_found ||
                             inspection?.form?.checklist?.compliance_status?.violations_found ||
                             inspection?.form?.checklist?.findings?.violations_found ||
                             inspection?.form?.checklist?.summary_compliance?.violations_found ||
                             '';
      
      // Get contact person from inspection form
      const contactPerson = inspection?.form?.checklist?.general?.interviewed_person ||
                           inspection?.form?.checklist?.general?.managing_head ||
                           establishment?.contact_person ||
                           '';
      
      const formattedViolations = formatLegacyViolations(violationsFound);

      setFormData(prev => ({
        ...prev,
        recipientEmail,
        recipientName: establishment?.name || '',
        contactPerson, // Auto-populate contact person
        violations: formattedViolations || violationsFound, // Auto-populate violations field
        complianceStatus,
        complianceDeadline: getDefaultDeadline(30) // 30 days from now
      }));
    }
  }, [open, inspection, formatLegacyViolations]);

  const getDefaultDeadline = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const formatInspectionDate = () => {
    const dateStr = inspection?.form?.checklist?.general?.inspection_date_time;
    if (!dateStr) return '[date of inspection]';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDeadline = () => {
    if (!formData.complianceDeadline) return '[Deadline]';
    return new Date(formData.complianceDeadline).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const emailSubject = `Notice of Violation – ${inspection?.code || '[Reference No.]'}`;
  const emailBody = `Dear ${formData.recipientName || '[Name of Owner/Manager]'},

Good day.

This is to formally notify you that during the recent inspection conducted on ${formatInspectionDate()} at ${formData.recipientName}, our team from the Department of Environment and Natural Resources – Environmental Management Bureau (DENR-EMB) has observed certain non-compliances with existing environmental regulations.

Based on the inspection report, your establishment was found to be in violation of the following:

${formData.violations || '• [Specify the violation/s]'}

In view of this, you are hereby directed to submit a written explanation and corresponding compliance plan within the specified deadline upon receipt of this notice. Failure to respond within the given period may result in further administrative or legal actions as provided under relevant environmental law or regulation.

Compliance Instructions:
${formData.complianceInstructions || '[Compliance actions required]'}

Compliance Deadline: ${formatDeadline()}

We encourage your immediate attention to this matter to ensure compliance with environmental standards and to avoid further penalties.

Should you have any questions or require clarification, you may contact our office during working hours.

Thank you for your prompt cooperation.

Sincerely,
Environmental Management Bureau – Region 1
Department of Environment and Natural Resources (DENR)

${formData.remarks ? `\nAdditional Remarks:\n${formData.remarks}` : ''}`;
  const emailPreview = `Subject: ${emailSubject}\n\n${emailBody}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Show confirmation dialog instead of directly calling onConfirm
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    // Validate required fields
    if (!formData.recipientEmail || !formData.recipientEmail.trim()) {
      alert('Recipient email is required');
      return;
    }
    if (!formData.violations || !formData.violations.trim()) {
      alert('Violations are required');
      return;
    }
    if (!formData.complianceInstructions || !formData.complianceInstructions.trim()) {
      alert('Compliance instructions are required');
      return;
    }
    if (!formData.complianceDeadline) {
      alert('Compliance deadline is required');
      return;
    }

    // Don't close dialog yet - keep it open to show loading state
    try {
      console.log('Sending NOV with data:', formData);
      
      // Format compliance_deadline as ISO datetime string (backend expects DateTimeField)
      const complianceDeadline = formData.complianceDeadline 
        ? new Date(formData.complianceDeadline + 'T23:59:59').toISOString()
        : null;
      
      // If onConfirm is used (InspectionReviewPage), send camelCase data
      // If onSubmit is used (Inspections page), send snake_case data
      let submitData;
      if (onConfirm && !onSubmit) {
        // Backward compatibility: send camelCase for handleNOVConfirm
        submitData = {
          recipientEmail: formData.recipientEmail.trim(),
          recipientName: formData.recipientName || '',
          contactPerson: formData.contactPerson || '',
          violations: formData.violations.trim(),
          complianceInstructions: formData.complianceInstructions.trim(),
          complianceDeadline: complianceDeadline,
          remarks: formData.remarks || '',
          emailSubject: emailSubject,
          emailBody: emailBody
        };
      } else {
        // New format: send snake_case for handleNOVSubmit
        submitData = {
          recipient_email: formData.recipientEmail.trim(),
          recipient_name: formData.recipientName || '',
          contact_person: formData.contactPerson || '',
          violations: formData.violations.trim(),
          compliance_instructions: formData.complianceInstructions.trim(),
          compliance_deadline: complianceDeadline,
          remarks: formData.remarks || '',
          email_subject: emailSubject,
          email_body: emailBody
        };
      }
      
      console.log('Submitting NOV data:', submitData);
      if (!handleSubmitProp) {
        throw new Error('onSubmit or onConfirm handler is required');
      }
      await handleSubmitProp(submitData);
      console.log('NOV submitted successfully');
      
      // Close dialog only on success
      setShowConfirm(false);
    } catch (error) {
      // Log error for debugging
      console.error('Error in handleConfirmSend:', error);
      // Re-throw error so parent component can handle it and show notification
      throw error;
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  // Close confirmation dialog when modal closes
  useEffect(() => {
    if (!open) {
      setShowConfirm(false);
    }
  }, [open]);

  // Header Component
  const novHeader = (
    <div className="bg-white border-b-2 border-gray-300 shadow-sm">
      <div className="px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-sky-700">
                Notice of Violation
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="nov-form"
              disabled={loading}
              className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
        </div>
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <>
    <div className="fixed inset-0 z-[9999]">
      <LayoutForm 
        headerHeight="small" 
        inspectionHeader={novHeader}
        fullWidth
      >
        <div className=" md:py-10 px-0 h-full">
          <div className="flex flex-col md:flex-row gap-6 h-full max-h-[calc(100vh-220px)] overflow-auto px-4 md:px-6">
            <form id="nov-form" onSubmit={handleSubmit} className="flex-1 h-full overflow-y-auto pr-2">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col space-y-6">
                  <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                        Inspection Details
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inspection Code</span>
                        <p className="text-sm font-bold text-gray-900 mt-1">{inspection?.code || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inspection Date</span>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatInspectionDate()}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Establishment</span>
                        <p className="text-sm font-bold text-gray-900 mt-1">{inspection?.establishments_detail?.[0]?.name || '—'}</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                        Recipient Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Recipient Email <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.recipientEmail}
                          onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                          className="mt-1 w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-700 px-3 py-2"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Contact Person <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className="mt-1 w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-700 px-3 py-2"
                          placeholder="Contact person name"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-6">
                    <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                          Violations Found
                        </h2>
                      </div>
                      <textarea
                        required
                        value={formData.violations}
                        onChange={(e) => setFormData({ ...formData, violations: e.target.value })}
                        className="min-h-[140px] w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner p-3 leading-relaxed text-sm text-gray-800 resize-y"
                        placeholder="• Violation 1&#10;• Violation 2&#10;• Violation 3"
                      />
                      <p className="text-sm text-gray-500 italic">
                        Tip: List each violation on a new line starting with • for better formatting.
                      </p>
                    </section>
                  </div>

                  <div className="flex flex-col space-y-6">
                    <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                          Compliance Instructions
                        </h2>
                      </div>
                      <textarea
                        required
                        value={formData.complianceInstructions}
                        onChange={(e) => setFormData({ ...formData, complianceInstructions: e.target.value })}
                        className="min-h-[120px] w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner p-3 leading-relaxed text-sm text-gray-800 resize-y"
                        placeholder="Required actions for compliance..."
                      />
                    </section>

                    <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                          Compliance Deadline
                        </h2>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Deadline <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.complianceDeadline}
                          onChange={(e) => setFormData({ ...formData, complianceDeadline: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-700 px-3 py-2"
                        />
                        <p className="text-sm text-gray-500 italic mt-1">
                          Default deadline is 30 days from today. Establishment must comply by this date.
                        </p>
                      </div>
                    </section>

                    <section className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                          Additional Remarks <span className="text-sm font-normal text-gray-500">(Optional)</span>
                        </h2>
                      </div>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="min-h-[120px] w-full rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner p-3 leading-relaxed text-sm text-gray-800 resize-y"
                        placeholder="Any additional notes or special instructions..."
                      />
                    </section>
                  </div>
                </div>
              </div>
            </form>

            <aside className="w-full md:w-[40%] h-full">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 md:border-l md:border-gray-200 md:pl-6 h-full flex flex-col overflow-hidden max-h-[calc(100vh-220px)]">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Email Preview</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-[600px] mx-auto">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-inner p-4">
                      <pre className="leading-relaxed text-sm text-gray-800 whitespace-pre-wrap font-sans">{emailPreview}</pre>
                    </div>
                    <p className="text-sm text-gray-500 italic mt-3">
                      Review the generated email carefully before sending to ensure accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </LayoutForm>
    </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Send Notice of Violation"
        icon={<Mail className="w-5 h-5 text-orange-600" />}
        headerColor="sky"
        message={
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">NOV Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Recipient:</span>
                  <span className="text-gray-900">{formData.recipientEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Compliance Deadline:</span>
                  <span className="text-gray-900">
                    {formData.complianceDeadline 
                      ? new Date(formData.complianceDeadline).toLocaleDateString()
                      : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Important</span>
              </div>
              <p className="text-sm text-orange-700">
                This will send the Notice of Violation to the establishment via email. The inspection status will be updated to "NOV Sent". Are you sure you want to proceed?
              </p>
            </div>
          </div>
        }
        confirmText="Send NOV"
        cancelText="Cancel"
        confirmColor="sky"
        size="md"
        loading={loading}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmSend}
      />
    </>
  );
};

export default NOVModal;