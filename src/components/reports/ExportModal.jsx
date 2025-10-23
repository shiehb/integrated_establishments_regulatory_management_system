// src/components/reports/ExportModal.jsx
import { useState } from 'react';
import { X, Download, FileText, Calendar, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport,
  quarter,
  year,
  totalInspections = 0
}) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportOptions = {
        format: exportFormat,
        includeSummary,
        includeDetails,
        includeCharts,
        customDateRange,
        dateFrom: customDateRange ? dateFrom : null,
        dateTo: customDateRange ? dateTo : null,
        quarter,
        year
      };
      
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getQuarterDates = (quarter, year) => {
    const quarters = {
      1: { start: `${year}-01-01`, end: `${year}-03-31` },
      2: { start: `${year}-04-01`, end: `${year}-06-30` },
      3: { start: `${year}-07-01`, end: `${year}-09-30` },
      4: { start: `${year}-10-01`, end: `${year}-12-31` }
    };
    return quarters[quarter];
  };

  const quarterDates = getQuarterDates(quarter, year);
  const hasValidDateRange = !customDateRange || (dateFrom && dateTo);
  const canExport = hasValidDateRange && totalInspections > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Report</h2>
              <p className="text-sm text-gray-600">Configure your export options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Export Format</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                exportFormat === 'pdf' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">PDF Document</p>
                    <p className="text-sm text-gray-600">Official report format</p>
                  </div>
                  {exportFormat === 'pdf' && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                exportFormat === 'print' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="print"
                  checked={exportFormat === 'print'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Print Preview</p>
                    <p className="text-sm text-gray-600">Browser print dialog</p>
                  </div>
                  {exportFormat === 'print' && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Date Range</label>
            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50">
                <input
                  type="radio"
                  name="dateRange"
                  checked={!customDateRange}
                  onChange={() => setCustomDateRange(false)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    Q{quarter} {year} ({quarterDates.start} to {quarterDates.end})
                  </p>
                  <p className="text-sm text-gray-600">Use predefined quarter dates</p>
                </div>
              </label>
              
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50">
                <input
                  type="radio"
                  name="dateRange"
                  checked={customDateRange}
                  onChange={() => setCustomDateRange(true)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Custom date range</p>
                  <p className="text-sm text-gray-600">Specify your own date range</p>
                </div>
              </label>

              {customDateRange && (
                <div className="ml-8 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Include Content</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Summary statistics and metrics</p>
                  <p className="text-sm text-gray-600">Include compliance rates and totals</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Detailed inspection list</p>
                  <p className="text-sm text-gray-600">Include individual inspection records</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Charts and visualizations</p>
                  <p className="text-sm text-gray-600">Include graphs and charts (PDF only)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Export Preview</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">
                    <span className="font-medium">{totalInspections}</span> inspections will be included
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Format: <span className="font-medium">{exportFormat.toUpperCase()}</span></span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Period: <span className="font-medium">
                      {customDateRange ? `${dateFrom} to ${dateTo}` : `Q${quarter} ${year}`}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Content: <span className="font-medium">
                      {[includeSummary && 'Summary', includeDetails && 'Details', includeCharts && 'Charts']
                        .filter(Boolean).join(', ') || 'None'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {totalInspections === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    No inspections found for the selected period. Please check your date range or try a different quarter.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {exporting && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Generating report...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !canExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
