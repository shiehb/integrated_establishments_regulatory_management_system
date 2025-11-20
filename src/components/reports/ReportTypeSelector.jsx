export default function ReportTypeSelector({ allowedReports, selectedReportType, onReportTypeChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
        Report Type
      </label>
      <select
        id="report-type"
        value={selectedReportType || ''}
        onChange={(e) => onReportTypeChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a report type</option>
        {allowedReports.map((report) => (
          <option key={report.report_type} value={report.report_type}>
            {report.display_name}
          </option>
        ))}
      </select>
    </div>
  );
}
