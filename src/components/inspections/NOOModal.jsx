import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, DollarSign, Calendar, AlertTriangle, Plus, Trash2, ArrowLeft, Mail } from 'lucide-react';
import LayoutForm from '../LayoutForm';

const NOOModal = ({ open, onClose, onConfirm, inspection, loading }) => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    contactPerson: '',
    violationBreakdown: '',
    penaltyFees: '',
    paymentDeadline: '',
    paymentInstructions: '',
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
        violationBreakdown: formattedViolations || violationsFound, // Auto-populate violation breakdown
        penaltyFees: '15000', // Default payment amount (15,000) - editable by user
        complianceStatus,
        paymentDeadline: getDefaultDeadline(60) // 60 days from now
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
    onConfirm({
      ...formData,
      penaltyFees: formData.penaltyFees || 0
    });
  };

  if (!open) return null;

  const emailTemplate = `Subject: Notice of Order – ${inspection?.code || '[Reference No.]'}

Dear ${formData.recipientName || '[Name of Owner/Manager]'},

Good day.

This is to formally notify you that after the Notice of Violation (NOV) sent on [NOV Date], your establishment has failed to comply with the required corrective measures within the specified deadline.

Based on the inspection report and non-compliance with the NOV, you are hereby ordered to:

${formData.violationBreakdown || '[Violation breakdown]'}

PENALTY ASSESSMENT:
Total Penalty: ₱${Number(formData.penaltyFees || 0).toLocaleString()}

PAYMENT INSTRUCTIONS:
${formData.paymentInstructions || '[Payment instructions]'}

PAYMENT DEADLINE: ${formData.paymentDeadline ? new Date(formData.paymentDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Deadline]'}

Failure to pay the penalty within the specified period may result in further legal action and additional penalties.

Should you have any questions regarding this Notice of Order, you may contact our office during working hours.

Thank you for your immediate attention to this matter.

Sincerely,
Environmental Management Bureau – Region 1
Department of Environment and Natural Resources (DENR)

${formData.remarks ? `\nAdditional Remarks:\n${formData.remarks}` : ''}`;

  // Header Component
  const nooHeader = (
    <div className="bg-white border-b-2 border-gray-300 shadow-sm">
      <div className="px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 py-2
          ">
            <div>
              <h1 className="text-xl font-bold text-sky-700">
                Notice of Order
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
              form="noo-form"
              disabled={loading || !formData.penaltyFees}
              className="px-3 py-1 text-sm font-semibold text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Send NOO
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
        inspectionHeader={nooHeader}
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
          <form id="noo-form" onSubmit={handleSubmit}>
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
                <span className="text-xs font-medium text-gray-600">Current Status:</span>
                <p className="text-sm font-bold text-orange-600 mt-1">NOV Sent</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Action:</span>
                <p className="text-sm font-bold text-red-600 mt-1">Issue NOO</p>
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

            {/* Violation Breakdown Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Violation Breakdown</h2>
            </div>
            <textarea
              required
              value={formData.violationBreakdown}
              onChange={(e) => setFormData({ ...formData, violationBreakdown: e.target.value })}
              rows={4}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Detailed breakdown of violations and non-compliance..."
            />
          </section>

            {/* Penalty Assessment Section */}
            <section className="mb-4">
              <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
                <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                <h2 className="text-sm font-semibold text-gray-900">Penalty Assessment</h2>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Penalty Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.penaltyFees}
                  onChange={(e) => setFormData({ ...formData, penaltyFees: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              {formData.penaltyFees && (
                <div className="mt-2 bg-green-50 p-2 border border-green-200 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-green-800">Total Penalty:</span>
                    <span className="text-lg font-bold text-green-900">
                      ₱{Number(formData.penaltyFees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Payment Instructions Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <Mail className="w-4 h-4 text-blue-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Payment Instructions</h2>
            </div>
            <textarea
              required
              value={formData.paymentInstructions}
              onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Bank details, payment methods, office address, etc."
            />
          </section>

            {/* Payment Deadline Section */}
            <section className="mb-4">
            <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-orange-600 mr-1" />
              <h2 className="text-sm font-semibold text-gray-900">Payment Deadline</h2>
            </div>
            <input
              type="date"
              required
              value={formData.paymentDeadline}
              onChange={(e) => setFormData({ ...formData, paymentDeadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-600 bg-blue-50 p-1 rounded border border-blue-200">
              ⏰ Default: 60 days from today. Establishment must pay by this date.
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

export default NOOModal;