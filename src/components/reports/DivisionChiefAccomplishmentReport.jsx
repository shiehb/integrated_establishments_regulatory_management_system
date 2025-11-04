// src/components/reports/DivisionChiefAccomplishmentReport.jsx
import { useState, useEffect, useCallback } from 'react';
import { Download, FileText, Calendar, AlertCircle, X, Filter, Search, Eye } from 'lucide-react';
import { useNotifications } from '../NotificationManager';
import { exportInspectionsPDF, saveGeneratedReport } from '../../services/reportsApi';
import { getInspections } from '../../services/api';
import { statusDisplayMap } from '../../constants/inspectionConstants';
import { LAWS } from '../../constants/inspectionform/lawsConstants';

export default function DivisionChiefAccomplishmentReport({
  title = "Division Chief Accomplishment Report",
  className = "",
  disabled = false,
  showExportOptions = true
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // Report configuration state
  const [reportType, setReportType] = useState('quarterly'); // yearly, quarterly, monthly
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Filter state
  const [selectedLaw, setSelectedLaw] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspections, setInspections] = useState([]);
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const notifications = useNotifications();

  // Fetch inspections data
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        page_size: 1000, // Get all inspections for Division Chief
        ordering: '-created_at'
      };

      // Add date filtering based on report type
      if (customDateRange && dateFrom && dateTo) {
        params.date_from = dateFrom;
        params.date_to = dateTo;
      } else {
        const currentDate = new Date();
        const currentYear = selectedYear;
        
        switch (reportType) {
          case 'yearly':
            params.date_from = `${currentYear}-01-01`;
            params.date_to = `${currentYear}-12-31`;
            break;
          case 'quarterly':
            const quarterStartMonth = (selectedQuarter - 1) * 3 + 1;
            const quarterEndMonth = selectedQuarter * 3;
            params.date_from = `${currentYear}-${String(quarterStartMonth).padStart(2, '0')}-01`;
            params.date_to = `${currentYear}-${String(quarterEndMonth).padStart(2, '0')}-${new Date(currentYear, quarterEndMonth, 0).getDate()}`;
            break;
          case 'monthly':
            const monthDays = new Date(currentYear, selectedMonth, 0).getDate();
            params.date_from = `${currentYear}-${String(selectedMonth).padStart(2, '0')}-01`;
            params.date_to = `${currentYear}-${String(selectedMonth).padStart(2, '0')}-${monthDays}`;
            break;
        }
      }

      const data = await getInspections(params);
      setInspections(data.results || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      notifications.error('Failed to fetch inspections data', {
        title: '❌ Data Error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedQuarter, selectedYear, selectedMonth, customDateRange, dateFrom, dateTo, notifications]);

  // Filter inspections based on selected law and search term
  useEffect(() => {
    let filtered = inspections;

    // Filter by environmental law
    if (selectedLaw !== 'all') {
      filtered = filtered.filter(inspection => {
        // Check if inspection has compliance data with the selected law
        if (inspection.compliance_data) {
          const complianceData = typeof inspection.compliance_data === 'string' 
            ? JSON.parse(inspection.compliance_data) 
            : inspection.compliance_data;
          
          return complianceData.some(system => system.lawId === selectedLaw);
        }
        return false;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(inspection => 
        inspection.establishment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.inspection_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInspections(filtered);
  }, [inspections, selectedLaw, searchTerm]);

  // Load inspections when parameters change
  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Export PDF using backend
  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPdf(true);
      setExportError(null);

      // Prepare export parameters
      const exportParams = {
        report_type: reportType,
        quarter: selectedQuarter,
        year: selectedYear,
        month: selectedMonth,
        law_filter: selectedLaw !== 'all' ? selectedLaw : null,
        division_chief_report: true
      };

      // Add custom date range if selected
      if (customDateRange && dateFrom && dateTo) {
        exportParams.date_from = dateFrom;
        exportParams.date_to = dateTo;
      }

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
        title: `${title} - ${getReportPeriodLabel()}`,
        report_type: reportType,
        quarter: selectedQuarter,
        year: selectedYear,
        month: selectedMonth,
        date_from: customDateRange ? dateFrom : null,
        date_to: customDateRange ? dateTo : null,
        law_filter: selectedLaw !== 'all' ? selectedLaw : null,
        division_chief_report: true
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
  }, [reportType, selectedQuarter, selectedYear, selectedMonth, customDateRange, dateFrom, dateTo, selectedLaw, title, notifications]);

  // Get report period label
  const getReportPeriodLabel = () => {
    if (customDateRange && dateFrom && dateTo) {
      return `${dateFrom} to ${dateTo}`;
    }
    
    switch (reportType) {
      case 'yearly':
        return selectedYear;
      case 'quarterly':
        return `Q${selectedQuarter} ${selectedYear}`;
      case 'monthly':
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
      default:
        return `${selectedYear}`;
    }
  };

  // PDF Preview handlers
  const handleDownloadPDF = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `division_chief_accomplishment_report_${getReportPeriodLabel().replace(/\s+/g, '_').toLowerCase()}.pdf`;
    link.click();
    notifications.success('PDF downloaded successfully!', {
      title: '✅ Download Complete',
      duration: 3000
    });
  }, [pdfUrl, getReportPeriodLabel, notifications]);

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

  // Get status display info
  const getStatusDisplay = (status) => {
    return statusDisplayMap[status] || { label: status, color: 'gray' };
  };

  // Render inspection row
  const renderInspectionRow = (inspection) => {
    const statusInfo = getStatusDisplay(inspection.status);
    const statusColors = {
      gray: 'bg-gray-100 text-gray-700 border-gray-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      amber: 'bg-amber-100 text-amber-700 border-amber-300',
      sky: 'bg-sky-100 text-sky-700 border-sky-300',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      red: 'bg-red-100 text-red-700 border-red-300'
    };

    return (
      <tr key={inspection.id} className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.inspection_id || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.establishment_name || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.section_name || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.unit_name || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.monitoring_team || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold border rounded ${statusColors[statusInfo.color]}`}>
            {statusInfo.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {inspection.compliance_status || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          <button
            onClick={() => window.open(`/inspections/${inspection.id}`, '_blank')}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Main Report Interface */}
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive inspection report across all Sections, Units, and Monitoring teams
              </p>
            </div>
            {showExportOptions && (
              <button
                onClick={() => setShowExportModal(true)}
                disabled={disabled || loading}
                title={loading ? 'Loading data...' : `Export PDF report`}
                className="
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                <Download size={16} />
                Generate PDF
              </button>
            )}
          </div>
        </div>

        {/* Report Configuration */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <div className="flex gap-2">
                {reportType === 'quarterly' && (
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </select>
                )}
                {reportType === 'monthly' && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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

            {/* Environmental Law Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Environmental Law</label>
              <select
                value={selectedLaw}
                onChange={(e) => setSelectedLaw(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Laws</option>
                {LAWS.map(law => (
                  <option key={law.id} value={law.id}>
                    {law.label} - {law.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inspections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Establishment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monitoring Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                      <span className="ml-2">Loading inspections...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No inspections found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredInspections.map(renderInspectionRow)
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredInspections.length}</div>
              <div className="text-sm text-gray-600">Total Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredInspections.filter(i => i.status === 'CLOSED_COMPLIANT').length}
              </div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredInspections.filter(i => i.status === 'CLOSED_NON_COMPLIANT').length}
              </div>
              <div className="text-sm text-gray-600">Non-Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredInspections.filter(i => ['SECTION_IN_PROGRESS', 'UNIT_IN_PROGRESS', 'MONITORING_IN_PROGRESS'].includes(i.status)).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Error Display */}
      {exportError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[60vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b shadow-sm border-gray-400">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Export Division Chief Report</h2>
                  <p className="text-sm text-gray-600">Period: {getReportPeriodLabel()}</p>
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
              {/* Export Preview */}
              <div className="mb-6 p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Export Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">All inspections across divisions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Format: PDF</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Period: {getReportPeriodLabel()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Law Filter: {selectedLaw === 'all' ? 'All Laws' : selectedLaw}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
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
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-[60] bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full h-screen flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-base text-gray-600">Division Chief Accomplishment Report - {getReportPeriodLabel()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleClosePdfPreview}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
          </div>
        </div>
      )}
    </>
  );
}
