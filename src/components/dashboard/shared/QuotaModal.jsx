import React, { useState, useEffect } from "react";
import { X, Target, TrendingUp, AlertCircle } from "lucide-react";
import { LAWS, QUARTERS } from "../../../constants/quotaConstants";

const QuotaModal = ({ isOpen, onClose, quota, onSave }) => {
  const [formData, setFormData] = useState({
    law: '',
    year: new Date().getFullYear(),
    quarter: 1,
    target: '',
    auto_adjust: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quota) {
      setFormData({
        law: quota.law,
        year: quota.year,
        quarter: quota.quarter,
        target: quota.target,
        auto_adjust: quota.auto_adjusted
      });
    } else {
      // Reset form for new quota
      setFormData({
        law: '',
        year: new Date().getFullYear(),
        quarter: 1,
        target: 25,
        auto_adjust: true
      });
    }
    setErrors({});
  }, [quota, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.law) {
      newErrors.law = 'Please select a law';
    }
    
    if (!formData.target || formData.target <= 0) {
      newErrors.target = 'Target must be greater than 0';
    }
    
    if (formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Year must be between 2020 and 2030';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        law: formData.law,
        year: parseInt(formData.year),
        quarter: parseInt(formData.quarter),
        target: parseInt(formData.target)
      });
      onClose();
    } catch (err) {
      console.error('Error saving quota:', err);
      setErrors({ submit: err.message || 'Failed to save quota' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Target size={20} className="text-sky-600" />
            {quota ? 'Edit Quota' : 'Set New Quota'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Law <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.law}
              onChange={(e) => handleInputChange('law', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                errors.law ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            >
              <option value="">Select Law</option>
              {LAWS.map(law => (
                <option key={law.id} value={law.id}>{law.name}</option>
              ))}
            </select>
            {errors.law && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.law}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              >
                {Array.from({ length: 11 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              {errors.year && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.year}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quarter <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.quarter}
                onChange={(e) => handleInputChange('quarter', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              >
                {QUARTERS.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Inspections <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.target}
              onChange={(e) => handleInputChange('target', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.target ? 'border-red-300' : 'border-gray-300'
              }`}
              min="1"
              placeholder="Enter target number"
              required
              disabled={isSubmitting}
            />
            {errors.target && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.target}
              </p>
            )}
          </div>

          {quota && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-700">
                <strong>Current Accomplished:</strong> {quota.accomplished} inspections
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {quota.percentage}% of target achieved
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_adjust"
              checked={formData.auto_adjust}
              onChange={(e) => handleInputChange('auto_adjust', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="auto_adjust" className="text-sm text-gray-700">
              Auto-adjust next quarter based on accomplishments
            </label>
          </div>

          {errors.submit && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Target size={16} />
                  {quota ? 'Update' : 'Set'} Quota
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotaModal;
