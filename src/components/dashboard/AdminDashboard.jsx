import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  getEstablishments,
  getInspections,
  getActivityLogs,
  getComplianceStats,
  getQuarterlyComparison,
} from "../../services/api";
import {
  Users, 
  Building2, 
  ClipboardList, 
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  PieChart,
  Plus,
  UserPlus,
  FileText,
  Loader2,
  TrendingDown,
  Minus,
  BarChart3
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(false);
  
  
  // Inspection list controls
  const [isInspectionCollapsed, setIsInspectionCollapsed] = useState(false);
  
  // Pagination
  const { page: initialPage, pageSize: initialPageSize } = useLocalStoragePagination('dashboard_activity', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Inspection pagination
  const { page: initialInspectionPage, pageSize: initialInspectionPageSize } = useLocalStoragePagination('dashboard_inspection', 10);
  const [inspectionCurrentPage, setInspectionCurrentPage] = useState(initialInspectionPage);
  const [inspectionPageSize, setInspectionPageSize] = useState(initialInspectionPageSize);
  

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isInspectionLoading, setIsInspectionLoading] = useState(false);

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
    pending: 0,
    total: 0
  });
  
  // Quarterly comparison data
  const [quarterlyData, setQuarterlyData] = useState({
    current_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
    last_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
    change_percentage: 0,
    trend: 'stable'
  });
  
  



  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchEstablishments(),
          fetchInspections(),
          fetchActivityLogs(),
          fetchComplianceStats(),
          fetchQuarterlyComparison()
        ]);
      } finally {
        setIsLoading(false);
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
    setIsInspectionLoading(true);
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

  // 🔹 Compliance Statistics
  const fetchComplianceStats = async () => {
    try {
      const response = await getComplianceStats();
      setComplianceStats({
        pending: response.pending || 0,
        compliant: response.compliant || 0,
        nonCompliant: response.non_compliant || 0,
        total: response.total_completed || 0
      });
    } catch (err) {
      console.error("Error fetching compliance stats:", err);
      setComplianceStats({ pending: 0, compliant: 0, nonCompliant: 0, total: 0 });
    }
  };

  // 🔹 Quarterly Comparison
  const fetchQuarterlyComparison = async () => {
    try {
      const response = await getQuarterlyComparison();
      setQuarterlyData(response);
    } catch (err) {
      console.error("Error fetching quarterly comparison:", err);
      setQuarterlyData({
        current_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
        last_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
        change_percentage: 0,
        trend: 'stable'
      });
    }
  };

  // Simple activity logs (no filtering)
  const filteredActivityLog = useMemo(() => {
    return activityLog.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activityLog]);

  // Simple inspections (no filtering)
  const filteredInspections = useMemo(() => {
    return inspections.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [inspections]);

  // Compliance chart data (using backend stats)
  const complianceData = useMemo(() => {
    return {
      labels: ['Pending', 'Compliant', 'Non-Compliant'],
      datasets: [
        {
          data: [complianceStats.pending, complianceStats.compliant, complianceStats.nonCompliant],
          backgroundColor: [
            '#F59E0B', // Yellow for pending
            '#10B981', // Green for compliant
            '#EF4444', // Red for non-compliant
          ],
          borderColor: [
            '#D97706', // Darker yellow border
            '#059669', // Darker green border
            '#DC2626', // Darker red border
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [complianceStats]);
  
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
  
  // Navigation handlers
  const handleViewAll = (route) => {
    navigate(route);
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="bg-white border-2 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
      <div className="w-20 h-4 bg-gray-200 rounded"></div>
    </div>
  );

  // Enhanced Summary Cards Component
  const SummaryCard = ({ title, value, icon, color, route, quickAction, isLoading = false }) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    return (
      <div className={`bg-white border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${color} group`}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-sky-100">
          {icon}
        </div>
          <div className="flex items-center gap-2">
            {quickAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAll(quickAction.route);
                }}
                className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                title={quickAction.tooltip}
              >
                {quickAction.icon}
              </button>
            )}
            <div 
              className="flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => handleViewAll(route)}
            >
          <span className="text-sm mr-1">view all</span>
          <TrendingUp size={16} />
            </div>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
  };

  // Compliance Card Component
const ComplianceCard = ({ stats, chartData, isLoading }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const noData = stats.total === 0;

  return (
    <div className="bg-white border rounded-lg p-2 transition-all duration-300 hover:shadow-lg border-sky-200 bg-sky-50 group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieChart size={20} className="text-sky-600" />
          Compliance Status
        </h3>
        <button 
          onClick={() => handleViewAll('/inspections')}
          className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="View All Inspections"
        >
          <TrendingUp size={16} className="text-sky-600" />
        </button>
      </div>

      {noData ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <PieChart size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-6">
          {/* LEFT: Larger Pie Chart */}
          <div className="w-75 h-75 flex-shrink-0">
            <Pie 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true }
                }
              }}
            />
          </div>

          {/* RIGHT: Stats Details */}
          <div className="flex-1 space-y-3">
            {/* Pending */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </span>
              <span className="text-lg font-semibold text-yellow-700">{stats.pending}</span>
            </div>
            
            {/* Compliant */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Compliant</span>
              </span>
              <span className="text-lg font-semibold text-green-700">{stats.compliant}</span>
            </div>
            
            {/* Non-Compliant */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Non-Compliant</span>
              </span>
              <span className="text-lg font-semibold text-red-700">{stats.nonCompliant}</span>
            </div>
          </div>
        </div>
      )}
                  {/* Compliance Rate */}
                  <div className="pt-3 mt-3 border-t border-sky-200b text-center">
              <div className="text-3xl font-bold text-sky-700">
                {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-500">Compliance Rate</div>
            </div>
    </div>
  );
};

  // Quarterly Comparison Card Component
  const QuarterlyComparisonCard = ({ data, isLoading }) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    const noData = data.current_quarter.total_finished === 0 && data.last_quarter.total_finished === 0;

    const getTrendIcon = () => {
      switch (data.trend) {
        case 'up':
          return <TrendingUp size={16} className="text-green-600" />;
        case 'down':
          return <TrendingDown size={16} className="text-red-600" />;
        default:
          return <Minus size={16} className="text-gray-600" />;
      }
    };

    const getTrendColor = () => {
      switch (data.trend) {
        case 'up':
          return 'text-green-600';
        case 'down':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };

    return (
      <div className="bg-white border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg border-sky-200 bg-sky-50 group h-full flex flex-col">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-sky-600" />
            Quarterly Trend
          </h3>
          <button 
            onClick={() => fetchQuarterlyComparison()}
            className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Refresh Quarterly Data"
          >
            <RefreshCw size={16} className="text-sky-600" />
          </button>
        </div> */}

        {noData ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No quarterly data available</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {/* Quarter Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Last Quarter */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Last Quarter</div>
                <div className="text-lg font-bold text-gray-700">
                  {data.last_quarter.quarter} {data.last_quarter.year}
                </div>
                <div className="text-2xl font-bold text-sky-700 mt-1">
                  {data.last_quarter.total_finished}
                </div>
                <div className="text-xs text-gray-500">Finished</div>
              </div>

              {/* Current Quarter */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Current Quarter</div>
                <div className="text-lg font-bold text-gray-700">
                  {data.current_quarter.quarter} {data.current_quarter.year}
                </div>
                <div className="text-2xl font-bold text-sky-700 mt-1">
                  {data.current_quarter.total_finished}
                </div>
                <div className="text-xs text-gray-500">Finished</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

            {/* Compliance Breakdown */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Compliance Breakdown</div>
              
              {/* Compliant */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-gray-600">Compliant</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{data.last_quarter.compliant}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-green-700">{data.current_quarter.compliant}</span>
                </div>
              </div>

              {/* Non-Compliant */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-gray-600">Non-Compliant</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{data.last_quarter.non_compliant}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-red-700">{data.current_quarter.non_compliant}</span>
                </div>
              </div>
            </div>

            {/* Change Percentage */}
              <div className="flex items-center justify-center gap-2">
                {getTrendIcon()}
                <span className={`text-lg font-bold ${getTrendColor()}`}>
                  {data.change_percentage > 0 ? '+' : ''}{data.change_percentage}%
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center">Change</div>
          
            </div>  
          </div>
        )}
      </div>
    );
  };


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
          />
        </div>

        {/* Cell 3: Total Inspections in Current Quarter Year */}
        <div>
          <SummaryCard
            title="Current Quarter Inspections"
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
          />
        </div>

        {/* Cell 4: Quarterly Trend (spans 3 columns in row 2) */}
        <div className="col-span-3 col-start-1 row-start-2">
          <QuarterlyComparisonCard
            data={quarterlyData}
            isLoading={isLoading}
          />
        </div>

        {/* Cell 5: Compliance Status (spans 2 rows, starts at column 4) */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-1">
          <ComplianceCard
            stats={complianceStats}
            chartData={complianceData}
            isLoading={isLoading}
          />
        </div>
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

        {/* Simple Controls */}
        {!isActivityCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-end">
                <button
                  onClick={fetchActivityLogs}
                disabled={isActivityLoading}
                className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <RefreshCw size={14} className={`mr-1 ${isActivityLoading ? 'animate-spin' : ''}`} />
                {isActivityLoading ? 'Refreshing...' : 'Refresh'}
                </button>
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
            <table className="w-full border-2 border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  <th className="p-2 border-b-2 border-gray-300">Date</th>
                  <th className="p-2 border-b-2 border-gray-300">Action</th>
                  <th className="p-2 border-b-2 border-gray-300">Message</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((log, index) => (
                    <tr
                      key={log.id || index}
                      className="p-2 text-xs border-b-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-3 py-2 font-semibold border-b-2 border-gray-300">
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
                      <td className="px-3 py-2 text-center border-b-2 border-gray-300 w-28">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs w-18 font-semibold border rounded bg-gray-100 text-gray-700 border-gray-200">
                          {log.action || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b-2 border-gray-300">
                        {log.message || 'No message'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-8 text-center text-gray-500 border-b-2 border-gray-300">
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

        {/* Simple Controls */}
        {!isInspectionCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-end">
                <button
                  onClick={fetchInspections}
                disabled={isInspectionLoading}
                className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <RefreshCw size={14} className={`mr-1 ${isInspectionLoading ? 'animate-spin' : ''}`} />
                {isInspectionLoading ? 'Refreshing...' : 'Refresh'}
                </button>
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
            <table className="w-full border-2 border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-left text-white bg-sky-700">
                  <th className="p-2 border-b-2 border-gray-300">Date</th>
                  <th className="p-2 border-b-2 border-gray-300">Establishment</th>
                  <th className="p-2 border-b-2 border-gray-300">Inspector</th>
                  <th className="p-2 border-b-2 border-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInspections.length > 0 ? (
                  paginatedInspections.map((inspection, index) => (
                    <tr
                      key={inspection.id || index}
                      className="p-2 text-xs border-b-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-3 py-2 font-semibold border-b-2 border-gray-300">
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
                      <td className="px-3 py-2 border-b border-gray-300">
                        <div className="font-medium text-gray-900">
                          {inspection.establishment_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-gray-300">
                        <div className="font-medium text-gray-900">
                          {inspection.inspector_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center border-b-2 border-gray-300 w-28">
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
                    <td colSpan="4" className="px-3 py-8 text-center text-gray-500 border-b-2 border-gray-300">
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
    </div>
  );
};
