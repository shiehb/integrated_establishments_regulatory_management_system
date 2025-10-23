// src/components/reports/CreateReportModal.jsx
import { useState, useEffect } from 'react';
import { X, FileText, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { createReport, getQuarterDates, generateReportTitle } from '../../services/reportsApi';

export default function CreateReportModal({ 
  isOpen, 
  onClose, 
  onReportCreated, 
  quarter, 
  year, 
  selectedInspections 
}) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    key_achievements: ''
  });
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Auto-populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      const quarterDates = getQuarterDates(quarter, year);
      const title = generateReportTitle(quarter, year);
      
      setFormData({
        title,
        summary: '',
        key_achievements: ''
      });

      // Calculate basic metrics
      const totalInspections = selectedInspections.length;
      setMetrics({
        total_inspections: totalInspections,
        period_start: quarterDates.start,
        period_end: quarterDates.end
      });
    }
  }, [isOpen, quarter, year, selectedInspections]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quarterDates = getQuarterDates(quarter, year);
      
      const reportData = {
        title: formData.title,
        report_type: 'quarterly',
        quarter,
        year,
        period_start: quarterDates.start,
        period_end: quarterDates.end,
        summary: formData.summary,
        key_achievements: formData.key_achievements,
        completed_inspections: selectedInspections
      };

      await createReport(reportData);
      onReportCreated();
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <FileText className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Accomplishment Report</h2>
              <p className="text-sm text-gray-600">Q{quarter} {year} Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Report Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Report Period</h3>
            </div>
            <p className="text-sm text-blue-700">
              {metrics?.period_start} to {metrics?.period_end}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {selectedInspections.length} completed inspections will be included
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Executive Summary
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Provide a comprehensive summary of accomplishments for this quarter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Key Achievements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Achievements
            </label>
            <textarea
              name="key_achievements"
              value={formData.key_achievements}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="List the key achievements and milestones for this quarter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Metrics Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Report Metrics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics?.total_inspections || 0}
                </div>
                <div className="text-sm text-gray-600">Total Inspections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedInspections.length}
                </div>
                <div className="text-sm text-gray-600">Selected</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Detailed metrics will be calculated automatically when the report is generated
            </p>
          </div>

          {/* Selected Inspections Count */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                {selectedInspections.length} inspections selected for inclusion
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedInspections.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                loading || selectedInspections.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
