import React, { useState } from 'react';
import { X, CheckCircle, FileText, Users } from 'lucide-react';

const ReviewModal = ({ open, inspection, onClose, onSubmit, userLevel }) => {
  const [reviewDecision, setReviewDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewDecision) return;

    setLoading(true);
    try {
      const data = {
        review_decision: reviewDecision,
        remarks: remarks.trim() || 'Review completed'
      };

      await onSubmit(inspection.id, data);
      onClose();
    } catch (error) {
      console.error('Error reviewing inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setReviewDecision('');
    setRemarks('');
    onClose();
  };

  const getReviewOptions = () => {
    switch (userLevel) {
      case 'Unit Head':
        return [
          { value: 'APPROVED', label: 'Approve', description: 'Approve and forward to Section Chief', color: 'green' },
          { value: 'REJECTED', label: 'Reject', description: 'Reject and return for revision', color: 'red' }
        ];
      case 'Section Chief':
        return [
          { value: 'APPROVED', label: 'Approve', description: 'Approve and forward to Division Chief', color: 'green' },
          { value: 'REJECTED', label: 'Reject', description: 'Reject and return for revision', color: 'red' }
        ];
      case 'Division Chief':
        return [
          { value: 'APPROVED', label: 'Approve', description: 'Approve and close compliant case', color: 'green' },
          { value: 'FORWARD_TO_LEGAL', label: 'Forward to Legal', description: 'Forward non-compliant case to Legal Unit', color: 'orange' }
        ];
      default:
        return [];
    }
  };

  const reviewOptions = getReviewOptions();

  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-yellow-600" />
            Review Inspection
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
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Inspection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Code:</span>
                  <span className="ml-2 font-medium">{inspection.code}</span>
                </div>
                <div>
                  <span className="text-gray-500">Law:</span>
                  <span className="ml-2 font-medium">{inspection.law}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Establishments:</span>
                  <span className="ml-2 font-medium">
                    {inspection.establishments_detail?.map(est => est.name).join(', ') || 'None'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">{inspection.simplified_status || inspection.current_status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Review Decision *
            </label>
            <div className="space-y-3">
              {reviewOptions.map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="reviewDecision"
                    value={option.value}
                    checked={reviewDecision === option.value}
                    onChange={(e) => setReviewDecision(e.target.value)}
                    className={`mt-1 mr-3 text-${option.color}-600 focus:ring-${option.color}-500`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 text-${option.color}-600`} />
                      <span className={`text-sm font-medium text-${option.color}-800`}>{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Review Remarks *
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Provide detailed review comments and recommendations..."
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
              disabled={!reviewDecision || !remarks.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Reviewing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
