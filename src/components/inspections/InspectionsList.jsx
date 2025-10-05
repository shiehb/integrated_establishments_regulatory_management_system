import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Play,
  ArrowRight,
  CheckCircle,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Search,
  X,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  MapPin,
  Users,
  Clock,
  Building,
  Trash2
} from "lucide-react";
import { 
  getProfile, 
  getInspections, 
  deleteInspection
} from "../../services/api";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function InspectionsList({ onAdd, onView, onWorkflow, onCompliance, onLegalUnit, refreshTrigger, userLevel = 'Division Chief' }) {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // 📑 Tab state for role-based tabs
  const [activeTab, setActiveTab] = useState('all');

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("inspections_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // 🗑️ Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, inspection: null });

  // ✅ Bulk select
  const [selectedInspections, setSelectedInspections] = useState([]);

  // Get role-based tabs following exact workflow specification
  const getRoleBasedTabs = () => {
    switch (userLevel) {
      case 'Division Chief':
        return [
          { id: 'created', label: 'Created Inspections', count: 0 },
          { id: 'tracking', label: 'Tracking', count: 0 }
        ];
      case 'Section Chief':
        return [
          { id: 'received', label: 'Received Inspections', count: 0 },
          { id: 'my_inspections', label: 'My Inspections', count: 0 },
          { id: 'forwarded', label: 'Forwarded List', count: 0 },
          { id: 'review', label: 'Review List', count: 0 }
        ];
      case 'Unit Head':
        return [
          { id: 'received', label: 'Received Inspections', count: 0 },
          { id: 'my_inspections', label: 'My Inspections', count: 0 },
          { id: 'forwarded', label: 'Forwarded List', count: 0 },
          { id: 'review', label: 'Review List', count: 0 }
        ];
      case 'Monitoring Personnel':
        return [
          { id: 'assigned', label: 'Assigned Inspections', count: 0 }
        ];
      case 'Legal Unit':
        return [
          { id: 'non_compliant', label: 'Non-Compliant Cases', count: 0 }
        ];
      default:
        return [{ id: 'all', label: 'All Inspections', count: 0 }];
    }
  };

  const fetchAllInspections = useCallback(async () => {
    setLoading(true);
    try {
      // Don't fetch if currentUser is not loaded yet
      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log('Fetching inspections for tab:', activeTab, 'userLevel:', userLevel);

      // Use the new getInspections API function with exact tab mapping
      const params = {
        page: currentPage,
        page_size: pageSize,
        tab: activeTab, // Exact tab mapping as specified
      };

      // Add search parameter if provided
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      // Add status filter if selected
      if (statusFilter.length > 0) {
        params.status = statusFilter.join(",");
      }

      // Add section filter if selected
      if (sectionFilter.length > 0) {
        params.section = sectionFilter.join(",");
      }

      // Add priority filter if selected
      if (priorityFilter.length > 0) {
        params.priority = priorityFilter.join(",");
      }

      const response = await getInspections(params);
      console.log('Inspections response:', response);

      if (response.results) {
        // Server-side paginated response
        setInspections(response.results);
        setTotalCount(response.count || 0);
      } else {
        // Fallback for non-paginated response
        setInspections(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setInspections([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, sectionFilter, priorityFilter, activeTab, userLevel, currentUser]);

  // Handle action clicks by delegating to parent workflow handler
  const handleActionClick = useCallback((inspectionId, action) => {
    const inspection = inspections.find(i => i.id === inspectionId);
    if (!inspection) {
      console.error('Inspection not found:', inspectionId);
      return;
    }

    // Handle modal-based actions
    if (action === 'forward') {
      onWorkflow && onWorkflow(inspection, 'forward');
    } else if (action === 'review') {
      onWorkflow && onWorkflow(inspection, 'review');
    } else if (action === 'send_nov') {
      onLegalUnit && onLegalUnit(inspection);
    } else if (action === 'send_noo') {
      onLegalUnit && onLegalUnit(inspection);
    } else if (action === 'complete' && userLevel === 'Monitoring Personnel') {
      onCompliance && onCompliance(inspection);
    } else {
      // For direct API actions, delegate to parent workflow handler
      onWorkflow && onWorkflow(inspection, action);
    }
  }, [inspections, onWorkflow, onCompliance, onLegalUnit, userLevel]);

  // Delete inspection function
  const handleDeleteInspection = useCallback(async (inspection) => {
    try {
      await deleteInspection(inspection.id);
      alert(`Inspection ${inspection.code} deleted successfully`);
      // Refresh the inspections list
      fetchAllInspections();
      // Close confirmation dialog
      setDeleteConfirmation({ open: false, inspection: null });
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(`Error deleting inspection: ${error.message}`);
    }
  }, [fetchAllInspections]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setCurrentUser(profile);
        
        // Set default tab based on user level
        const tabs = getRoleBasedTabs();
        if (tabs.length > 0 && !activeTab) {
          setActiveTab(tabs[0].id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [userLevel]);

  useEffect(() => {
    fetchAllInspections();
  }, [refreshTrigger, fetchAllInspections, currentUser]);

  // Add this useEffect to handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
        setFiltersOpen(false);
      }
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown")) {
        setSortDropdownOpen(false);
      }
    }

    if (filtersOpen || sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen, sortDropdownOpen]);

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Sort options for dropdown
  const sortFields = [
    { key: "code", label: "Inspection Code" },
    { key: "establishments_detail", label: "Establishments" },
    { key: "law", label: "Law" },
    { key: "current_status", label: "Status" },
    { key: "assigned_to_name", label: "Assigned To" },
    { key: "created_at", label: "Created Date" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  // ✅ Filter + Sort with LOCAL search (client-side only)
  const filteredInspections = useMemo(() => {
    let list = inspections.filter((inspection) => {
      // Apply local search filter
      const query = debouncedSearchQuery.toLowerCase();
      const establishmentNames = inspection.establishments_detail?.map(est => est.name).join(' ') || "";
      const code = inspection.code || "";
      const law = inspection.law || "";

      const matchesSearch = debouncedSearchQuery
        ? establishmentNames.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query) ||
          law.toLowerCase().includes(query)
        : true;

      // Apply status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(inspection.current_status);

      // Apply section filter
      const matchesSection =
        sectionFilter.length === 0 || sectionFilter.includes(inspection.law);

      // Apply priority filter
      const matchesPriority =
        priorityFilter.length === 0 || priorityFilter.includes(inspection.priority);

      // Apply date filter
      const matchesDateFrom = dateFrom
        ? new Date(inspection.created_at) >= new Date(dateFrom)
        : true;
      const matchesDateTo = dateTo
        ? new Date(inspection.created_at) <= new Date(dateTo)
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSection &&
        matchesPriority &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "establishments_detail") {
          aVal = a.establishments_detail?.map(est => est.name).join(' ') || "";
          bVal = b.establishments_detail?.map(est => est.name).join(' ') || "";
        } else {
          aVal = a[sortConfig.key] || "";
          bVal = b[sortConfig.key] || "";
        }

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    inspections,
    debouncedSearchQuery,
    statusFilter,
    sectionFilter,
    priorityFilter,
    dateFrom,
    dateTo,
    sortConfig,
  ]);

  // ✅ Pagination (using server-side pagination, so no need for paginatedInspections)
  const totalPages = Math.ceil(filteredInspections.length / pageSize);

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInspections.length === inspections.length) {
      setSelectedInspections([]);
    } else {
      setSelectedInspections(inspections.map((i) => i.id));
    }
  };

  // Toggle filter checkboxes
  const toggleStatus = (status) =>
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );

  const togglePriority = (priority) =>
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSectionFilter([]);
    setPriorityFilter([]);
    setDateFrom("");
    setDateTo("");
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalInspections = totalCount;
  const filteredCount = totalCount; // Server-side filtering
  const hasActiveFilters =
    searchQuery ||
    statusFilter.length > 0 ||
    sectionFilter.length > 0 ||
    priorityFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    sortConfig.key;
  const activeFilterCount =
    statusFilter.length +
    sectionFilter.length +
    priorityFilter.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCount);

  const handleRowClick = (inspection) => {
    navigate(`/inspections/${inspection.id}`);
  };

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Inspections Management</h1>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute -translate-y-1/2 right-3 top-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* 🔽 Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUpDown size={14} />
              Sort by
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sort Options
                  </div>
                  
                  {/* Sort by Field Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Sort by Field
                    </div>
                    {sortFields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() =>
                          handleSortFromDropdown(
                            field.key,
                            sortConfig.key === field.key
                              ? sortConfig.direction === "asc"
                                ? "desc"
                                : "asc"
                              : "asc"
                          )
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{field.label}</div>
                        </div>
                        {sortConfig.key === field.key && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Order Section - Shown if a field is selected */}
                  {sortConfig.key && (
                    <>
                      <div className="my-1 border-t border-gray-200"></div>
                      <div>
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Sort Order
                        </div>
                        {sortDirections.map((dir) => (
                          <button
                            key={dir.key}
                            onClick={() =>
                              handleSortFromDropdown(sortConfig.key, dir.key)
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              sortConfig.direction === dir.key ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{dir.label}</div>
                            </div>
                            {sortConfig.direction === dir.key && (
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

          {/* 🎚 Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUpDown size={14} />
              Filters
              <ChevronDown size={14} />
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded shadow">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2 mb-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filter Options
                    </div>
                    {(statusFilter.length > 0 || sectionFilter.length > 0 || priorityFilter.length > 0) && (
                      <button
                        onClick={() => {
                          setStatusFilter([]);
                          setSectionFilter([]);
                          setPriorityFilter([]);
                        }}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Status Section */}
                  <div className="mb-3">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Status
                    </div>
                    {[
                      "CREATED",
                      "SECTION_ASSIGNED",
                      "SECTION_IN_PROGRESS",
                      "SECTION_COMPLETED",
                      "UNIT_ASSIGNED",
                      "UNIT_IN_PROGRESS",
                      "UNIT_COMPLETED",
                      "MONITORING_ASSIGNED",
                      "MONITORING_IN_PROGRESS",
                      "MONITORING_COMPLETED_COMPLIANT",
                      "MONITORING_COMPLETED_NON_COMPLIANT",
                      "LEGAL_REVIEW",
                      "NOV_SENT",
                      "NOO_SENT",
                      "CLOSED_COMPLIANT",
                      "CLOSED_NON_COMPLIANT"
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          statusFilter.includes(status) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{status.replace(/_/g, ' ')}</div>
                        </div>
                        {statusFilter.includes(status) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Priority Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Priority
                    </div>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          priorityFilter.includes(priority) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{priority}</div>
                        </div>
                        {priorityFilter.includes(priority) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DateRangeDropdown
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClear={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className=" absolute right-0 flex items-center text-sm"
          />

          <ExportDropdown
            title="Inspections Export Report"
            fileName="inspections_export"
            columns={["Code", "Establishments", "Law", "Status", "Assigned To", "Created By", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                inspection.created_by_name || 'Unknown',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                inspection.created_by_name || 'Unknown',
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            disabled={inspections.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Inspections Report"
            fileName="inspections_report"
            columns={["Code", "Establishments", "Law", "Status", "Assigned To", "Created By", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                inspection.created_by_name || 'Unknown',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                inspection.created_by_name || 'Unknown',
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            selectedCount={selectedInspections.length}
            disabled={inspections.length === 0}
            className="flex items-center px-3 py-1 text-sm"
          />

          <button
            onClick={onAdd}
            className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            <Plus size={16} /> Add Inspection
          </button>
        </div>
      </div>

      {/* Role-based Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {getRoleBasedTabs().map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600 bg-sky-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Table Content - Migrated from InspectionTable */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-6 p-1 text-center border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedInspections.length > 0 &&
                    selectedInspections.length === inspections.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              {[
                { key: "code", label: "Code", sortable: true },
                { key: "establishments_detail", label: "Establishments", sortable: false },
                { key: "law", label: "Law", sortable: false },
                { key: "current_status", label: "Status", sortable: true },
                { key: "assigned_to_name", label: "Assigned To", sortable: false },
                { key: "created_by_name", label: "Created By", sortable: false },
                { key: "created_at", label: "Created", sortable: true },
              ].map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer" : ""
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label} {col.sortable && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-8 text-center border-b border-gray-300"
                >
                  <div
                    className="flex flex-col items-center justify-center p-4"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Loading inspections...</p>
                  </div>
                </td>
              </tr>
            ) : inspections.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-4 text-center text-gray-500 border-b border-gray-300"
                >
                  {hasActiveFilters ? (
                    <div>
                      No inspections found matching your criteria.
                      <br />
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 underline text-sky-600 hover:text-sky-700"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    "No inspections found."
                  )}
                </td>
              </tr>
            ) : (
              inspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  onClick={() => handleRowClick(inspection)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="text-center border-b border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedInspections.includes(inspection.id)}
                      onChange={() => toggleSelect(inspection.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      {inspection.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        {inspection.establishments_detail && inspection.establishments_detail.length > 0 ? (
                          inspection.establishments_detail.map((est, idx) => (
                            <div key={idx} className="mb-1">
                              <div className="font-medium">{est.name}</div>
                              <div className="text-xs text-gray-500">{est.nature_of_business}</div>
                              <div className="text-xs text-gray-400">{est.city}, {est.province}</div>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">No establishments</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.law}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={inspection.current_status} 
                      simplifiedStatus={inspection.simplified_status} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.assigned_to_name ? (
                      <div>
                        <div className="font-medium">{inspection.assigned_to_name}</div>
                        {inspection.assigned_to_level && (
                          <div className="text-xs text-gray-500">{inspection.assigned_to_level}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.created_by_name ? (
                      <div>
                        <div className="font-medium">{inspection.created_by_name}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatFullDate(inspection.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <ActionButtons 
                      inspection={inspection}
                      onActionClick={handleActionClick}
                      userLevel={userLevel}
                      activeTab={activeTab}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalInspections}
        filteredItems={filteredCount}
        hasActiveFilters={hasActiveFilters}
        onPageChange={goToPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        startItem={startItem}
        endItem={endItem}
        storageKey="inspections_list"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        title="Delete Inspection"
        message={`Are you sure you want to delete inspection ${deleteConfirmation.inspection?.code || deleteConfirmation.inspection?.id}? This action cannot be undone.${
          userLevel === 'Admin' 
            ? ' As an Admin, you can delete any inspection.' 
            : ' Only inspections in "Created" status can be deleted.'
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        size="md"
        onCancel={() => setDeleteConfirmation({ open: false, inspection: null })}
        onConfirm={() => handleDeleteInspection(deleteConfirmation.inspection)}
      />
    </div>
  );
}