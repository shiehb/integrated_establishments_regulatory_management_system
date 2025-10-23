// src/components/reports/ReportsList.jsx
import { useState, useEffect } from 'react';
import { FileText, Eye, Trash2, Calendar, BarChart3, Download } from 'lucide-react';
import { getReports, deleteReport } from '../../services/reportsApi';

export default function ReportsList({ quarter, year }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        quarter,
        year,
        page: currentPage,
        page_size: 10
      };
      
      const data = await getReports(params);
      setReports(data.results);
      setTotalPages(data.total_pages);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [quarter, year, currentPage]);

  // Handle delete
  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReport(reportId);
        fetchReports(); // Refresh list
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  // Handle print
  const handlePrint = (report) => {
    // Open print view in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metrics { display: flex; gap: 20px; margin-bottom: 30px; }
            .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .summary { margin-bottom: 30px; }
            .achievements { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.title}</h1>
            <p>Period: ${report.period_start} to ${report.period_end}</p>
            <p>Generated on: ${new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          
          <div class="metrics">
            <div class="metric-card">
              <h3>Total Inspections</h3>
              <p>${report.completed_inspections_count}</p>
            </div>
            <div class="metric-card">
              <h3>Compliance Rate</h3>
              <p>${report.compliance_rate}%</p>
            </div>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>${report.summary}</p>
          </div>
          
          <div class="achievements">
            <h2>Key Achievements</h2>
            <p>${report.key_achievements}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin mb-2"></div>
              Loading reports...
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">
              No reports found for Q{quarter} {year}. Create a new report to get started.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(report.period_start)} - {formatDate(report.period_end)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {report.report_type}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.completed_inspections_count}
                  </div>
                  <div className="text-xs text-gray-600">Inspections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.compliance_rate}%
                  </div>
                  <div className="text-xs text-gray-600">Compliance</div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {report.summary}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDate(report.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {report.created_by_name}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(report)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Print
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} reports
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
