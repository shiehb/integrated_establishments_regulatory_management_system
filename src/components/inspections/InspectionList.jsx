import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  Filter,
  Workflow,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WorkflowStatus from "./WorkflowStatus";
import ExportModal from "../ExportModal";
import Header from "../Header";
import Footer from "../Footer";
import LayoutWithSidebar from "../LayoutWithSidebar";
import { getInspections, searchInspections } from "../../services/api";

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

export default function InspectionList({
  onAdd,
  onView,
  userLevel,
  onWorkflowOpen,
  loading = false,
  canCreate = false,
}) {
  const [inspections, setInspections] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchMode, setSearchMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Export
  const [selectedInspections, setSelectedInspections] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch data based on mode (search or all)
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      let data;
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setSearchMode(true);
        const result = await searchInspections(
          debouncedSearchQuery,
          currentPage,
          pageSize
        );
        data = result.results || [];
        setTotalCount(result.count || 0);
      } else {
        setSearchMode(false);
        const allData = await getInspections({
          page: currentPage,
          page_size: pageSize,
        });
        data = allData.results || [];
        setTotalCount(allData.count || 0);
      }

      // Map backend to frontend expected model
      const mapped = data.map((d) => ({
        id: d.code || `${d.id}`,
        establishmentId: d.establishment,
        section: d.section,
        status: d.status,
        can_act: d.can_act,
        current_assignee_name: d.current_assignee_name,
        workflow_comments: d.workflow_comments,
        assigned_legal_unit_name: d.assigned_legal_unit_name,
        assigned_division_head_name: d.assigned_division_head_name,
        assigned_section_chief_name: d.assigned_section_chief_name,
        assigned_unit_head_name: d.assigned_unit_head_name,
        assigned_monitor_name: d.assigned_monitor_name,
        billing_record: d.billing_record,
        compliance_call: d.compliance_call,
        inspection_list: d.inspection_list,
        applicable_laws: d.applicable_laws,
        inspection_notes: d.inspection_notes,
        establishment_detail: d.establishment_detail,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));

      setInspections(mapped);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching inspections");
      }
    } finally {
      setLoadingData(false);
    }
  }, [debouncedSearchQuery, currentPage, pageSize]);

  // Fetch establishments for inspection details
  const fetchEstablishments = useCallback(async () => {
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchEstablishments();
  }, [fetchData, fetchEstablishments]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
        setFiltersOpen(false);
      }
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown")) {
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen, sortDropdownOpen]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
    setSortDropdownOpen(false);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  const sortFields = [
    { key: "id", label: "ID" },
    { key: "name", label: "Establishment Name" },
    { key: "section", label: "Section" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created Date" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
    setSortDropdownOpen(false);
  };

  // Filter functions
  const toggleSection = (section) => {
    setSectionFilter((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearSections = () => setSectionFilter([]);
  const clearStatuses = () => setStatusFilter([]);
  const clearSearch = () => setSearchQuery("");

  const clearAllFilters = () => {
    setSearchQuery("");
    setSectionFilter([]);
    setStatusFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Filter inspections locally when not in search mode
  const filteredInspections = useMemo(() => {
    if (searchMode) return inspections;

    let list = inspections.filter((inspection) => {
      const establishment = establishments.find(
        (e) => e.id === inspection.establishmentId
      );
      const matchesSection =
        sectionFilter.length === 0 ||
        sectionFilter.includes(inspection.section);
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(inspection.status);

      return matchesSection && matchesStatus;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "name") {
          const establishmentA = establishments.find(
            (e) => e.id === a.establishmentId
          );
          const establishmentB = establishments.find(
            (e) => e.id === b.establishmentId
          );
          aVal = establishmentA?.name ? establishmentA.name.toLowerCase() : "";
          bVal = establishmentB?.name ? establishmentB.name.toLowerCase() : "";
        } else if (sortConfig.key === "id") {
          aVal = a.id ? a.id.toLowerCase() : "";
          bVal = b.id ? b.id.toLowerCase() : "";
        } else if (sortConfig.key === "created_at") {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else {
          aVal = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : "";
          bVal = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    inspections,
    establishments,
    sectionFilter,
    statusFilter,
    sortConfig,
    searchMode,
  ]);

  // Flatten inspections with establishment details
  const flattenedInspections = useMemo(() => {
    return filteredInspections.map((inspection) => {
      const establishment = establishments.find(
        (e) => e.id === inspection.establishmentId
      );
      return {
        ...inspection,
        establishments: establishment ? [establishment] : [],
        establishment: establishment || {},
      };
    });
  }, [filteredInspections, establishments]);

  // Selection
  const toggleSelect = (id) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInspections.length === flattenedInspections.length) {
      setSelectedInspections([]);
    } else {
      setSelectedInspections(flattenedInspections.map((i) => i.id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const activeFilterCount = sectionFilter.length + statusFilter.length;
  const hasActiveFilters =
    searchQuery || activeFilterCount > 0 || sortConfig.key;

  const statusLabels = {
    PENDING: "Pending",
    LEGAL_REVIEW: "Legal Review",
    DIVISION_CREATED: "Division Created",
    SECTION_REVIEW: "Section Review",
    UNIT_REVIEW: "Unit Review",
    MONITORING_INSPECTION: "Monitoring Inspection",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique sections and statuses for filters
  const uniqueSections = [
    ...new Set(inspections.map((i) => i.section).filter(Boolean)),
  ].sort();
  const uniqueStatuses = [
    ...new Set(inspections.map((i) => i.status).filter(Boolean)),
  ].sort();

  // Fixed loading state
  if (loading || (loadingData && flattenedInspections.length === 0)) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userLevel}>
          <div
            className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50"
            role="status"
            aria-live="polite"
          >
            <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            <p className="text-sm text-center text-gray-600">
              Loading inspections...
            </p>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header with search and filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Inspections</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* 🔍 Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <ArrowUpDown size={14} />
              Sort by
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-48 p-2 mt-2 bg-white border rounded shadow">
                <div className="mb-2">
                  <h4 className="px-3 py-1 text-sm font-semibold text-gray-600">
                    Sort by
                  </h4>
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
                      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                        sortConfig.key === field.key
                          ? "bg-sky-50 font-medium"
                          : ""
                      }`}
                    >
                      <span className="mr-2 text-xs text-sky-600">
                        {sortConfig.key === field.key ? "•" : ""}
                      </span>
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>

                {sortConfig.key && (
                  <>
                    <div className="my-1 border-t border-gray-200"></div>
                    <div>
                      <h4 className="px-3 py-1 text-sm font-semibold text-gray-600">
                        Order
                      </h4>
                      {sortDirections.map((dir) => (
                        <button
                          key={dir.key}
                          onClick={() =>
                            handleSortFromDropdown(sortConfig.key, dir.key)
                          }
                          className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                            sortConfig.direction === dir.key
                              ? "bg-sky-50 font-medium"
                              : ""
                          }`}
                        >
                          <span className="mr-2 text-xs text-sky-600">
                            {sortConfig.direction === dir.key ? "•" : ""}
                          </span>
                          <span>{dir.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 🎚 Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-64 p-2 mt-2 overflow-y-auto bg-white border rounded shadow max-h-96">
                {/* Section Filter */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Section
                    </h4>
                    {sectionFilter.length > 0 && (
                      <button
                        onClick={clearSections}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-32">
                    {uniqueSections.map((section) => (
                      <button
                        key={section}
                        onClick={() => toggleSection(section)}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                          sectionFilter.includes(section)
                            ? "bg-sky-50 font-medium"
                            : ""
                        }`}
                      >
                        <span className="mr-2 text-xs text-sky-600">
                          {sectionFilter.includes(section) ? "•" : ""}
                        </span>
                        <span className="truncate">{section}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Status
                    </h4>
                    {statusFilter.length > 0 && (
                      <button
                        onClick={clearStatuses}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-32">
                    {uniqueStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                          statusFilter.includes(status)
                            ? "bg-sky-50 font-medium"
                            : ""
                        }`}
                      >
                        <span className="mr-2 text-xs text-sky-600">
                          {statusFilter.includes(status) ? "•" : ""}
                        </span>
                        <span className="truncate">
                          {statusLabels[status] || status.replace(/_/g, " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear All */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-3 py-2 mt-2 text-xs text-center text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedInspections.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Download size={14} /> Export ({selectedInspections.length})
            </button>
          )}

          {canCreate && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              + New Inspection
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-left text-white bg-sky-700">
              <th className="w-6 p-1 text-center border border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedInspections.length > 0 &&
                    selectedInspections.length === flattenedInspections.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              {[
                { key: "id", label: "ID", sortable: true },
                { key: "name", label: "Establishment Name", sortable: true },
                { key: "address", label: "Address", sortable: false },
                { key: "section", label: "Section", sortable: true },
                { key: "status", label: "Workflow Status", sortable: true },
                { key: "assignee", label: "Current Assignee", sortable: false },
                { key: "created_at", label: "Created Date", sortable: true },
              ].map((col) => (
                <th
                  key={col.key}
                  className={`p-1 border border-gray-300 ${
                    col.sortable ? "cursor-pointer" : ""
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label} {col.sortable && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              <th className="p-1 text-center border border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingData ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-2 py-8 text-center border border-gray-300"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 mr-2 border-b-2 rounded-full animate-spin border-sky-600"></div>
                    <span>Loading inspections...</span>
                  </div>
                </td>
              </tr>
            ) : flattenedInspections.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-2 py-4 text-center text-gray-500 border border-gray-300"
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
              flattenedInspections.map((inspection) => (
                <tr
                  key={`${inspection.id}-${inspection.establishment.id}`}
                  className="text-xs border border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-2 text-center border border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedInspections.includes(inspection.id)}
                      onChange={() => toggleSelect(inspection.id)}
                    />
                  </td>
                  <td className="px-2 py-3 font-medium text-center border border-gray-300">
                    {inspection.id}
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <div className="font-medium">
                      {inspection.establishment.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {inspection.establishment.nature_of_business}
                    </div>
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <div className="text-xs">
                      {`${inspection.establishment.street_building}, ${inspection.establishment.barangay}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {`${inspection.establishment.city}, ${inspection.establishment.province}`}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center border border-gray-300">
                    {inspection.section}
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <WorkflowStatus
                      inspection={{
                        id: inspection.id,
                        status: inspection.status,
                        can_act: inspection.can_act,
                        current_assignee_name: inspection.current_assignee_name,
                        workflow_comments: inspection.workflow_comments,
                        assigned_legal_unit_name:
                          inspection.assigned_legal_unit_name,
                        assigned_division_head_name:
                          inspection.assigned_division_head_name,
                        assigned_section_chief_name:
                          inspection.assigned_section_chief_name,
                        assigned_unit_head_name:
                          inspection.assigned_unit_head_name,
                        assigned_monitor_name: inspection.assigned_monitor_name,
                      }}
                      userLevel={userLevel}
                      onWorkflowOpen={onWorkflowOpen}
                    />
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    {inspection.current_assignee_name || "Unassigned"}
                  </td>
                  <td className="px-2 py-3 text-center border border-gray-300">
                    {formatDate(inspection.created_at)}
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => onView(inspection)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                      >
                        <Eye size={12} /> View
                      </button>
                      {inspection.can_act && onWorkflowOpen && (
                        <button
                          onClick={() => onWorkflowOpen(inspection)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          <Workflow size={12} /> Workflow
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalCount} entries
            {searchMode && debouncedSearchQuery && (
              <span className="ml-2">(search results)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === pageNum
                      ? "bg-sky-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Inspections Export Report"
        fileName={`inspections_export${
          searchQuery ? `_${searchQuery.replace(/[^a-zA-Z0-9]/g, "_")}` : ""
        }_page_${currentPage}`}
        companyName="DENR Environmental Office"
        companySubtitle="Inspection Management System"
        logo="/logo.png"
        columns={[
          "ID",
          "Establishment Name",
          "Address",
          "Business Type",
          "Section",
          "Status",
          "Assignee",
          "Created Date",
        ]}
        rows={selectedInspections.map((id) => {
          const inspection = flattenedInspections.find((i) => i.id === id);
          return [
            inspection.id,
            inspection.establishment.name,
            `${inspection.establishment.street_building}, ${inspection.establishment.city}`,
            inspection.establishment.nature_of_business,
            inspection.section,
            statusLabels[inspection.status] || inspection.status,
            inspection.current_assignee_name || "Unassigned",
            formatDate(inspection.created_at),
          ];
        })}
      />
    </div>
  );
}
