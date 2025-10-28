import React, { useState, useEffect } from "react";
import { X, Target, TrendingUp, AlertCircle } from "lucide-react";
import { LAWS, QUARTERS } from "../../../constants/quotaConstants";
import ConfirmationDialog from "../../common/ConfirmationDialog";

const QuotaModal = ({ isOpen, onClose, quota, onSave }) => {
  // Calculate current period
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  
  // Calculate next period
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
  const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;

  const [formData, setFormData] = useState({
    law: '',
    year: currentYear,
    quarter: currentQuarter,
    target: '',
    auto_adjust: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
      // Reset form for new quota - defaults to current quarter
      setFormData({
        law: '',
        year: currentYear,
        quarter: currentQuarter,
        target: 25,
        auto_adjust: true
      });
    }
    setErrors({});
  }, [quota, isOpen, currentYear, currentQuarter]);

  // Get available years (only current and possibly next)
  const getAvailableYears = () => {
    return currentQuarter === 4 
      ? [{ value: currentYear, label: `${currentYear}` }, { value: nextYear, label: `${nextYear}` }]
      : [{ value: currentYear, label: `${currentYear}` }];
  };

  // Get available quarters based on selected year
  const getAvailableQuarters = () => {
    if (formData.year === currentYear) {
      // Current year: show only future quarters (exclude current quarter)
      return QUARTERS.filter(q => q.value > currentQuarter);
    } else if (formData.year === nextYear) {
      // Next year: show all quarters (Q1-Q4)
      return QUARTERS;
    }
    return [];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.law) {
      newErrors.law = 'Please select a law';
    }
    
    if (!formData.target || formData.target <= 0) {
      newErrors.target = 'Target must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation dialog instead of directly saving
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    
    try {
      await onSave({
        law: formData.law,
        year: parseInt(formData.year),
        quarter: parseInt(formData.quarter),
        target: parseInt(formData.target)
      });
      setShowConfirmDialog(false);
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
            {quota ? 'Update Quota Target' : 'Set Inspection Quota'}
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
          {/* Year and Quarter - First Row */}
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
                } ${quota ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
                disabled={isSubmitting || !!quota}
              >
                {getAvailableYears().map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
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
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  quota ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
                disabled={isSubmitting || !!quota}
              >
                {getAvailableQuarters().map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Law - Second Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Law <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.law}
              onChange={(e) => handleInputChange('law', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                errors.law ? 'border-red-300' : 'border-gray-300'
              } ${quota ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              disabled={isSubmitting || !!quota}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Inspections <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-3">
              <input
                type="number"
                value={formData.target}
                onChange={(e) => handleInputChange('target', parseInt(e.target.value))}
                className={`w-32 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.target ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1"
                placeholder="Enter target"
                required
                disabled={isSubmitting}
              />
              <div className="flex items-start gap-2 flex-1">
                <input
                  type="checkbox"
                  id="auto_adjust"
                  checked={formData.auto_adjust}
                  onChange={(e) => handleInputChange('auto_adjust', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2"
                  disabled={isSubmitting}
                />
                <label htmlFor="auto_adjust" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  Auto-adjust next quarter based on accomplishments
                </label>
              </div>
            </div>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        title={quota ? "Confirm Quota Update" : "Confirm Quota Creation"}
        message={
          <div>
            <p className="mb-2">
              {quota 
                ? "You are about to update the quota target for this inspection program." 
                : "You are about to create a new quota for this inspection program."
              }
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mt-3">
              <div className="text-sm space-y-1">
                <p><strong>Inspection Program:</strong> {LAWS.find(l => l.id === formData.law)?.name}</p>
                <p><strong>Period:</strong> Q{formData.quarter}, {formData.year} ({QUARTERS.find(q => q.value === formData.quarter)?.months})</p>
                <p><strong>Target:</strong> {formData.target} inspections</p>
                {formData.auto_adjust && (
                  <p className="text-blue-600 mt-1">✓ Auto-adjust next quarter enabled</p>
                )}
              </div>
            </div>
          </div>
        }
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSave}
        confirmText={quota ? "Update" : "Set"}
        cancelText="Cancel"
        confirmColor="sky"
        loading={isSubmitting}
        icon={<Target size={20} className="text-sky-600" />}
        headerColor="sky"
        size="md"
      />
    </div>
  );
};

export default QuotaModal;
