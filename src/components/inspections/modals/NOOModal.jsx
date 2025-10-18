import React, { useState } from 'react';
import { X, FileText, Plus, Trash2 } from 'lucide-react';

const NOOModal = ({ isOpen, onClose, onSubmit, inspection, loading = false }) => {
  const [formData, setFormData] = useState({
    violation_breakdown: '',
    penalty_fees: '',
    payment_deadline: '',
    payment_instructions: '',
    remarks: ''
  });

  const [billingItems, setBillingItems] = useState([
    { violation: '', amount: '' }
  ]);

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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billingItems];
    updatedItems[index][field] = value;
    setBillingItems(updatedItems);
    
    // Recalculate total
    calculateTotal(updatedItems);
  };

  const addBillingItem = () => {
    setBillingItems([...billingItems, { violation: '', amount: '' }]);
  };

  const removeBillingItem = (index) => {
    if (billingItems.length === 1) return; // Keep at least one item
    const updatedItems = billingItems.filter((_, i) => i !== index);
    setBillingItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items = billingItems) => {
    const total = items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      penalty_fees: total.toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.violation_breakdown.trim()) {
      newErrors.violation_breakdown = 'Violation breakdown is required';
    }
    
    if (!formData.penalty_fees || parseFloat(formData.penalty_fees) <= 0) {
      newErrors.penalty_fees = 'Total penalty must be greater than zero';
    }
    
    if (!formData.payment_deadline) {
      newErrors.payment_deadline = 'Payment deadline is required';
    } else {
      const selectedDate = new Date(formData.payment_deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < now) {
        newErrors.payment_deadline = 'Payment deadline must be today or in the future';
      }
    }

    // Validate billing items
    let hasValidItems = false;
    billingItems.forEach((item, index) => {
      if (item.violation.trim() && item.amount) {
        hasValidItems = true;
      }
    });

    if (!hasValidItems) {
      newErrors.billing_items = 'At least one billing item with violation and amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty billing items
    const validBillingItems = billingItems.filter(
      item => item.violation.trim() && item.amount
    ).map(item => ({
      violation: item.violation.trim(),
      amount: parseFloat(item.amount)
    }));

    const submissionData = {
      ...formData,
      penalty_fees: parseFloat(formData.penalty_fees),
      billing_items: validBillingItems
    };

    onSubmit(submissionData);
  };

  const handleCancel = () => {
    setFormData({
      violation_breakdown: '',
      penalty_fees: '',
      payment_deadline: '',
      payment_instructions: '',
      remarks: ''
    });
    setBillingItems([{ violation: '', amount: '' }]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Send Notice of Order (NOO) with Billing
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
          <div className="px-6 py-4 space-y-6">
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

            {/* Violation Breakdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Violation Breakdown <span className="text-red-500">*</span>
              </label>
              <textarea
                name="violation_breakdown"
                value={formData.violation_breakdown}
                onChange={handleChange}
                rows={5}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500 ${
                  errors.violation_breakdown ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Detailed breakdown of all violations..."
                disabled={loading}
              />
              {errors.violation_breakdown && (
                <p className="mt-1 text-sm text-red-600">{errors.violation_breakdown}</p>
              )}
          </div>

            {/* Billing Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Penalty Line Items <span className="text-red-500">*</span>
            </label>
                <button
                  type="button"
                  onClick={addBillingItem}
                  className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center space-x-1"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {billingItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-1">
            <input
              type="text"
                        placeholder="Violation description"
                        value={item.violation}
                        onChange={(e) => handleItemChange(index, 'violation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                        disabled={loading}
                      />
          </div>
                    <div className="w-40">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₱</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          onBlur={() => calculateTotal()}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                          step="0.01"
                          min="0"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBillingItem(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50"
                      disabled={loading || billingItems.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.billing_items && (
                <p className="mt-1 text-sm text-red-600">{errors.billing_items}</p>
              )}

              {/* Total */}
              <div className="mt-4 bg-sky-50 border border-sky-200 rounded-md p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Penalty Fees:</span>
                <span className="text-xl font-bold text-sky-700">
                  ₱{parseFloat(formData.penalty_fees || 0).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
          </div>

            {/* Payment Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
                name="payment_deadline"
                value={formData.payment_deadline}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500 ${
                  errors.payment_deadline ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.payment_deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_deadline}</p>
              )}
          </div>

            {/* Payment Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Instructions (Optional)
            </label>
            <textarea
                name="payment_instructions"
                value={formData.payment_instructions}
                onChange={handleChange}
              rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                placeholder="Provide payment instructions (e.g., bank details, payment methods)..."
                disabled={loading}
              />
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
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                placeholder="Any additional notes or remarks..."
                disabled={loading}
              />
            </div>

            {/* Warning */}
            <div className="bg-sky-50 border border-sky-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-sky-600 mt-0.5" />
                <div className="text-sm text-sky-800">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p>
                    Sending a Notice of Order will change the inspection status to 
                    <strong> NOO_SENT</strong> and create a billing record with the 
                    specified penalties. The establishment will be notified and expected 
                    to pay by the deadline.
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
              className="px-6 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Send Notice of Order</span>
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
