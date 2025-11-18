import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LayoutWithSidebar from '../components/LayoutWithSidebar';
import PaginationControls from '../components/PaginationControls';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { useLocalStoragePagination } from '../hooks/useLocalStoragePagination';
import {
  getDivisionReportData,
  exportDivisionReportPDF,
  exportDivisionReportExcel
} from '../services/api';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCcw,
  Eraser
} from 'lucide-react';
import { useNotifications } from '../components/NotificationManager';

export default function DivisionReports() {
  const notifications = useNotifications();
  
  // Ref to track if a request is in progress
  const fetchingRef = useRef(false);
  // Ref to store notifications to avoid dependency issues
  const notificationsRef = useRef(notifications);
  
  // Update notifications ref when it changes
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  
  // State for data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination
  const savedPagination = useLocalStoragePagination('division_reports');
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);
  
  // Filter state
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    establishment: '',
    law: 'ALL',
    compliance_status: 'ALL',
    inspection_status: 'ALL',
    has_nov: '',
    has_noo: ''
  });
  
  // Export loading states
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    action: null, // 'clear', 'exportPDF', 'exportExcel', 'print'
    loading: false
  });
  
  // Memoize filter params
  const filterParams = useMemo(() => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v !== 'ALL')
    );
    console.log('filterParams computed:', params);
    return params;
  }, [filters]);
  
  // Fetch data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Prevent multiple simultaneous requests
      if (fetchingRef.current) {
        console.log('Fetch already in progress, skipping...');
        return;
      }
      
      console.log('Starting fetchData...', { currentPage, pageSize, filterParams });
      fetchingRef.current = true;
      setLoading(true);
      
      try {
        // Prepare params
        const params = {
          page: currentPage,
          page_size: pageSize,
          ...filterParams
        };
        
        console.log('Fetching division reports with params:', params);
        console.log('API Base URL:', window.location.origin);
        
        // Fetch records
        let dataResponse;
        try {
          console.log('Making API call...');
          dataResponse = await getDivisionReportData(params);
          console.log('API call completed');
        } catch (apiError) {
          console.error('API Error details:', {
            message: apiError.message,
            response: apiError.response,
            status: apiError.response?.status,
            data: apiError.response?.data
          });
          throw apiError;
        }
        
        console.log('Division reports data response:', dataResponse);
        console.log('Division reports data response type:', typeof dataResponse);
        console.log('Is array?', Array.isArray(dataResponse));
        console.log('Has results?', dataResponse?.results);
        console.log('Has count?', dataResponse?.count);
        
        if (isMounted) {
          // Handle both paginated and non-paginated responses
          const records = Array.isArray(dataResponse) 
            ? dataResponse 
            : (dataResponse.results || []);
          const count = Array.isArray(dataResponse)
            ? dataResponse.length
            : (dataResponse.count || 0);
          
          console.log('Setting state with records:', records.length, 'count:', count);
          setRecords(records);
          setTotalCount(count);
          
          console.log('Processed records:', records);
          console.log('Total count:', count);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching division report data:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Use notificationsRef to avoid dependency issues
          if (notificationsRef.current && typeof notificationsRef.current.showNotification === 'function') {
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to fetch report data';
            notificationsRef.current.showNotification(errorMsg, 'error');
          }
          setRecords([]);
          setTotalCount(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchingRef.current = false;
          console.log('Fetch completed, loading set to false');
        }
      }
    };
    
    console.log('useEffect triggered', { currentPage, pageSize, filterParams });
    fetchData();
    
    return () => {
      isMounted = false;
      fetchingRef.current = false;
    };
  }, [currentPage, pageSize, filterParams]);
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Clear filters - with confirmation
  const handleClearFiltersClick = () => {
    setConfirmationDialog({
      open: true,
      action: 'clear',
      loading: false
    });
  };
  
  const handleClearFilters = async () => {
    try {
      setFilters({
        date_from: '',
        date_to: '',
        establishment: '',
        law: 'ALL',
        compliance_status: 'ALL',
        inspection_status: 'ALL',
        has_nov: '',
        has_noo: ''
      });
      setCurrentPage(1);
    } finally {
      // Always close dialog
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    // Force re-render by updating a dependency
    setFilters(prev => ({ ...prev }));
  }, []);
  
  // Export handlers - with confirmation
  const handleExportPDFClick = () => {
    setConfirmationDialog({
      open: true,
      action: 'exportPDF',
      loading: false
    });
  };
  
  const handleExportPDF = async () => {
    setConfirmationDialog(prev => ({ ...prev, loading: true }));
    setExportingPDF(true);
    try {
      await exportDivisionReportPDF(filterParams);
      notifications?.showNotification('PDF report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      notifications?.showNotification('Failed to export PDF report', 'error');
      throw error; // Re-throw to be caught by handleConfirmAction
    } finally {
      setExportingPDF(false);
      // Always close dialog and reset loading state
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  const handleExportExcelClick = () => {
    setConfirmationDialog({
      open: true,
      action: 'exportExcel',
      loading: false
    });
  };
  
  const handleExportExcel = async () => {
    setConfirmationDialog(prev => ({ ...prev, loading: true }));
    setExportingExcel(true);
    try {
      await exportDivisionReportExcel(filterParams);
      notifications?.showNotification('Excel report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      notifications?.showNotification('Failed to export Excel report', 'error');
      throw error; // Re-throw to be caught by handleConfirmAction
    } finally {
      setExportingExcel(false);
      // Always close dialog and reset loading state
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  const handlePrintClick = () => {
    setConfirmationDialog({
      open: true,
      action: 'print',
      loading: false
    });
  };
  
  const handlePrint = () => {
    window.print();
    setConfirmationDialog({ open: false, action: null, loading: false });
  };
  
  // Handle confirmation dialog actions
  const handleConfirmAction = async () => {
    try {
      switch (confirmationDialog.action) {
        case 'clear':
          await handleClearFilters();
          break;
        case 'exportPDF':
          await handleExportPDF();
          break;
        case 'exportExcel':
          await handleExportExcel();
          break;
        case 'print':
          handlePrint();
          break;
        default:
          setConfirmationDialog({ open: false, action: null, loading: false });
      }
    } catch (error) {
      console.error('Error in confirmation action:', error);
      // Ensure dialog closes even on error
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  const handleCancelAction = () => {
    setConfirmationDialog({ open: false, action: null, loading: false });
  };
  
  // Get confirmation dialog props based on action
  const getConfirmationProps = () => {
    switch (confirmationDialog.action) {
      case 'clear':
        return {
          title: 'Clear Filters',
          message: 'Are you sure you want to clear all filters? This will reset all filter values to their defaults.',
          confirmText: 'Clear Filters',
          cancelText: 'Cancel',
          confirmColor: 'sky',
          headerColor: 'sky'
        };
      case 'exportPDF':
        return {
          title: 'Export to PDF',
          message: 'This will generate and download a PDF report with the current filtered data. Do you want to continue?',
          confirmText: 'Export PDF',
          cancelText: 'Cancel',
          confirmColor: 'sky',
          headerColor: 'sky'
        };
      case 'exportExcel':
        return {
          title: 'Export to Excel',
          message: 'This will generate and download an Excel report with the current filtered data. Do you want to continue?',
          confirmText: 'Export Excel',
          cancelText: 'Cancel',
          confirmColor: 'sky',
          headerColor: 'sky'
        };
      case 'print':
        return {
          title: 'Print Report',
          message: 'This will open the print dialog for the current report. Do you want to continue?',
          confirmText: 'Print',
          cancelText: 'Cancel',
          confirmColor: 'sky',
          headerColor: 'sky'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          confirmColor: 'sky',
          headerColor: 'sky'
        };
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Button style constants (matching AuditLogs)
  const BUTTON_BASE = "inline-flex items-center justify-center gap-2 rounded px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";
  const BUTTON_SUBTLE = `${BUTTON_BASE} border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-sky-500`;
  const BUTTON_MUTED = `${BUTTON_BASE} border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-sky-500`;
  const BUTTON_PRIMARY = `${BUTTON_BASE} bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus:ring-sky-500`;
  const BUTTON_ACCENT = `${BUTTON_BASE} bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus:ring-sky-500`;
  const BUTTON_DANGER = `${BUTTON_BASE} bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500`;
  const BUTTON_SUCCESS = `${BUTTON_BASE} bg-green-600 text-white shadow-sm hover:bg-green-700 focus:ring-green-500`;

  const hasActiveFilters = Object.values(filterParams).some(v => v);
  const COLUMN_COUNT = 9;

  // Get establishment name from record
  const getEstablishmentName = (record) => {
    if (record.establishment_name) {
      return record.establishment_name;
    }
    if (record.establishments_detail && record.establishments_detail.length > 0) {
      return record.establishments_detail[0].name;
    }
    return 'N/A';
  };

  // Get compliance status from record
  const getComplianceStatus = (record) => {
    if (record.compliance_status) {
      return record.compliance_status;
    }
    return 'PENDING';
  };

  // Get has NOV/NOO
  const hasNOV = (record) => {
    return record.has_nov === true;
  };

  const hasNOO = (record) => {
    return record.has_noo === true;
  };

  // Get status display - show "Completed" for closed and section completed statuses
  const getStatusDisplay = (record) => {
    const status = record.simplified_status || record.current_status || '';
    if (status.includes('CLOSED') || status.includes('SECTION_COMPLETED')) {
      return 'Completed';
    }
    return status;
  };

  const pageContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-600">Division Report Generation</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className={BUTTON_SUBTLE}
            title="Refresh data"
            type="button"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleClearFiltersClick}
            className={BUTTON_MUTED}
            title="Clear filters"
            type="button"
          >
            <Eraser size={16} />
            Clear
          </button>
          <button
            onClick={handleExportPDFClick}
            disabled={exportingPDF || loading || confirmationDialog.loading}
            className={BUTTON_PRIMARY}
            title="Export to PDF"
            type="button"
          >
            <Download size={16} />
            {exportingPDF ? 'Exporting...' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportExcelClick}
            disabled={exportingExcel || loading || confirmationDialog.loading}
            className={BUTTON_SUCCESS}
            title="Export to Excel"
            type="button"
          >
            <FileSpreadsheet size={16} />
            {exportingExcel ? 'Exporting...' : 'Export Excel'}
          </button>
          <button
            onClick={handlePrintClick}
            disabled={confirmationDialog.loading}
            className={BUTTON_PRIMARY}
            title="Print view"
            type="button"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              max={filters.date_to || undefined}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              min={filters.date_from || undefined}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Establishment Name</label>
            <input
              type="text"
              value={filters.establishment}
              onChange={(e) => handleFilterChange('establishment', e.target.value)}
              placeholder="Search establishment..."
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Law Type</label>
            <select
              value={filters.law}
              onChange={(e) => handleFilterChange('law', e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Laws</option>
              <option value="PD-1586">PD 1586 - EIA</option>
              <option value="RA-8749">RA 8749 - Clean Air</option>
              <option value="RA-9275">RA 9275 - Clean Water</option>
              <option value="RA-6969">RA 6969 - Hazardous Waste</option>
              <option value="RA-9003">RA 9003 - Solid Waste</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Compliance Status</label>
            <select
              value={filters.compliance_status}
              onChange={(e) => handleFilterChange('compliance_status', e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Inspection Status</label>
            <select
              value={filters.inspection_status}
              onChange={(e) => handleFilterChange('inspection_status', e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="SECTION_ASSIGNED">Section Assigned</option>
              <option value="SECTION_COMPLETED_COMPLIANT">Section Completed (Compliant)</option>
              <option value="SECTION_COMPLETED_NON_COMPLIANT">Section Completed (Non-Compliant)</option>
              <option value="DIVISION_REVIEWED">Division Reviewed</option>
              <option value="LEGAL_REVIEW">Legal Review</option>
              <option value="CLOSED_COMPLIANT">Closed (Compliant)</option>
              <option value="CLOSED_NON_COMPLIANT">Closed (Non-Compliant)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <div className="custom-scrollbar max-h-[calc(100vh-360px)] overflow-y-auto">
            <table className="min-w-full">
              <thead>
                <tr className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-sky-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Inspection No.</th>
                  <th className="px-4 py-3">Establishment</th>
                  <th className="px-4 py-3">Law</th>
                  <th className="px-4 py-3">Inspection Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">NOV</th>
                  <th className="px-4 py-3">NOO</th>
                  <th className="px-4 py-3">Compliance</th>
                  <th className="px-4 py-3">Inspected By</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-600" />
                        <span className="text-sm text-gray-600">Loading inspection records...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-600">
                          {hasActiveFilters
                            ? 'No inspection records found. Try adjusting your filters or create new inspection records.'
                            : 'No inspection records exist yet. Inspection records are created by Division Chiefs.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const complianceStatus = getComplianceStatus(record);
                    const nov = hasNOV(record);
                    const noo = hasNOO(record);
                    return (
                      <tr
                        key={record.id}
                        className="cursor-pointer border-b border-gray-200 text-sm transition-colors hover:bg-sky-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-blue-600">
                          {record.code || 'N/A'}
                        </td>
                        <td className="min-w-[220px] px-4 py-3 text-gray-700">
                          {getEstablishmentName(record)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                          {record.law || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {formatDate(record.created_at)}
                        </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                            record.current_status === 'CLOSED_COMPLIANT' || record.current_status === 'SECTION_COMPLETED_COMPLIANT'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : record.current_status === 'CLOSED_NON_COMPLIANT' || record.current_status === 'SECTION_COMPLETED_NON_COMPLIANT'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {getStatusDisplay(record)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-center">
                        {nov ? (
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold text-lg">✗</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-center">
                        {noo ? (
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold text-lg">✗</span>
                        )}
                      </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                              complianceStatus === 'COMPLIANT'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : complianceStatus === 'NON_COMPLIANT'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {complianceStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {record.inspected_by_name || 'Not Inspected'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / pageSize)}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          startItem={totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          endItem={totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );

  const confirmationProps = getConfirmationProps();

  return (
    <>
      <Header />
      <LayoutWithSidebar>
        <div className="p-4">{pageContent}</div>
      </LayoutWithSidebar>
      <Footer />
      
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationProps.title}
        message={confirmationProps.message}
        confirmText={confirmationProps.confirmText}
        cancelText={confirmationProps.cancelText}
        confirmColor={confirmationProps.confirmColor}
        headerColor={confirmationProps.headerColor}
        loading={confirmationDialog.loading}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </>
  );
}

