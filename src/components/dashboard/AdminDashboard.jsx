import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getActivityLogs,
  getInspections,
} from "../../services/api";
import {
  Users, 
  Building2, 
  ClipboardList, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  UserPlus,
  FileText,
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDashboardData } from "./shared/useDashboardData";
import { useComplianceChart } from "./shared/useComplianceChart";
import LoadingSkeleton from "./shared/LoadingSkeleton";
import SummaryCard from "./shared/SummaryCard";
import ComplianceCard from "./shared/ComplianceCard";
import QuarterlyComparisonCard from "./shared/QuarterlyComparisonCard";
import ComplianceByLawCard from "./shared/ComplianceByLawCard";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";
import DateRangeDropdown from "../DateRangeDropdown";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Status display mapping based on backend - COMPLETE MAPPING
const getInspectionStatusDisplay = (status) => {
  const statusMap = {
    // Initial creation
    'CREATED': 'Created',
    
    // Section Chief workflow
    'SECTION_ASSIGNED': 'New – Waiting for Action',
    'SECTION_IN_PROGRESS': 'In Progress',
    'SECTION_COMPLETED_COMPLIANT': 'Completed – Compliant',
    'SECTION_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
    
    // Unit Head workflow
    'UNIT_ASSIGNED': 'New – Waiting for Action',
    'UNIT_IN_PROGRESS': 'In Progress',
    'UNIT_COMPLETED_COMPLIANT': 'Completed – Compliant',
    'UNIT_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
    
    // Monitoring Personnel workflow
    'MONITORING_ASSIGNED': 'New – Waiting for Action',
    'MONITORING_IN_PROGRESS': 'In Progress',
    'MONITORING_COMPLETED_COMPLIANT': 'Completed – Compliant',
    'MONITORING_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
    
    // Review workflow (compliant path)
    'UNIT_REVIEWED': 'Reviewed',
    'SECTION_REVIEWED': 'Reviewed',
    'DIVISION_REVIEWED': 'For Legal Review',
    
    // Legal workflow (non-compliant path)
    'LEGAL_REVIEW': 'For Legal Review',
    'NOV_SENT': 'NOV Sent',
    'NOO_SENT': 'NOO Sent',
    
    // Final states
    'FINALIZED': 'Finalized',
    'CLOSED': 'Closed',
    'CLOSED_COMPLIANT': 'Closed',
    'CLOSED_NON_COMPLIANT': 'Closed',
  };
  
  return statusMap[status] || status;
};

// Status badge with proper colors
const getInspectionStatusBadge = (status) => {
  const displayName = getInspectionStatusDisplay(status);
  
  const config = {
    'Created': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    'New – Waiting for Action': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    'Completed – Compliant': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    'Completed – Non-Compliant': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    'Reviewed': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    'For Legal Review': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    'NOV Sent': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    'NOO Sent': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    'Finalized': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
    'Closed': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  };
  
  const style = config[displayName] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  
  return (
    <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-semibold border rounded w-45 ${style.bg} ${style.text} ${style.border}`}>
      {displayName}
    </span>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(() => {
    const saved = localStorage.getItem('dashboard_activity_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Inspection list controls
  const [isInspectionCollapsed, setIsInspectionCollapsed] = useState(() => {
    const saved = localStorage.getItem('dashboard_inspection_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Pagination
  const { page: initialPage, pageSize: initialPageSize } = useLocalStoragePagination('dashboard_activity', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Inspection pagination
  const { page: initialInspectionPage, pageSize: initialInspectionPageSize } = useLocalStoragePagination('dashboard_inspection', 10);
  const [inspectionCurrentPage, setInspectionCurrentPage] = useState(initialInspectionPage);
  const [inspectionPageSize, setInspectionPageSize] = useState(initialInspectionPageSize);

  // Loading states
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isInspectionLoading, setIsInspectionLoading] = useState(false);

  // Inspection controls - following UsersList pattern
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState('');
  const [inspectionSortBy, setInspectionSortBy] = useState('date');
  const [inspectionSortOrder, setInspectionSortOrder] = useState('desc');
  const [inspectionSortOpen, setInspectionSortOpen] = useState(false);
  const [inspectionFilterOpen, setInspectionFilterOpen] = useState(false);
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState([]);
  const [inspectionDateFrom, setInspectionDateFrom] = useState('');
  const [inspectionDateTo, setInspectionDateTo] = useState('');

  // Activity controls - following UsersList pattern
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activitySortOpen, setActivitySortOpen] = useState(false);
  const [activityFilterOpen, setActivityFilterOpen] = useState(false);
  const [activityActionFilter, setActivityActionFilter] = useState([]);
  const [activityDateFrom, setActivityDateFrom] = useState('');
  const [activityDateTo, setActivityDateTo] = useState('');

  // Use shared dashboard data hook (no role parameter for admin - sees all data)
  const { isLoading, stats, complianceStats, quarterlyData, refetch } = useDashboardData();
  
  // Use shared compliance chart hook
  const complianceData = useComplianceChart(complianceStats);
  
  



  // Initialize dashboard - fetch additional data not covered by shared hook
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchActivityLogs(),
          fetchInspections()
        ]);
      } catch (err) {
        console.error("Error initializing dashboard:", err);
      }
    };
    
    initializeDashboard();
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

  // Save dropdown states to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_activity_collapsed', JSON.stringify(isActivityCollapsed));
  }, [isActivityCollapsed]);

  useEffect(() => {
    localStorage.setItem('dashboard_inspection_collapsed', JSON.stringify(isInspectionCollapsed));
  }, [isInspectionCollapsed]);


  // 🔹 Inspections
  const fetchInspections = async () => {
    setIsInspectionLoading(true);
    try {
      const response = await getInspections({ page: 1, page_size: 10000 });
      // Ensure response is an array - handle different response structures
      const data = Array.isArray(response) ? response : (response.results || []);
      setInspections(data);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setInspections([]);
    } finally {
      setIsInspectionLoading(false);
    }
  };

  // 🔹 Activity Logs
  const fetchActivityLogs = async () => {
    setIsActivityLoading(true);
    try {
      const response = await getActivityLogs();
      // Ensure response is an array - handle different response structures
      const logs = Array.isArray(response) ? response : (response.results || []);
      setActivityLog(logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setActivityLog([]);
    } finally {
      setIsActivityLoading(false);
    }
  };


  // Activity filtering
  const filteredActivityLog = useMemo(() => {
    let filtered = [...activityLog];

    // Search filter
    if (activitySearchTerm) {
      const term = activitySearchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term)
      );
    }

    // Action filter (array-based)
    if (activityActionFilter.length > 0) {
      filtered = filtered.filter(log => 
        activityActionFilter.includes(log.action?.toLowerCase())
      );
    }

    // Date filter
    if (activityDateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= new Date(activityDateFrom)
      );
    }
    if (activityDateTo) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) <= new Date(activityDateTo)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activityLog, activitySearchTerm, activityActionFilter, activityDateFrom, activityDateTo]);

  // Inspection filtering and sorting
  const filteredInspections = useMemo(() => {
    let filtered = [...inspections];

    // Search filter
    if (inspectionSearchTerm) {
      const term = inspectionSearchTerm.toLowerCase();
      filtered = filtered.filter(inspection => 
        inspection.establishments_detail?.[0]?.name?.toLowerCase().includes(term) ||
        inspection.assigned_to_name?.toLowerCase().includes(term) ||
        inspection.code?.toLowerCase().includes(term) ||
        inspection.current_status?.toLowerCase().includes(term)
      );
    }

    // Status filter (array-based)
    if (inspectionStatusFilter.length > 0) {
      filtered = filtered.filter(inspection => 
        inspectionStatusFilter.includes(inspection.current_status)
      );
    }

    // Date range filter
    if (inspectionDateFrom) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.created_at) >= new Date(inspectionDateFrom + 'T00:00:00')
      );
    }
    if (inspectionDateTo) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.created_at) <= new Date(inspectionDateTo + 'T23:59:59')
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      if (inspectionSortBy === 'date') {
        compareA = new Date(a.created_at);
        compareB = new Date(b.created_at);
      } else if (inspectionSortBy === 'status') {
        compareA = a.current_status || '';
        compareB = b.current_status || '';
      } else if (inspectionSortBy === 'establishment') {
        compareA = a.establishments_detail?.[0]?.name || '';
        compareB = b.establishments_detail?.[0]?.name || '';
      } else if (inspectionSortBy === 'inspector') {
        compareA = a.assigned_to_name || '';
        compareB = b.assigned_to_name || '';
      }

      if (inspectionSortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    return filtered;
  }, [inspections, inspectionSearchTerm, inspectionStatusFilter, inspectionDateFrom, inspectionDateTo, inspectionSortBy, inspectionSortOrder]);

  
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


  
  
  
  
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToInspectionPage = (page) => {
    setInspectionCurrentPage(page);
  };

  // Sorting handlers
  const handleInspectionSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setInspectionSortBy(fieldKey);
      setInspectionSortOrder(directionKey || 'asc');
    } else {
      setInspectionSortBy('date');
      setInspectionSortOrder('desc');
    }
  };
  
  // Navigation handlers
  const handleViewAll = (route) => {
    navigate(route);
  };

  // Helper functions for dropdowns and filters
  const toggleInspectionStatusFilter = (status) => {
    setInspectionStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleActivityActionFilter = (action) => {
    setActivityActionFilter((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const inspectionActiveFilterCount = 
    inspectionStatusFilter.length +
    (inspectionDateFrom ? 1 : 0) +
    (inspectionDateTo ? 1 : 0);

  const activityActiveFilterCount = 
    activityActionFilter.length +
    (activityDateFrom ? 1 : 0) +
    (activityDateTo ? 1 : 0);


  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (inspectionSortOpen && !e.target.closest(".sort-dropdown")) {
        setInspectionSortOpen(false);
      }
      if (inspectionFilterOpen && !e.target.closest(".filter-dropdown")) {
        setInspectionFilterOpen(false);
      }
      if (activitySortOpen && !e.target.closest(".sort-dropdown")) {
        setActivitySortOpen(false);
      }
      if (activityFilterOpen && !e.target.closest(".filter-dropdown")) {
        setActivityFilterOpen(false);
      }
    }

    if (inspectionSortOpen || inspectionFilterOpen || activitySortOpen || activityFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inspectionSortOpen, inspectionFilterOpen, activitySortOpen, activityFilterOpen]);


  return (
    <div className="p-4 bg-gray-50">
      {/* Main Grid - 5 Column Layout */}
      <div className="grid grid-cols-5 grid-rows-2 gap-2 mb-6">
        {/* Cell 1: Establishments Card */}
        <div>
          <SummaryCard
            title="Establishments"
            value={stats.totalEstablishments}
            icon={<Building2 size={24} className="text-sky-700" />}
            color="bg-sky-50 border-sky-200"
            route="/establishments"
            quickAction={{
              icon: <Plus size={16} className="text-sky-700" />,
              route: "/establishments/add",
              tooltip: "Add New Establishment"
            }}
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 2: Users Card */}
        <div>
          <SummaryCard
            title="Users"
            value={stats.totalUsers}
            icon={<Users size={24} className="text-sky-600" />}
            color="bg-sky-50 border-sky-200"
            route="/users"
            quickAction={{
              icon: <UserPlus size={16} className="text-sky-600" />,
              route: "/users/add",
              tooltip: "Add New User"
            }}
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 3: Total Inspections in Current Quarter Year */}
        <div>
          <SummaryCard
            title="Compliance Monitoring"
            value={quarterlyData.current_quarter?.total_finished || 0}
            icon={<ClipboardList size={24} className="text-sky-800" />}
            color="bg-sky-50 border-sky-200"
            route="/inspections"
            quickAction={{
              icon: <FileText size={16} className="text-sky-800" />,
              route: "/inspections/add",
              tooltip: "Add New Inspection"
            }}
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 4: Quarterly Trend (spans 3 columns in row 2) */}
        <div className="col-span-3 col-start-1 row-start-2">
          <QuarterlyComparisonCard
            data={quarterlyData}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>

        {/* Cell 5: Compliance Status (spans 2 rows, starts at column 4) */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-1">
          <ComplianceCard
            stats={complianceStats}
            chartData={complianceData}
            isLoading={isLoading}
            onViewAll={handleViewAll}
          />
        </div>
      </div>

      {/* Third Row - Compliance by Law Chart */}
      <div className="mb-6">
        <ComplianceByLawCard
          userRole={null} // Admin sees all data
          onViewAll={handleViewAll}
        />
      </div>
      
      {/* Second Grid - Activity and Inspection Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Recent Activity Panel */}
        <div>
        {/* Panel Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 shadow">
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

        {/* Advanced Controls - Following UsersList Pattern */}
        {!isActivityCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {activitySearchTerm && (
                  <button
                    onClick={() => setActivitySearchTerm('')}
                    className="absolute -translate-y-1/2 right-3 top-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setActivitySortOpen(!activitySortOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Sort by
                  <ChevronDown size={14} />
                </button>

                {activitySortOpen && (
                  <div className="absolute right-0 top-full z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Sort Options
                      </div>
                      
                      {/* Sort Fields */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-sky-600 uppercase tracking-wide">
                          Sort by Field
                        </div>
                        {[
                          { key: 'date', label: 'Date' },
                          { key: 'action', label: 'Action' },
                          { key: 'message', label: 'Message' },
                        ].map((field) => (
                          <button
                            key={field.key}
                            onClick={() => setActivitySortOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{field.label}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setActivityFilterOpen(!activityFilterOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} />
                  {activityActiveFilterCount > 0 && ` (${activityActiveFilterCount})`}
                </button>

                {activityFilterOpen && (
                  <div className="absolute right-0 top-full z-20 w-56 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                          Filter Options
                        </div>
                        {activityActionFilter.length > 0 && (
                          <button
                            onClick={() => setActivityActionFilter([])}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {/* Action Filters */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Action Type
                        </div>
                        {['create', 'update', 'delete'].map((action) => (
                          <button
                            key={action}
                            onClick={() => toggleActivityActionFilter(action)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              activityActionFilter.includes(action) ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium capitalize">{action}</div>
                            </div>
                            {activityActionFilter.includes(action) && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Dropdown */}
              <DateRangeDropdown
                dateFrom={activityDateFrom}
                dateTo={activityDateTo}
                onDateFromChange={setActivityDateFrom}
                onDateToChange={setActivityDateTo}
                onClear={() => {
                  setActivityDateFrom('');
                  setActivityDateTo('');
                }}
              />
              </div>
          </div>
        )}

        {/* Activity Table */}
        {!isActivityCollapsed && (
          <div className="overflow-x-auto relative">
            {isActivityLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Loading activities...</span>
                </div>
              </div>
            )}
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  <th className="p-1 border-b border-gray-300">Date & Time</th>
                  <th className="p-1 border-b border-gray-300 text-center">Action</th>
                  <th className="p-1 border-b border-gray-300">Message</th>
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
                      <td className="px-2 text-center border-b border-gray-300">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold border rounded bg-gray-100 text-gray-700 border-gray-300">
                          {log.action || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 border-b border-gray-300">
                        <div className="text-gray-900">{log.message || 'No message'}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-2 py-4 text-center text-gray-500 border-b border-gray-300">
                      <RotateCcw size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No activity logs found</p>
                      <p className="text-sm text-gray-400 mt-1">Activity will appear here as users interact with the system</p>
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

        {/* Recent Inspections Panel */}
        <div>
            {/* Panel Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 shadow">
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

        {/* Advanced Controls - Following UsersList Pattern */}
        {!isInspectionCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  value={inspectionSearchTerm}
                  onChange={(e) => setInspectionSearchTerm(e.target.value)}
                  className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {inspectionSearchTerm && (
                  <button
                    onClick={() => setInspectionSearchTerm('')}
                    className="absolute -translate-y-1/2 right-3 top-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setInspectionSortOpen(!inspectionSortOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Sort by
                  <ChevronDown size={14} />
                </button>

                {inspectionSortOpen && (
                  <div className="absolute right-0 top-full z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Sort Options
                      </div>
                      
                      {/* Sort Fields */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-sky-600 uppercase tracking-wide">
                          Sort by Field
                        </div>
                        {[
                          { key: 'date', label: 'Date' },
                          { key: 'establishment', label: 'Establishment' },
                          { key: 'status', label: 'Status' },
                          { key: 'inspector', label: 'Inspector' },
                        ].map((field) => (
                          <button
                            key={field.key}
                            onClick={() => handleInspectionSortFromDropdown(field.key, inspectionSortBy === field.key ? (inspectionSortOrder === 'asc' ? 'desc' : 'asc') : 'asc')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              inspectionSortBy === field.key ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{field.label}</div>
                            </div>
                            {inspectionSortBy === field.key && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Sort Order */}
                      {inspectionSortBy && (
                        <>
                          <div className="my-1 border-t border-gray-200"></div>
                          <div>
                            <div className="px-3 py-1 text-xs font-medium text-sky-600 uppercase tracking-wide">
                              Sort Order
                            </div>
                            {[
                              { key: 'asc', label: 'Ascending' },
                              { key: 'desc', label: 'Descending' },
                            ].map((dir) => (
                              <button
                                key={dir.key}
                                onClick={() => handleInspectionSortFromDropdown(inspectionSortBy, dir.key)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                                  inspectionSortOrder === dir.key ? "bg-sky-50 font-medium" : ""
                                }`}
                              >
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{dir.label}</div>
                                </div>
                                {inspectionSortOrder === dir.key && (
                                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setInspectionFilterOpen(!inspectionFilterOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} />
                  {inspectionActiveFilterCount > 0 && ` (${inspectionActiveFilterCount})`}
                </button>

                {inspectionFilterOpen && (
                  <div className="absolute right-0 top-full z-20 w-56 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                          Filter Options
                        </div>
                        {inspectionStatusFilter.length > 0 && (
                          <button
                            onClick={() => setInspectionStatusFilter([])}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {/* Status Filters */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Status
                        </div>
                        {[
                          'SECTION_ASSIGNED',
                          'SECTION_IN_PROGRESS',
                          'SECTION_COMPLETED_COMPLIANT',
                          'SECTION_COMPLETED_NON_COMPLIANT',
                          'UNIT_REVIEWED',
                          'SECTION_REVIEWED',
                          'DIVISION_REVIEWED',
                          'LEGAL_REVIEW',
                          'NOV_SENT',
                          'NOO_SENT',
                          'FINALIZED',
                          'CLOSED',
                          'CLOSED_COMPLIANT',
                          'CLOSED_NON_COMPLIANT',
                        ].map((status) => (
                          <button
                            key={status}
                            onClick={() => toggleInspectionStatusFilter(status)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              inspectionStatusFilter.includes(status) ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{getInspectionStatusDisplay(status)}</div>
                            </div>
                            {inspectionStatusFilter.includes(status) && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Dropdown */}
              <DateRangeDropdown
                dateFrom={inspectionDateFrom}
                dateTo={inspectionDateTo}
                onDateFromChange={setInspectionDateFrom}
                onDateToChange={setInspectionDateTo}
                onClear={() => {
                  setInspectionDateFrom('');
                  setInspectionDateTo('');
                }}
              />
              </div>
          </div>
        )}

        {/* Inspection Table */}
        {!isInspectionCollapsed && (
          <div className="overflow-x-auto relative">
            {isInspectionLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Loading inspections...</span>
                </div>
              </div>
            )}
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  <th className="p-1 border-b border-gray-300">Date & Time</th>
                  <th className="p-1 border-b border-gray-300">Establishment</th>
                  <th className="p-1 border-b border-gray-300">Inspector</th>
                  <th className="p-1 border-b border-gray-300 text-center">Status</th>
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
                          {inspection.establishments_detail?.[0]?.name || 'N/A'}
                        </div>
                        {inspection.establishments_detail?.length > 1 && (
                          <div className="text-xs text-gray-500">
                            +{inspection.establishments_detail.length - 1} more
                          </div>
                        )}
                      </td>
                      <td className="px-2 border-b border-gray-300">
                        <div className="font-medium text-gray-900">
                          {inspection.assigned_to_name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-2 text-center border-b border-gray-300 w-45">
                        {getInspectionStatusBadge(inspection.current_status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-2 py-4 text-center text-gray-500 border-b border-gray-300">
                      <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No inspections found</p>
                      <p className="text-sm text-gray-400 mt-1">Create a new inspection to get started</p>
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
    </div>
  );
};
