import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const NOVModal = ({ isOpen, onClose, onSubmit, inspection, loading = false }) => {
  const [formData, setFormData] = useState({
    violations: '',
    compliance_instructions: '',
    compliance_deadline: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.violations.trim()) {
      newErrors.violations = 'Violations are required';
    }
    
    if (!formData.compliance_instructions.trim()) {
      newErrors.compliance_instructions = 'Compliance instructions are required';
    }
    
    if (!formData.compliance_deadline) {
      newErrors.compliance_deadline = 'Compliance deadline is required';
    } else {
      const selectedDate = new Date(formData.compliance_deadline);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.compliance_deadline = 'Compliance deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      violations: '',
      compliance_instructions: '',
      compliance_deadline: '',
      remarks: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">
            Send Notice of Violation (NOV)
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Inspection Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-900 mb-2">Inspection Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Inspection Code:</span>
                  <span className="ml-2 font-medium">{inspection?.code}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">{inspection?.current_status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Establishment:</span>
                  <span className="ml-2 font-medium">
                    {inspection?.establishment_names?.[0] || 'N/A'}
                  </span>
              </div>
            </div>
          </div>

            {/* Violations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Violations Found <span className="text-red-500">*</span>
            </label>
            <textarea
                name="violations"
                value={formData.violations}
                onChange={handleChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500 ${
                  errors.violations ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="List all violations found during the inspection..."
                disabled={loading}
              />
              {errors.violations && (
                <p className="mt-1 text-sm text-red-600">{errors.violations}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Provide detailed descriptions of all violations
              </p>
          </div>

            {/* Compliance Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Compliance Actions <span className="text-red-500">*</span>
            </label>
            <textarea
                name="compliance_instructions"
                value={formData.compliance_instructions}
                onChange={handleChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500 ${
                  errors.compliance_instructions ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Specify the actions required to achieve compliance..."
                disabled={loading}
              />
              {errors.compliance_instructions && (
                <p className="mt-1 text-sm text-red-600">{errors.compliance_instructions}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Detail the corrective measures that must be taken
            </p>
          </div>

            {/* Compliance Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="compliance_deadline"
                value={formData.compliance_deadline}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500 ${
                  errors.compliance_deadline ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.compliance_deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.compliance_deadline}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Set a deadline for the establishment to comply with requirements
            </p>
          </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Remarks (Optional)
            </label>
            <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                placeholder="Any additional notes or remarks..."
                disabled={loading}
              />
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p>
                    Sending a Notice of Violation will change the inspection status to 
                    <strong> NOV_SENT</strong>. The establishment will be notified and 
                    expected to comply by the specified deadline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Send Notice of Violation</span>
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
