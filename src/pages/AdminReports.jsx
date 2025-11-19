import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LayoutWithSidebar from '../components/LayoutWithSidebar';
import PaginationControls from '../components/PaginationControls';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { useLocalStoragePagination } from '../hooks/useLocalStoragePagination';
import {
  getAdminReportEstablishments,
  getAdminReportUsers,
  getAdminReportFilterOptions,
  exportAdminReportPDF,
  exportAdminReportExcel
} from '../services/api';
import {
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  Eraser,
  Building2,
  Users,
  X,
  Filter
} from 'lucide-react';
import { useNotifications } from '../components/NotificationManager';

export default function AdminReports() {
  const notifications = useNotifications();
  
  // Active tab: 'establishments' or 'users'
  const [activeTab, setActiveTab] = useState('establishments');
  
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
  
  // Filter options (for establishments)
  const [filterOptions, setFilterOptions] = useState({
    nature_of_business: [],
    provinces: [],
    barangays: []
  });
  
  // Pagination - separate for each tab
  const savedPaginationEstablishments = useLocalStoragePagination('admin_reports_establishments');
  const savedPaginationUsers = useLocalStoragePagination('admin_reports_users');
  const [currentPage, setCurrentPage] = useState(
    activeTab === 'establishments' ? savedPaginationEstablishments.page : savedPaginationUsers.page
  );
  const [pageSize, setPageSize] = useState(
    activeTab === 'establishments' ? savedPaginationEstablishments.pageSize : savedPaginationUsers.pageSize
  );
  
  // Filter state - separate for each tab (what user types)
  const [filtersEstablishments, setFiltersEstablishments] = useState({
    date_from: '',
    date_to: '',
    nature_of_business: 'ALL',
    province: 'ALL',
    barangay: 'ALL'
  });
  
  const [filtersUsers, setFiltersUsers] = useState({
    date_from: '',
    date_to: '',
    status_filter: 'created', // 'created' or 'updated'
    is_active: 'ALL' // 'ALL', 'true', 'false'
  });
  
  // Applied filter state - what filters are actually applied to the query
  const [appliedFiltersEstablishments, setAppliedFiltersEstablishments] = useState({
    date_from: '',
    date_to: '',
    nature_of_business: 'ALL',
    province: 'ALL',
    barangay: 'ALL'
  });
  
  const [appliedFiltersUsers, setAppliedFiltersUsers] = useState({
    date_from: '',
    date_to: '',
    status_filter: 'created',
    is_active: 'ALL'
  });
  
  // Refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Export loading states
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  
  // Generate report modal state
  const [generateReportModal, setGenerateReportModal] = useState({
    open: false
  });
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    action: null, // 'clear', 'exportPDF', 'exportExcel'
    loading: false
  });
  
  // Get current applied filters based on active tab
  const currentAppliedFilters = useMemo(() => {
    return activeTab === 'establishments' ? appliedFiltersEstablishments : appliedFiltersUsers;
  }, [activeTab, appliedFiltersEstablishments, appliedFiltersUsers]);
  
  // Memoize filter params from applied filters
  const filterParams = useMemo(() => {
    const params = Object.fromEntries(
      Object.entries(currentAppliedFilters).filter(([, v]) => v && v !== 'ALL')
    );
    return params;
  }, [currentAppliedFilters]);
  
  // Fetch filter options for establishments
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await getAdminReportFilterOptions({ province: filtersEstablishments.province });
        setFilterOptions(options);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    if (activeTab === 'establishments') {
      fetchFilterOptions();
    }
  }, [activeTab, filtersEstablishments.province]);
  
  // Fetch data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Prevent multiple simultaneous requests
      if (fetchingRef.current) {
        console.log('Fetch already in progress, skipping...');
        return;
      }
      
      fetchingRef.current = true;
      setLoading(true);
      
      try {
        // Prepare params
        const params = {
          page: currentPage,
          page_size: pageSize,
          ...filterParams
        };
        
        // Fetch records based on active tab
        let dataResponse;
        if (activeTab === 'establishments') {
          dataResponse = await getAdminReportEstablishments(params);
        } else {
          dataResponse = await getAdminReportUsers(params);
        }
        
        if (isMounted) {
          // Handle both paginated and non-paginated responses
          const records = Array.isArray(dataResponse) 
            ? dataResponse 
            : (dataResponse.results || []);
          const count = Array.isArray(dataResponse)
            ? dataResponse.length
            : (dataResponse.count || 0);
          
          setRecords(records);
          setTotalCount(count);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching admin report data:', error);
          if (notificationsRef.current && typeof notificationsRef.current.error === 'function') {
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to fetch report data';
            notificationsRef.current.error(errorMsg);
          }
          setRecords([]);
          setTotalCount(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      fetchingRef.current = false;
    };
  }, [activeTab, currentPage, pageSize, filterParams, refreshTrigger]);
  
  // Reset pagination when switching tabs
  useEffect(() => {
    if (activeTab === 'establishments') {
      setCurrentPage(savedPaginationEstablishments.page);
      setPageSize(savedPaginationEstablishments.pageSize);
    } else {
      setCurrentPage(savedPaginationUsers.page);
      setPageSize(savedPaginationUsers.pageSize);
    }
  }, [activeTab, savedPaginationEstablishments.page, savedPaginationEstablishments.pageSize, savedPaginationUsers.page, savedPaginationUsers.pageSize]);
  
  // Handle filter change (doesn't apply filters, just updates input)
  const handleFilterChange = (key, value) => {
    if (activeTab === 'establishments') {
      setFiltersEstablishments(prev => ({ ...prev, [key]: value }));
      // Reset barangay when province changes
      if (key === 'province') {
        setFiltersEstablishments(prev => ({ ...prev, [key]: value, barangay: 'ALL' }));
      }
    } else {
      setFiltersUsers(prev => ({ ...prev, [key]: value }));
    }
  };
  
  // Apply filters - copies filters to appliedFilters and triggers fetch
  const handleApplyFilters = () => {
    if (activeTab === 'establishments') {
      setAppliedFiltersEstablishments(filtersEstablishments);
    } else {
      setAppliedFiltersUsers(filtersUsers);
    }
    setCurrentPage(1); // Reset to first page when applying filters
    notifications?.success('Filters applied successfully');
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
      if (activeTab === 'establishments') {
        const clearedFilters = {
          date_from: '',
          date_to: '',
          nature_of_business: 'ALL',
          province: 'ALL',
          barangay: 'ALL'
        };
        setFiltersEstablishments(clearedFilters);
        setAppliedFiltersEstablishments(clearedFilters);
      } else {
        const clearedFilters = {
          date_from: '',
          date_to: '',
          status_filter: 'created',
          is_active: 'ALL'
        };
        setFiltersUsers(clearedFilters);
        setAppliedFiltersUsers(clearedFilters);
      }
      setCurrentPage(1);
      notifications?.info('Filters cleared successfully');
    } finally {
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    // Force refetch by incrementing refresh trigger
    setRefreshTrigger(prev => prev + 1);
    notifications?.info('Refreshing data...');
  }, [notifications]);
  
  // Generate report modal handlers
  const handleGenerateReportClick = () => {
    setGenerateReportModal({ open: true });
  };
  
  const handleCloseGenerateReportModal = () => {
    setGenerateReportModal({ open: false });
  };
  
  const handleSelectReportType = (type) => {
    handleCloseGenerateReportModal();
    
    // Open confirmation dialog based on type
    setConfirmationDialog({
      open: true,
      action: type,
      loading: false
    });
  };
  
  const handleExportPDF = async () => {
    setConfirmationDialog(prev => ({ ...prev, loading: true }));
    setExportingPDF(true);
    try {
      await exportAdminReportPDF(filterParams, activeTab);
      notifications?.success('PDF report exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      notifications?.error('Failed to export PDF report');
      throw error;
    } finally {
      setExportingPDF(false);
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
  };
  
  const handleExportExcel = async () => {
    setConfirmationDialog(prev => ({ ...prev, loading: true }));
    setExportingExcel(true);
    try {
      await exportAdminReportExcel(filterParams, activeTab);
      notifications?.success('Excel report exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      notifications?.error('Failed to export Excel report');
      throw error;
    } finally {
      setExportingExcel(false);
      setConfirmationDialog({ open: false, action: null, loading: false });
    }
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
        default:
          setConfirmationDialog({ open: false, action: null, loading: false });
      }
    } catch (error) {
      console.error('Error in confirmation action:', error);
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

  // Button style constants (removed rounded corners)
  const BUTTON_BASE = "inline-flex items-center justify-center gap-2 px-3 py-1 text-sm font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
  const BUTTON_SUBTLE = `${BUTTON_BASE} border border-gray-200 py-1.5 text-gray-700 hover:bg-gray-50`;
  const BUTTON_MUTED = `${BUTTON_BASE} border border-gray-200 text-gray-700 hover:bg-gray-50`;
  const BUTTON_PRIMARY = `${BUTTON_BASE} bg-sky-600 text-white hover:bg-sky-700`;

  const hasActiveFilters = Object.values(filterParams).some(v => v);
  
  // Get column count based on active tab
  const COLUMN_COUNT = activeTab === 'establishments' ? 7 : 7;

  // Render establishments filters
  const renderEstablishmentsFilters = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Date From</label>
        <input
          type="date"
          value={filtersEstablishments.date_from}
          max={filtersEstablishments.date_to || undefined}
          onChange={(e) => handleFilterChange('date_from', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Date To</label>
        <input
          type="date"
          value={filtersEstablishments.date_to}
          min={filtersEstablishments.date_from || undefined}
          onChange={(e) => handleFilterChange('date_to', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Nature of Business</label>
        <select
          value={filtersEstablishments.nature_of_business}
          onChange={(e) => handleFilterChange('nature_of_business', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="ALL">All</option>
          {filterOptions.nature_of_business?.map((option, idx) => (
            <option key={idx} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Province</label>
        <select
          value={filtersEstablishments.province}
          onChange={(e) => handleFilterChange('province', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="ALL">All Provinces</option>
          {filterOptions.provinces?.map((option, idx) => (
            <option key={idx} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Barangay</label>
        <select
          value={filtersEstablishments.barangay}
          onChange={(e) => handleFilterChange('barangay', e.target.value)}
          disabled={filtersEstablishments.province === 'ALL'}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="ALL">All Barangays</option>
          {filterOptions.barangays?.map((option, idx) => (
            <option key={idx} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 invisible">Apply</label>
        <button
          onClick={handleApplyFilters}
          className={`${BUTTON_PRIMARY} mt-1 py-2 rounded self-end`}
          title="Apply filters"
          type="button"
        >
          <Filter size={16} />
          Apply Filters
        </button>
      </div>
    </div>
  );
  
  // Render users filters
  const renderUsersFilters = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto_0]">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Date From</label>
        <input
          type="date"
          value={filtersUsers.date_from}
          max={filtersUsers.date_to || undefined}
          onChange={(e) => handleFilterChange('date_from', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Date To</label>
        <input
          type="date"
          value={filtersUsers.date_to}
          min={filtersUsers.date_from || undefined}
          onChange={(e) => handleFilterChange('date_to', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Status Filter</label>
        <select
          value={filtersUsers.status_filter}
          onChange={(e) => handleFilterChange('status_filter', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="created">Created</option>
          <option value="updated">Updated</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Active Status</label>
        <select
          value={filtersUsers.is_active}
          onChange={(e) => handleFilterChange('is_active', e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="ALL">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 invisible">Apply</label>
        <button
          onClick={handleApplyFilters}
          className={`${BUTTON_PRIMARY} mt-1 py-2 rounded self-end`}
          title="Apply filters"
          type="button"
        >
          <Filter size={16} />
          Apply Filters
        </button>
      </div>
    </div>
  );

  // Render establishments table
  const renderEstablishmentsTable = () => (
    <table className="min-w-full">
      <thead>
        <tr className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-sky-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Nature of Business</th>
          <th className="px-4 py-3">Province</th>
          <th className="px-4 py-3">City</th>
          <th className="px-4 py-3">Barangay</th>
          <th className="px-4 py-3">Date Added</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {loading ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="px-4 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-600" />
                <span className="text-sm text-gray-600">Loading establishment records...</span>
              </div>
            </td>
          </tr>
        ) : records.length === 0 ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">
                  {hasActiveFilters
                    ? 'No establishment records found. Try adjusting your filters or add new establishments.'
                    : 'No establishment records exist yet.'}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          records.map((record) => (
            <tr
              key={record.id}
              className="cursor-pointer border-b border-gray-200 text-sm transition-colors hover:bg-sky-50"
            >
              <td className="min-w-[220px] px-4 py-3 font-medium text-gray-900">
                {record.name || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {record.nature_of_business || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {record.province || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {record.city || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {record.barangay || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {formatDate(record.created_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                    record.is_active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {record.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Render users table
  const renderUsersTable = () => (
    <table className="min-w-full">
      <thead>
        <tr className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-sky-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">User Level</th>
          <th className="px-4 py-3">Section</th>
          <th className="px-4 py-3">Date Joined</th>
          <th className="px-4 py-3">Last Updated</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {loading ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="px-4 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-600" />
                <span className="text-sm text-gray-600">Loading user records...</span>
              </div>
            </td>
          </tr>
        ) : records.length === 0 ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">
                  {hasActiveFilters
                    ? 'No user records found. Try adjusting your filters or add new users.'
                    : 'No user records exist yet.'}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          records.map((record) => (
            <tr
              key={record.id}
              className="cursor-pointer border-b border-gray-200 text-sm transition-colors hover:bg-sky-50"
            >
              <td className="min-w-[220px] px-4 py-3 font-medium text-gray-900">
                {record.full_name || record.email || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {record.email || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {record.userlevel || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {record.section || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {formatDate(record.date_joined)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {formatDate(record.updated_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                    record.is_active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {record.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const pageContent = (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-600">Report</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Report Type:</label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="establishments">Establishments</option>
              <option value="users">Users</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className={BUTTON_SUBTLE}
            title="Refresh data"
            type="button"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleClearFiltersClick}
            className={BUTTON_MUTED}
            title="Clear filters"
            type="button"
          >
            <Eraser size={16} />
            Clear Filters
          </button>
          <button
            onClick={handleGenerateReportClick}
            disabled={loading || confirmationDialog.loading || records.length === 0}
            className={BUTTON_PRIMARY}
            title="Generate Report"
            type="button"
          >
            <Download size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        {activeTab === 'establishments' ? renderEstablishmentsFilters() : renderUsersFilters()}
      </div>

      {/* Table */}
      <div className="rounded border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <div className="custom-scrollbar max-h-[calc(100vh-360px)] overflow-y-auto">
            {activeTab === 'establishments' ? renderEstablishmentsTable() : renderUsersTable()}
          </div>
        </div>
      </div>

      {/* Pagination */}
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
      
      {/* Generate Report Modal */}
      {generateReportModal.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-sky-50 border-b border-sky-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Generate Report</h3>
                <button
                  onClick={handleCloseGenerateReportModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="mb-4 text-gray-600">Select the report type you want to generate:</p>
              
              {/* Report Type Options */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSelectReportType('exportPDF')}
                  disabled={loading || exportingPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 hover:bg-sky-50 hover:border-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 flex items-center justify-center">
                    <FileText size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">PDF Report</div>
                    <div className="text-sm text-gray-500">Export as PDF document</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSelectReportType('exportExcel')}
                  disabled={loading || exportingExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 hover:bg-sky-50 hover:border-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 flex items-center justify-center">
                    <FileSpreadsheet size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Excel Report</div>
                    <div className="text-sm text-gray-500">Export as Excel spreadsheet</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseGenerateReportModal}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 hover:bg-gray-300 font-medium"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
