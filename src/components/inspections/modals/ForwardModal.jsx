import React, { useState } from 'react';
import { X, ArrowRight, Users, Building } from 'lucide-react';

const ForwardModal = ({ open, inspection, onClose, onSubmit, userLevel }) => {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTarget) return;

    setLoading(true);
    try {
      await onSubmit(inspection.id, {
        target: selectedTarget,
        remarks: remarks.trim() || 'Forwarded to next level'
      });
      onClose();
    } catch (error) {
      console.error('Error forwarding inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getForwardOptions = () => {
    if (!inspection) return [];

    switch (userLevel) {
      case 'Section Chief':
        // Section Chief can forward to Unit Head (if exists) or directly to Monitoring
        if (['PD-1586', 'RA-8749', 'RA-9275'].includes(inspection.law)) {
          return [
            { value: 'unit', label: 'Unit Head', description: 'Forward to Unit Head for detailed inspection' },
            { value: 'monitoring', label: 'Monitoring Personnel', description: 'Forward directly to Monitoring Personnel' }
          ];
        } else {
          return [
            { value: 'monitoring', label: 'Monitoring Personnel', description: 'Forward to Monitoring Personnel' }
          ];
        }
        
      case 'Unit Head':
        // Unit Head always forwards to Monitoring
        return [
          { value: 'monitoring', label: 'Monitoring Personnel', description: 'Forward to Monitoring Personnel' }
        ];
        
      default:
        return [];
    }
  };

  const forwardOptions = getForwardOptions();

  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowRight className="w-5 h-5 mr-2 text-indigo-600" />
            Forward Inspection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Building className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Inspection Details</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-900">
                <strong>Code:</strong> {inspection.code}
              </p>
              <p className="text-sm text-gray-900">
                <strong>Law:</strong> {inspection.law}
              </p>
              <p className="text-sm text-gray-900">
                <strong>Establishments:</strong> {
                  inspection.establishments_detail?.map(est => est.name).join(', ') || 'None'
                }
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forward To
            </label>
            <div className="space-y-2">
              {forwardOptions.map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="target"
                    value={option.value}
                    checked={selectedTarget === option.value}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="mt-1 mr-3 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Add any additional notes or instructions..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTarget || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Forwarding...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Forward Inspection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForwardModal;