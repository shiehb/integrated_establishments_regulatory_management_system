import React, { useState } from 'react';
import { X, FileText, AlertTriangle, CheckCircle, Mail, DollarSign } from 'lucide-react';

export default function LegalUnitModal({ 
  open, 
  inspection, 
  onClose, 
  onSubmit, 
  loading = false 
}) {
  const [actionType, setActionType] = useState('');
  const [formData, setFormData] = useState({
    violations: '',
    compliance_instructions: '',
    required_office_visit: false,
    compliance_deadline: '',
    penalty_fees: '',
    violation_breakdown: '',
    deadlines: '',
    closure_reason: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!actionType) {
      newErrors.actionType = 'Please select an action';
      return false;
    }
    
    if (actionType === 'send_nov') {
      if (!formData.violations.trim()) {
        newErrors.violations = 'Violations are required for NOV';
      }
      if (!formData.compliance_instructions.trim()) {
        newErrors.compliance_instructions = 'Compliance instructions are required for NOV';
      }
    }
    
    if (actionType === 'send_noo') {
      if (!formData.penalty_fees.trim()) {
        newErrors.penalty_fees = 'Penalty fees are required for NOO';
      }
      if (!formData.violation_breakdown.trim()) {
        newErrors.violation_breakdown = 'Violation breakdown is required for NOO';
      }
    }
    
    if (actionType === 'close_case') {
      if (!formData.closure_reason.trim()) {
        newErrors.closure_reason = 'Closure reason is required';
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
    
    onSubmit(actionType, formData);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'send_nov':
        return <Mail className="w-5 h-5 text-yellow-600" />;
      case 'send_noo':
        return <DollarSign className="w-5 h-5 text-orange-600" />;
      case 'close_case':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'send_nov':
        return 'border-yellow-200 bg-yellow-50';
      case 'send_noo':
        return 'border-orange-200 bg-orange-50';
      case 'close_case':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Legal Unit Actions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Inspection Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">{inspection?.code}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gray-700">{inspection?.establishment_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Non-Compliant Case</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Action *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { 
                  value: 'send_nov', 
                  label: 'Send Notice of Violation (NOV)', 
                  description: 'Send violation notice with compliance instructions'
                },
                { 
                  value: 'send_noo', 
                  label: 'Send Notice of Order (NOO)', 
                  description: 'Send order with penalty fees and violation breakdown'
                },
                { 
                  value: 'close_case', 
                  label: 'Close Case', 
                  description: 'Close the case (establishment has complied)'
                }
              ].map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => setActionType(action.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    actionType === action.value
                      ? getActionColor(action.value)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(action.value)}
                    <div>
                      <div className="font-medium text-gray-900">{action.label}</div>
                      <div className="text-sm text-gray-600">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.actionType && (
              <p className="mt-1 text-sm text-red-600">{errors.actionType}</p>
            )}
          </div>

          {/* NOV Form */}
          {actionType === 'send_nov' && (
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">Notice of Violation Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Violations *
                </label>
                <textarea
                  value={formData.violations}
                  onChange={(e) => handleInputChange('violations', e.target.value)}
                  placeholder="List all violations found..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.violations ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                />
                {errors.violations && (
                  <p className="mt-1 text-sm text-red-600">{errors.violations}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Instructions *
                </label>
                <textarea
                  value={formData.compliance_instructions}
                  onChange={(e) => handleInputChange('compliance_instructions', e.target.value)}
                  placeholder="Provide detailed compliance instructions..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.compliance_instructions ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                />
                {errors.compliance_instructions && (
                  <p className="mt-1 text-sm text-red-600">{errors.compliance_instructions}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Deadline
                </label>
                <input
                  type="date"
                  value={formData.compliance_deadline}
                  onChange={(e) => handleInputChange('compliance_deadline', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required_office_visit"
                  checked={formData.required_office_visit}
                  onChange={(e) => handleInputChange('required_office_visit', e.target.checked)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="required_office_visit" className="ml-2 block text-sm text-gray-700">
                  Require office visit
                </label>
              </div>
            </div>
          )}

          {/* NOO Form */}
          {actionType === 'send_noo' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800">Notice of Order Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty Fees *
                </label>
                <input
                  type="text"
                  value={formData.penalty_fees}
                  onChange={(e) => handleInputChange('penalty_fees', e.target.value)}
                  placeholder="Enter penalty amount and details..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.penalty_fees ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.penalty_fees && (
                  <p className="mt-1 text-sm text-red-600">{errors.penalty_fees}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Violation Breakdown *
                </label>
                <textarea
                  value={formData.violation_breakdown}
                  onChange={(e) => handleInputChange('violation_breakdown', e.target.value)}
                  placeholder="Breakdown of violations and corresponding penalties..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.violation_breakdown ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                />
                {errors.violation_breakdown && (
                  <p className="mt-1 text-sm text-red-600">{errors.violation_breakdown}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadlines
                </label>
                <textarea
                  value={formData.deadlines}
                  onChange={(e) => handleInputChange('deadlines', e.target.value)}
                  placeholder="Payment deadlines and other requirements..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Close Case Form */}
          {actionType === 'close_case' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Case Closure Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closure Reason *
                </label>
                <textarea
                  value={formData.closure_reason}
                  onChange={(e) => handleInputChange('closure_reason', e.target.value)}
                  placeholder="Explain why the case is being closed..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.closure_reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                />
                {errors.closure_reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.closure_reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {getActionIcon(actionType)}
                  {actionType === 'send_nov' && 'Send NOV'}
                  {actionType === 'send_noo' && 'Send NOO'}
                  {actionType === 'close_case' && 'Close Case'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
