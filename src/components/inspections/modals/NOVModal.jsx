import React, { useState } from 'react';
import { X, FileText, AlertTriangle, Calendar } from 'lucide-react';

const NOVModal = ({ open, inspection, onClose, onSubmit }) => {
  const [violations, setViolations] = useState('');
  const [complianceInstructions, setComplianceInstructions] = useState('');
  const [complianceDeadline, setComplianceDeadline] = useState('');
  const [requiredOfficeVisit, setRequiredOfficeVisit] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!violations.trim()) return;

    setLoading(true);
    try {
      const data = {
        violations: violations.trim(),
        compliance_instructions: complianceInstructions.trim(),
        compliance_deadline: complianceDeadline || null,
        required_office_visit: requiredOfficeVisit,
        remarks: remarks.trim() || 'Notice of Violation sent'
      };

      await onSubmit(inspection.id, data);
      onClose();
    } catch (error) {
      console.error('Error sending NOV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setViolations('');
    setComplianceInstructions('');
    setComplianceDeadline('');
    setRequiredOfficeVisit(false);
    setRemarks('');
    onClose();
  };

  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-600" />
            Send Notice of Violation (NOV)
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="bg-orange-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Inspection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-600">Code:</span>
                  <span className="ml-2 font-medium text-orange-800">{inspection.code}</span>
                </div>
                <div>
                  <span className="text-orange-600">Law:</span>
                  <span className="ml-2 font-medium text-orange-800">{inspection.law}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-orange-600">Establishments:</span>
                  <span className="ml-2 font-medium text-orange-800">
                    {inspection.establishments_detail?.map(est => est.name).join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="violations" className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-red-500" />
              Violations Found *
            </label>
            <textarea
              id="violations"
              value={violations}
              onChange={(e) => setViolations(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="Detail the specific violations found during inspection. Be specific about which regulations were violated..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="complianceInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Instructions *
            </label>
            <textarea
              id="complianceInstructions"
              value={complianceInstructions}
              onChange={(e) => setComplianceInstructions(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Provide clear instructions on how the establishment can achieve compliance..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="complianceDeadline" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
              Compliance Deadline *
            </label>
            <input
              type="date"
              id="complianceDeadline"
              value={complianceDeadline}
              onChange={(e) => setComplianceDeadline(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              The establishment must achieve compliance by this date
            </p>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={requiredOfficeVisit}
                onChange={(e) => setRequiredOfficeVisit(e.target.checked)}
                className="mr-3 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Require Office Visit
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              Check this if the establishment needs to visit the office for additional documentation or clarification
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Any additional notes or special instructions..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!violations.trim() || !complianceInstructions.trim() || !complianceDeadline || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending NOV...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Send Notice of Violation
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