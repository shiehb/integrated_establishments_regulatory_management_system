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
} from "lucide-react";
import {
  Chart as ChartJS,
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
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isInspectionLoading, setIsInspectionLoading] = useState(false);

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


  // Simple activity logs (no filtering)
  const filteredActivityLog = useMemo(() => {
    return activityLog.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activityLog]);

  // Simple inspections (no filtering)
  const filteredInspections = useMemo(() => {
    return inspections.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [inspections]);

  
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
