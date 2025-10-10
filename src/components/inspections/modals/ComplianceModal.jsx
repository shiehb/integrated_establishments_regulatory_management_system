import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, FileText, Calendar, User } from 'lucide-react';

export default function ComplianceModal({ 
  open, 
  inspection, 
  onClose, 
  onSubmit, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    compliance_status: inspection?.compliance_status || 'PENDING',
    violations_found: inspection?.violations_found || '',
    compliance_notes: inspection?.compliance_notes || '',
    compliance_plan: inspection?.compliance_plan || '',
    compliance_deadline: inspection?.compliance_deadline || ''
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
    
    if (!formData.compliance_status) {
      newErrors.compliance_status = 'Compliance status is required';
    }
    
    if (formData.compliance_status === 'NON_COMPLIANT' && !formData.violations_found.trim()) {
      newErrors.violations_found = 'Violations found is required for non-compliant cases';
    }
    
    if (!formData.compliance_notes.trim()) {
      newErrors.compliance_notes = 'Compliance notes are required';
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

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'NON_COMPLIANT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PARTIALLY_COMPLIANT':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceStatusIcon = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'NON_COMPLIANT':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'PARTIALLY_COMPLIANT':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Compliance Tracking</h3>
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
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{inspection?.establishment_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">
              {new Date(inspection?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Compliance Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'COMPLIANT', label: 'Compliant', icon: '✅' },
                { value: 'NON_COMPLIANT', label: 'Non-Compliant', icon: '❌' },
                { value: 'PARTIALLY_COMPLIANT', label: 'Partially Compliant', icon: '⚠️' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('compliance_status', option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.compliance_status === option.value
                      ? getComplianceStatusColor(option.value)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.compliance_status && (
              <p className="mt-1 text-sm text-red-600">{errors.compliance_status}</p>
            )}
          </div>

          {/* Violations Found */}
          {formData.compliance_status === 'NON_COMPLIANT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Violations Found *
              </label>
              <textarea
                value={formData.violations_found}
                onChange={(e) => handleInputChange('violations_found', e.target.value)}
                placeholder="Describe the violations found during inspection..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                  errors.violations_found ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={4}
              />
              {errors.violations_found && (
                <p className="mt-1 text-sm text-red-600">{errors.violations_found}</p>
              )}
            </div>
          )}

          {/* Compliance Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Notes *
            </label>
            <textarea
              value={formData.compliance_notes}
              onChange={(e) => handleInputChange('compliance_notes', e.target.value)}
              placeholder="Provide detailed notes about the compliance assessment..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                errors.compliance_notes ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
            />
            {errors.compliance_notes && (
              <p className="mt-1 text-sm text-red-600">{errors.compliance_notes}</p>
            )}
          </div>

          {/* Compliance Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Plan
            </label>
            <textarea
              value={formData.compliance_plan}
              onChange={(e) => handleInputChange('compliance_plan', e.target.value)}
              placeholder="Describe the establishment's plan to achieve compliance..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Compliance Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Deadline
            </label>
            <input
              type="date"
              value={formData.compliance_deadline}
              onChange={(e) => handleInputChange('compliance_deadline', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

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
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Compliance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
