import React, { useState, useEffect, useCallback } from 'react';
import { X, Mail, Calendar, FileText, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import LayoutForm from '../LayoutForm';

const NOVModal = ({ open, onClose, onConfirm, inspection, loading }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  if (!open) return null;

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

  const emailTemplate = `Subject: Notice of Violation – ${inspection?.code || '[Reference No.]'}

Dear ${formData.recipientName || '[Name of Owner/Manager]'},

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

  return (
    <div className="fixed inset-0 z-[9999]">
      <LayoutForm 
        headerHeight="small" 
        inspectionHeader={novHeader}
        rightSidebar={
          <div className="mb-3">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <Mail className="w-4 h-4 text-blue-600 mr-1" />
              <h3 className="text-sm font-semibold text-gray-900">Email Preview</h3>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="bg-white border border-gray-200 p-2">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{emailTemplate}</pre>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-1 rounded border border-blue-200">
              📧 This is how the email will appear to the establishment. Review carefully before sending.
            </p>
          </div>
        }
      >
        <div className="px-6 py-4">
          <form id="nov-form" onSubmit={handleSubmit}>
            {/* Inspection Details Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Inspection Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs font-medium text-gray-600">Inspection Code:</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{inspection?.code}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Establishment:</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{inspection?.establishments_detail?.[0]?.name}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Inspection Date:</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{formatInspectionDate()}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Status:</span>
                <p className="text-sm font-bold text-orange-600 mt-1">Legal Review</p>
              </div>
            </div>
          </section>

            {/* Recipient Information Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <Mail className="w-4 h-4 text-blue-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Recipient Information</h2>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Recipient Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact person name"
              />
            </div>
          </section>

            {/* Violations Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Violations Found</h2>
            </div>
            <textarea
              required
              value={formData.violations}
              onChange={(e) => setFormData({ ...formData, violations: e.target.value })}
              rows={4}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="• Violation 1&#10;• Violation 2&#10;• Violation 3"
            />
            <p className="mt-1 text-xs text-gray-600 bg-yellow-50 p-1 rounded border border-yellow-200">
              💡 List each violation on a new line, starting with • for better formatting
            </p>
          </section>

            {/* Compliance Instructions Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Compliance Instructions</h2>
            </div>
            <textarea
              required
              value={formData.complianceInstructions}
              onChange={(e) => setFormData({ ...formData, complianceInstructions: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Required actions for compliance..."
            />
          </section>

            {/* Compliance Deadline Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-orange-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Compliance Deadline</h2>
            </div>
            <input
              type="date"
              required
              value={formData.complianceDeadline}
              onChange={(e) => setFormData({ ...formData, complianceDeadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-600 bg-blue-50 p-1 rounded border border-blue-200">
              ⏰ Default: 30 days from today. Establishment must comply by this date.
            </p>
          </section>

            {/* Additional Remarks Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <FileText className="w-4 h-4 text-gray-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Additional Remarks</h2>
              <span className="ml-1 text-xs text-gray-500">(Optional)</span>
            </div>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Any additional notes or special instructions..."
            />
            </section>
          </form>
        </div>
      </LayoutForm>
    </div>
  );
};

export default NOVModal;