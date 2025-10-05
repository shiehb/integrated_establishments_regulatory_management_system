import React, { useState } from 'react';
import { X, FileText, DollarSign, Calendar } from 'lucide-react';

const NOOModal = ({ open, inspection, onClose, onSubmit }) => {
  const [penaltyFees, setPenaltyFees] = useState('');
  const [violationBreakdown, setViolationBreakdown] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!penaltyFees.trim() || !violationBreakdown.trim()) return;

    setLoading(true);
    try {
      const data = {
        penalty_fees: penaltyFees.trim(),
        violation_breakdown: violationBreakdown.trim(),
        payment_deadline: paymentDeadline || null,
        remarks: remarks.trim() || 'Notice of Order sent'
      };

      await onSubmit(inspection.id, data);
      onClose();
    } catch (error) {
      console.error('Error sending NOO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setPenaltyFees('');
    setViolationBreakdown('');
    setPaymentDeadline('');
    setRemarks('');
    onClose();
  };

  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-red-600" />
            Send Notice of Order (NOO)
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
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Inspection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-600">Code:</span>
                  <span className="ml-2 font-medium text-red-800">{inspection.code}</span>
                </div>
                <div>
                  <span className="text-red-600">Law:</span>
                  <span className="ml-2 font-medium text-red-800">{inspection.law}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-red-600">Establishments:</span>
                  <span className="ml-2 font-medium text-red-800">
                    {inspection.establishments_detail?.map(est => est.name).join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="penaltyFees" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1 text-red-500" />
              Penalty Fees *
            </label>
            <input
              type="text"
              id="penaltyFees"
              value={penaltyFees}
              onChange={(e) => setPenaltyFees(e.target.value)}
              required
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="e.g., PHP 50,000.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the total penalty amount in Philippine Peso
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="violationBreakdown" className="block text-sm font-medium text-gray-700 mb-2">
              Violation Breakdown *
            </label>
            <textarea
              id="violationBreakdown"
              value={violationBreakdown}
              onChange={(e) => setViolationBreakdown(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Provide a detailed breakdown of violations and corresponding penalties. Include specific regulation references and penalty amounts..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="paymentDeadline" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
              Payment Deadline *
            </label>
            <input
              type="date"
              id="paymentDeadline"
              value={paymentDeadline}
              onChange={(e) => setPaymentDeadline(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              The establishment must pay the penalty by this date
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
              placeholder="Any additional notes, payment instructions, or special conditions..."
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
              disabled={!penaltyFees.trim() || !violationBreakdown.trim() || !paymentDeadline || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending NOO...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Send Notice of Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NOOModal;