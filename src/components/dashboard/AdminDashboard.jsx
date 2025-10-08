import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  getEstablishments,
  getInspections,
  getActivityLogs,
} from "../../services/api";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  TrendingUp,
  Search,
  RefreshCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  PieChart
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";
import DateRangeDropdown from "../DateRangeDropdown";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import useDebounce from "../../hooks/useDebounce";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(false);
  
  // Activity table controls
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  // Inspection list controls
  const [isInspectionCollapsed, setIsInspectionCollapsed] = useState(false);
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState("");
  const [debouncedInspectionSearchTerm] = useDebounce(inspectionSearchTerm, 300);
  const [inspectionFiltersOpen, setInspectionFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [inspectionDateFrom, setInspectionDateFrom] = useState("");
  const [inspectionDateTo, setInspectionDateTo] = useState("");
  const [inspectionSortConfig, setInspectionSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [inspectionSortDropdownOpen, setInspectionSortDropdownOpen] = useState(false);
  
  // Pagination
  const { page: initialPage, pageSize: initialPageSize } = useLocalStoragePagination('dashboard_activity', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Inspection pagination
  const { page: initialInspectionPage, pageSize: initialInspectionPageSize } = useLocalStoragePagination('dashboard_inspection', 10);
  const [inspectionCurrentPage, setInspectionCurrentPage] = useState(initialInspectionPage);
  const [inspectionPageSize, setInspectionPageSize] = useState(initialInspectionPageSize);
  
  // Refs for dropdowns
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const inspectionSortDropdownRef = useRef(null);
  const inspectionFilterDropdownRef = useRef(null);

  // Summary statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEstablishments: 0,
    totalInspections: 0
  });

  // Compliance statistics
  const [complianceStats, setComplianceStats] = useState({
    compliant: 0,
    nonCompliant: 0,
    total: 0
  });
  
  // Activity log sorting and filtering
  const sortFields = [
    { key: 'created_at', label: 'Date' },
    { key: 'action', label: 'Action' },
    { key: 'message', label: 'Message' }
  ];
  
  const sortDirections = [
    { key: 'asc', label: 'Ascending' },
    { key: 'desc', label: 'Descending' }
  ];
  
  const actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'PRINT'
  ];
  
  // Inspection sorting and filtering
  const inspectionSortFields = [
    { key: 'created_at', label: 'Date' },
    { key: 'establishment_name', label: 'Establishment' },
    { key: 'status', label: 'Status' },
    { key: 'inspector_name', label: 'Inspector' }
  ];
  
  const statusOptions = [
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED'
  ];

  useEffect(() => {
    fetchUsers();
    fetchEstablishments();
    fetchInspections();
    fetchActivityLogs();
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFiltersOpen(false);
      }
      if (inspectionSortDropdownRef.current && !inspectionSortDropdownRef.current.contains(event.target)) {
        setInspectionSortDropdownOpen(false);
      }
      if (inspectionFilterDropdownRef.current && !inspectionFilterDropdownRef.current.contains(event.target)) {
        setInspectionFiltersOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Save pagination to localStorage
  useEffect(() => {
    const paginationData = {
      page: currentPage,
      pageSize: pageSize,
      timestamp: Date.now()
    };
    localStorage.setItem('dashboard_activity_pagination', JSON.stringify(paginationData));
  }, [currentPage, pageSize]);
  
  // Save inspection pagination to localStorage
  useEffect(() => {
    const paginationData = {
      page: inspectionCurrentPage,
      pageSize: inspectionPageSize,
      timestamp: Date.now()
    };
    localStorage.setItem('dashboard_inspection_pagination', JSON.stringify(paginationData));
  }, [inspectionCurrentPage, inspectionPageSize]);

  // 🔹 Users
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Ensure response is an array - handle different response structures
      const users = Array.isArray(response) ? response : (response.results || []);
      setStats(prev => ({ ...prev, totalUsers: users.length }));
    } catch (err) {
      console.error("Error fetching users:", err);
      // Set fallback count if API fails
      setStats(prev => ({ ...prev, totalUsers: 0 }));
    }
  };

  // 🔹 Establishments
  const fetchEstablishments = async () => {
    try {
      const response = await getEstablishments({ page: 1, page_size: 10000 });
      // Ensure response is an array - handle different response structures
      const data = Array.isArray(response) ? response : (response.results || []);
      setStats(prev => ({ ...prev, totalEstablishments: data.length }));
    } catch (err) {
      console.error("Error fetching establishments:", err);
      setStats(prev => ({ ...prev, totalEstablishments: 0 }));
    }
  };

  // 🔹 Inspections
  const fetchInspections = async () => {
    try {
      const response = await getInspections({ page: 1, page_size: 10000 });
      // Ensure response is an array - handle different response structures
      const data = Array.isArray(response) ? response : (response.results || []);
      setInspections(data);
      setStats(prev => ({ ...prev, totalInspections: data.length }));
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setInspections([]);
      setStats(prev => ({ ...prev, totalInspections: 0 }));
    }
  };

  // 🔹 Activity Logs
  const fetchActivityLogs = async () => {
    try {
      const response = await getActivityLogs();
      // Ensure response is an array - handle different response structures
      const logs = Array.isArray(response) ? response : (response.results || []);
      setActivityLog(logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setActivityLog([]);
    }
  };

  // Filter and sort activity logs
  const filteredActivityLog = useMemo(() => {
    let filtered = activityLog.filter(log => {
      const searchTerm = debouncedSearchTerm || '';
      const matchesSearch = searchTerm === '' || 
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAction = actionFilter === '' || 
        (log.action && log.action.toUpperCase() === actionFilter);
      
      const matchesDate = !dateFrom || !dateTo || 
        (log.created_at && new Date(log.created_at) >= new Date(dateFrom) && 
         new Date(log.created_at) <= new Date(dateTo));
      
      return matchesSearch && matchesAction && matchesDate;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
      
      if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [activityLog, debouncedSearchTerm, actionFilter, dateFrom, dateTo, sortConfig]);

  // Filter and sort inspections
  const filteredInspections = useMemo(() => {
    let filtered = inspections.filter(inspection => {
      const searchTerm = debouncedInspectionSearchTerm || '';
      const matchesSearch = searchTerm === '' || 
        (inspection.establishment_name && inspection.establishment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inspection.inspector_name && inspection.inspector_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inspection.status && inspection.status.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === '' || 
        (inspection.status && inspection.status.toUpperCase() === statusFilter);
      
      const matchesDate = !inspectionDateFrom || !inspectionDateTo || 
        (inspection.created_at && new Date(inspection.created_at) >= new Date(inspectionDateFrom) && 
         new Date(inspection.created_at) <= new Date(inspectionDateTo));
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[inspectionSortConfig.key];
      let bVal = b[inspectionSortConfig.key];
      
      // Handle undefined/null values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return inspectionSortConfig.direction === 'asc' ? 1 : -1;
      if (bVal == null) return inspectionSortConfig.direction === 'asc' ? -1 : 1;
      
      if (inspectionSortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (inspectionSortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [inspections, debouncedInspectionSearchTerm, statusFilter, inspectionDateFrom, inspectionDateTo, inspectionSortConfig]);

  // Calculate compliance statistics
  const complianceData = useMemo(() => {
    const completedInspections = inspections.filter(inspection => 
      inspection.status === 'COMPLETED' || inspection.status === 'APPROVED' || inspection.status === 'REJECTED'
    );
    
    const compliant = completedInspections.filter(inspection => 
      inspection.status === 'COMPLETED' || inspection.status === 'APPROVED'
    ).length;
    
    const nonCompliant = completedInspections.filter(inspection => 
      inspection.status === 'REJECTED'
    ).length;
    
    const total = compliant + nonCompliant;
    
    setComplianceStats({ compliant, nonCompliant, total });
    
    return {
      labels: ['Compliant', 'Non-Compliant'],
      datasets: [
        {
          data: [complianceStats.compliant, complianceStats.nonCompliant],
          backgroundColor: [
            '#10B981', // Green for compliant
            '#EF4444', // Red for non-compliant
          ],
          borderColor: [
            '#059669',
            '#DC2626',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [inspections, complianceStats.compliant, complianceStats.nonCompliant]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredActivityLog.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivities = filteredActivityLog.slice(startIndex, endIndex);
  
  // Inspection pagination calculations
  const inspectionTotalPages = Math.ceil(filteredInspections.length / inspectionPageSize);
  const inspectionStartIndex = (inspectionCurrentPage - 1) * inspectionPageSize;
  const inspectionEndIndex = inspectionStartIndex + inspectionPageSize;
  const paginatedInspections = filteredInspections.slice(inspectionStartIndex, inspectionEndIndex);

  // Helper functions
  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };
  
  const getInspectionSortIcon = (key) => {
    if (inspectionSortConfig.key !== key) return null;
    return inspectionSortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };
  
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
  };
  
  const clearInspectionSearch = () => {
    setInspectionSearchTerm('');
  };
  
  const clearAllInspectionFilters = () => {
    setInspectionSearchTerm('');
    setStatusFilter('');
    setInspectionDateFrom('');
    setInspectionDateTo('');
  };
  
  const handleSortFromDropdown = (field, direction) => {
    setSortConfig({ key: field, direction });
    setSortDropdownOpen(false);
  };
  
  const handleInspectionSort = (key) => {
    setInspectionSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleInspectionSortFromDropdown = (field, direction) => {
    setInspectionSortConfig({ key: field, direction });
    setInspectionSortDropdownOpen(false);
  };
  
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToInspectionPage = (page) => {
    setInspectionCurrentPage(page);
  };
  
  // Navigation handlers
  const handleViewAll = (route) => {
    navigate(route);
  };

  // Summary Cards Component
  const SummaryCard = ({ title, value, icon, color, route }) => (
    <div 
      className={`bg-white border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${color}`}
      onClick={() => handleViewAll(route)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color.includes('bg-green') ? 'bg-green-100' : color.includes('bg-pink') ? 'bg-pink-100' : color.includes('bg-orange') ? 'bg-orange-100' : color.includes('bg-purple') ? 'bg-purple-100' : color.includes('bg-yellow') ? 'bg-yellow-100' : 'bg-blue-100'}`}>
          {icon}
        </div>
        <div className="flex items-center text-gray-500 hover:text-gray-700">
          <span className="text-sm mr-1">view all</span>
          <TrendingUp size={16} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );


  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-158px)]">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Users"
          value={stats.totalUsers}
          icon={<Users size={24} className="text-green-600" />}
          color="bg-green-50 border-green-200"
          route="/users"
        />
        <SummaryCard
          title="Establishments"
          value={stats.totalEstablishments}
          icon={<Building2 size={24} className="text-pink-600" />}
          color="bg-pink-50 border-pink-200"
          route="/establishments"
        />
        <SummaryCard
          title="Inspections"
          value={stats.totalInspections}
          icon={<ClipboardList size={24} className="text-orange-600" />}
          color="bg-orange-50 border-orange-200"
          route="/inspections"
        />
      </div>

      {/* Activity and Compliance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Activity Panel - spans 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg shadow-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {filteredActivityLog.length} total
            </span>
          </div>
          <button
            onClick={() => setIsActivityCollapsed(!isActivityCollapsed)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            {isActivityCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Search and Controls */}
        {!isActivityCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <SortAsc size={14} className="mr-1" />
                    Sort
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">Sort by:</div>
                        {sortFields.map(field => (
                          <div key={field.key} className="mb-1">
                            <div className="text-xs font-medium text-gray-700 mb-1">{field.label}:</div>
                            {sortDirections.map(dir => (
                              <button
                                key={dir.key}
                                onClick={() => handleSortFromDropdown(field.key, dir.key)}
                                className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                  sortConfig.key === field.key && sortConfig.direction === dir.key ? 'bg-blue-100 text-blue-700' : ''
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Filter size={14} className="mr-1" />
                    Filter
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                  {filtersOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2">Action:</div>
                        <select
                          value={actionFilter}
                          onChange={(e) => setActionFilter(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="">All Actions</option>
                          {actionOptions.map(action => (
                            <option key={action} value={action}>{action}</option>
                          ))}
                        </select>
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Date Range */}
                <DateRangeDropdown
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                  onClear={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="flex items-center text-sm"
                />
                
                {/* Export */}
                <ExportDropdown
                  title="Activity Export Report"
                  fileName="activity_export"
                  columns={["Date", "Action", "Message"]}
                  rows={filteredActivityLog.map(activity => [
                    formatFullDate(activity.created_at),
                    activity.action || 'N/A',
                    activity.message || 'N/A'
                  ])}
                  disabled={filteredActivityLog.length === 0}
                  className="flex items-center text-sm"
                />
                
                {/* Print */}
                <PrintPDF
                  title="Activity Report"
                  fileName="activity_report"
                  columns={["Date", "Action", "Message"]}
                  rows={filteredActivityLog.map(activity => [
                    formatFullDate(activity.created_at),
                    activity.action || 'N/A',
                    activity.message || 'N/A'
                  ])}
                  selectedCount={0}
                  disabled={filteredActivityLog.length === 0}
                  className="flex items-center px-3 py-1 text-sm"
                />
                
                {/* Refresh */}
                <button
                  onClick={fetchActivityLogs}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
          </div>
        )}

        {/* Activity Table */}
        {!isActivityCollapsed && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  {[
                    { key: "created_at", label: "Date", sortable: true },
                    { key: "action", label: "Action", sortable: true },
                    { key: "message", label: "Message", sortable: true },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={`p-1 border-b border-gray-300 ${
                        col.sortable ? "cursor-pointer" : ""
                      }`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {col.label} {col.sortable && getSortIcon(col.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((log, index) => (
                    <tr
                      key={log.id || index}
                      className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-2 font-semibold border-b border-gray-300">
                        <div className="flex items-center">
                          <RotateCcw size={14} className="text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 text-center border-b border-gray-300 w-28">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs w-18 font-semibold border border-gray-400 rounded">
                          <span className="text-blue-700">{log.action || 'N/A'}</span>
                        </span>
                      </td>
                      <td className="px-2 border-b border-gray-300">
                        {log.message || 'No message'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-2 py-8 text-center text-gray-500 border-b border-gray-300">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!isActivityCollapsed && filteredActivityLog.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredActivityLog.length}
              showingStart={startIndex + 1}
              showingEnd={Math.min(endIndex, filteredActivityLog.length)}
            />
          </div>
        )}
          </div>
        </div>

        {/* Compliance Chart Panel - spans 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg shadow-sm h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">Compliance Status</h3>
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {complianceStats.total} completed
                </span>
              </div>
              <PieChart size={20} className="text-gray-500" />
            </div>

            {/* Chart Content */}
            <div className="p-4">
              {complianceStats.total > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48">
                      <Pie 
                        data={complianceData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                  size: 12
                                }
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Compliant</span>
                      </div>
                      <span className="text-sm font-bold text-green-800">{complianceStats.compliant}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <XCircle size={16} className="text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-800">Non-Compliant</span>
                      </div>
                      <span className="text-sm font-bold text-red-800">{complianceStats.nonCompliant}</span>
                    </div>
                  </div>

                  {/* Compliance Rate */}
                  <div className="text-center pt-2 border-t border-gray-200">
                    <div className="text-2xl font-bold text-gray-800">
                      {complianceStats.total > 0 ? ((complianceStats.compliant / complianceStats.total) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Compliance Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No completed inspections to analyze</p>
                  <p className="text-gray-400 text-xs mt-1">Complete some inspections to see compliance stats</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Panel */}
      <div className="bg-white border rounded-lg shadow-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Inspections</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {filteredInspections.length} total
            </span>
          </div>
          <button
            onClick={() => setIsInspectionCollapsed(!isInspectionCollapsed)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            {isInspectionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Search and Controls */}
        {!isInspectionCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  value={inspectionSearchTerm}
                  onChange={(e) => setInspectionSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {inspectionSearchTerm && (
                  <button
                    onClick={clearInspectionSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative" ref={inspectionSortDropdownRef}>
                  <button
                    onClick={() => setInspectionSortDropdownOpen(!inspectionSortDropdownOpen)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <SortAsc size={14} className="mr-1" />
                    Sort
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                  {inspectionSortDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">Sort by:</div>
                        {inspectionSortFields.map(field => (
                          <div key={field.key} className="mb-1">
                            <div className="text-xs font-medium text-gray-700 mb-1">{field.label}:</div>
                            {sortDirections.map(dir => (
                              <button
                                key={dir.key}
                                onClick={() => handleInspectionSortFromDropdown(field.key, dir.key)}
                                className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                  inspectionSortConfig.key === field.key && inspectionSortConfig.direction === dir.key ? 'bg-blue-100 text-blue-700' : ''
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative" ref={inspectionFilterDropdownRef}>
                  <button
                    onClick={() => setInspectionFiltersOpen(!inspectionFiltersOpen)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Filter size={14} className="mr-1" />
                    Filter
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                  {inspectionFiltersOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2">Status:</div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="">All Statuses</option>
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          onClick={clearAllInspectionFilters}
                          className="mt-2 w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Date Range */}
                <DateRangeDropdown
                  dateFrom={inspectionDateFrom}
                  dateTo={inspectionDateTo}
                  onDateFromChange={setInspectionDateFrom}
                  onDateToChange={setInspectionDateTo}
                  onClear={() => {
                    setInspectionDateFrom("");
                    setInspectionDateTo("");
                  }}
                  className="flex items-center text-sm"
                />
                
                {/* Export */}
                <ExportDropdown
                  title="Inspection Export Report"
                  fileName="inspection_export"
                  columns={["Date", "Establishment", "Inspector", "Status"]}
                  rows={filteredInspections.map(inspection => [
                    formatFullDate(inspection.created_at),
                    inspection.establishment_name || 'N/A',
                    inspection.inspector_name || 'N/A',
                    inspection.status || 'N/A'
                  ])}
                  disabled={filteredInspections.length === 0}
                  className="flex items-center text-sm"
                />
                
                {/* Print */}
                <PrintPDF
                  title="Inspection Report"
                  fileName="inspection_report"
                  columns={["Date", "Establishment", "Inspector", "Status"]}
                  rows={filteredInspections.map(inspection => [
                    formatFullDate(inspection.created_at),
                    inspection.establishment_name || 'N/A',
                    inspection.inspector_name || 'N/A',
                    inspection.status || 'N/A'
                  ])}
                  selectedCount={0}
                  disabled={filteredInspections.length === 0}
                  className="flex items-center px-3 py-1 text-sm"
                />
                
                {/* Refresh */}
                <button
                  onClick={fetchInspections}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
          </div>
        )}

        {/* Inspection Table */}
        {!isInspectionCollapsed && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  {[
                    { key: "created_at", label: "Date", sortable: true },
                    { key: "establishment_name", label: "Establishment", sortable: true },
                    { key: "inspector_name", label: "Inspector", sortable: true },
                    { key: "status", label: "Status", sortable: true },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={`p-1 border-b border-gray-300 ${
                        col.sortable ? "cursor-pointer" : ""
                      }`}
                      onClick={col.sortable ? () => handleInspectionSort(col.key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {col.label} {col.sortable && getInspectionSortIcon(col.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedInspections.length > 0 ? (
                  paginatedInspections.map((inspection, index) => (
                    <tr
                      key={inspection.id || index}
                      className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-2 font-semibold border-b border-gray-300">
                        <div className="flex items-center">
                          <ClipboardList size={14} className="text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(inspection.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(inspection.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 border-b border-gray-300">
                        <div className="font-medium text-gray-900">
                          {inspection.establishment_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 border-b border-gray-300">
                        <div className="font-medium text-gray-900">
                          {inspection.inspector_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 text-center border-b border-gray-300 w-28">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs w-18 font-semibold border rounded ${
                          inspection.status === 'COMPLETED' ? 'border-green-400 bg-green-100 text-green-700' :
                          inspection.status === 'IN_PROGRESS' ? 'border-blue-400 bg-blue-100 text-blue-700' :
                          inspection.status === 'PENDING' ? 'border-yellow-400 bg-yellow-100 text-yellow-700' :
                          inspection.status === 'REVIEWED' ? 'border-purple-400 bg-purple-100 text-purple-700' :
                          inspection.status === 'APPROVED' ? 'border-green-400 bg-green-100 text-green-700' :
                          inspection.status === 'REJECTED' ? 'border-red-400 bg-red-100 text-red-700' :
                          'border-gray-400 bg-gray-100 text-gray-700'
                        }`}>
                          {inspection.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-2 py-8 text-center text-gray-500 border-b border-gray-300">
                      No inspections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Inspection Pagination */}
        {!isInspectionCollapsed && filteredInspections.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <PaginationControls
              currentPage={inspectionCurrentPage}
              totalPages={inspectionTotalPages}
              onPageChange={goToInspectionPage}
              pageSize={inspectionPageSize}
              onPageSizeChange={setInspectionPageSize}
              totalItems={filteredInspections.length}
              showingStart={inspectionStartIndex + 1}
              showingEnd={Math.min(inspectionEndIndex, filteredInspections.length)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
