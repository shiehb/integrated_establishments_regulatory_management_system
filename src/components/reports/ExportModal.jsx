// src/components/reports/ExportModal.jsx
import { useState } from 'react';
import { X, Download, FileText, Calendar, Settings } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Report</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                exportFormat === 'pdf' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
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
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">PDF Document</p>
                    <p className="text-sm text-gray-600">Official report format</p>
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                exportFormat === 'print' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
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
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Print Preview</p>
                    <p className="text-sm text-gray-600">Browser print dialog</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  checked={!customDateRange}
                  onChange={() => setCustomDateRange(false)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Q{quarter} {year} ({quarterDates.start} to {quarterDates.end})
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  checked={customDateRange}
                  onChange={() => setCustomDateRange(true)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Custom date range</span>
              </label>

              {customDateRange && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Include Content</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="text-green-600 focus:ring-green-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Summary statistics and metrics</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="text-green-600 focus:ring-green-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Detailed inspection list</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="text-green-600 focus:ring-green-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Charts and visualizations</span>
              </label>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Export Preview</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {totalInspections} inspections will be included</p>
              <p>• Format: {exportFormat.toUpperCase()}</p>
              <p>• Period: {customDateRange ? `${dateFrom} to ${dateTo}` : `Q${quarter} ${year}`}</p>
              <p>• Content: {includeSummary && 'Summary'} {includeDetails && 'Details'} {includeCharts && 'Charts'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || (customDateRange && (!dateFrom || !dateTo))}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
