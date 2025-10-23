// src/components/reports/AccomplishmentReportPDF.jsx
import { useState, useEffect, useCallback } from 'react';
import { Download, FileText, Calendar, AlertCircle, X } from 'lucide-react';
import { useNotifications } from '../NotificationManager';
import { exportInspectionsPDF, saveGeneratedReport } from '../../services/reportsApi';


export default function AccomplishmentReportPDF({
  title = "Accomplishment Report",
  quarter: defaultQuarter,
  year: defaultYear,
  className = "",
  disabled = false,
  showExportOptions = true
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // Export modal state
  const [selectedQuarter, setSelectedQuarter] = useState(defaultQuarter || 1);
  const [selectedYear, setSelectedYear] = useState(defaultYear || new Date().getFullYear());
  const [customDateRange, setCustomDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const notifications = useNotifications();

  // Export PDF using backend
  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPdf(true);
      setExportError(null);

      // Prepare export parameters
      const exportParams = {
        quarter: selectedQuarter,
        year: selectedYear
      };

      // Add custom date range if selected
      if (customDateRange && dateFrom && dateTo) {
        exportParams.date_from = dateFrom;
        exportParams.date_to = dateTo;
      }

      console.log('Exporting PDF with params:', exportParams);

      // Call backend export API
      const pdfBlob = await exportInspectionsPDF(exportParams);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Empty PDF generated. Please check your data.');
      }

      // Create download URL
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowPdfPreview(true);
      setShowExportModal(false);

      // Save to database
      const reportData = {
        title: `${title} - Q${selectedQuarter} ${selectedYear}`,
        quarter: selectedQuarter,
        year: selectedYear,
        date_from: customDateRange ? dateFrom : null,
        date_to: customDateRange ? dateTo : null
      };

      await saveGeneratedReport(reportData, pdfBlob);

      notifications.success('PDF generated and saved successfully!', {
        title: '✅ Export Complete',
        duration: 3000
      });

    } catch (error) {
      console.error('PDF Export failed:', error);
      const errorMessage = error.message || 'PDF export failed. Please try again.';
      setExportError(errorMessage);
      
      notifications.error(errorMessage, {
        title: '❌ Export Failed',
        duration: 6000
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [selectedQuarter, selectedYear, customDateRange, dateFrom, dateTo, title, notifications]);

  // PDF Preview handlers
  const handleDownloadPDF = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `accomplishment_report_q${selectedQuarter}_${selectedYear}.pdf`;
    link.click();
    notifications.success('PDF downloaded successfully!', {
      title: '✅ Download Complete',
      duration: 3000
    });
  }, [pdfUrl, selectedQuarter, selectedYear, notifications]);


  const handleClosePdfPreview = useCallback(() => {
    setShowPdfPreview(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  // Cleanup PDF URL
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const hasData = true; // Backend will handle data validation

  return (
    <>
      {/* Action Buttons */}
      <div className={`flex items-center gap-2 ${className}`}>
        {showExportOptions && (
          <button
            onClick={() => setShowExportModal(true)}
            disabled={disabled || !hasData}
            title={!hasData ? 'No data to export' : `Export PDF report`}
            className={`
              flex items-center gap-2 px-3 py-1 text-sm font-medium rounded
              text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
          >
            <Download size={16} />
            Export PDF
          </button>
        )}
      </div>

      {/* Export Error Display */}
      {exportError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-red-600 text-sm">{exportError}</p>
            <button 
              onClick={() => setExportError(null)}
              className="text-red-500 text-xs underline ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Export Accomplishment Report</h2>
                  <p className="text-sm text-gray-600">Select period and generate PDF</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Date Range Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Select Period</label>
                <div className="space-y-4">
                  {/* Quarter Selection */}
                  <div className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="dateRange"
                      checked={!customDateRange}
                      onChange={() => setCustomDateRange(false)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex items-center gap-4">
                      <span className="font-medium text-gray-900">Quarter:</span>
                      <select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <option value={1}>First Quarter</option>
                        <option value={2}>Second Quarter</option>
                        <option value={3}>Third Quarter</option>
                        <option value={4}>Fourth Quarter</option>
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  
                  {/* Custom Date Range */}
                  <div className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50">
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
                  </div>

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
                        <span className="font-medium">All</span> completed inspections will be included
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Format: <span className="font-medium">PDF</span></span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Period: <span className="font-medium">
                          {customDateRange ? `${dateFrom} to ${dateTo}` : `Q${selectedQuarter} ${selectedYear}`}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Content: <span className="font-medium">Summary Statistics, Detailed List</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      The backend will generate the PDF with all completed inspections for the selected period.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {isGeneratingPdf && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Generating PDF...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && pdfUrl && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">PDF Preview</h2>
                  <p className="text-sm text-gray-600">Accomplishment Report - Q{selectedQuarter} {selectedYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleClosePdfPreview}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full"
                style={{border: 'none'}}
                title="PDF Preview"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Report saved to Generated Reports</span>
              </div>
              <div className="text-sm text-gray-500">
                Press ESC to close preview
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
