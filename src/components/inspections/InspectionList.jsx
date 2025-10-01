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
import PaginationControls from "../PaginationControls";

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
  inspections: propInspections = [],
  onAdd,
  onView,
  userLevel = "public",
  onWorkflowOpen,
  loading = false,
  canCreate = false,
  userProfile = null,
  pagination = {},
  onPageChange,
  searchQuery: externalSearchQuery = "",
  onSearch,
}) {
  const [inspections, setInspections] = useState(propInspections);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);

  // Use external search if provided, otherwise use internal
  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;
  const setSearchQuery = onSearch || setInternalSearchQuery;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Export
  const [selectedInspections, setSelectedInspections] = useState([]);

  // Update inspections when prop changes
  useEffect(() => {
    if (propInspections !== undefined) {
      setInspections(propInspections);
    }
  }, [propInspections]);

  // Sync with external pagination
  useEffect(() => {
    if (pagination.page) {
      setCurrentPage(pagination.page);
    }
    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
    }
  }, [pagination.page, pagination.pageSize]);

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
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
    // Removed auto-close: setSortDropdownOpen(false);
  }, []);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Filter functions
  const toggleSection = useCallback((section) => {
    setSectionFilter((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }, []);

  const toggleStatus = useCallback((status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const clearSections = useCallback(() => setSectionFilter([]), []);
  const clearStatuses = useCallback(() => setStatusFilter([]), []);
  const clearSearch = useCallback(() => setSearchQuery(""), [setSearchQuery]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSectionFilter([]);
    setStatusFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
    if (onPageChange) onPageChange(1);
  }, [setSearchQuery, onPageChange]);

  // Filter and paginate inspections
  const { filteredInspections, paginatedInspections, totalCount } =
    useMemo(() => {
      let filtered = inspections.filter((inspection) => {
        // Search filter
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          !debouncedSearchQuery ||
          inspection.id?.toLowerCase().includes(searchLower) ||
          inspection.establishment?.name?.toLowerCase().includes(searchLower) ||
          inspection.establishment_detail?.name
            ?.toLowerCase()
            .includes(searchLower) ||
          inspection.section?.toLowerCase().includes(searchLower) ||
          inspection.code?.toLowerCase().includes(searchLower);

        // Section filter
        const matchesSection =
          sectionFilter.length === 0 ||
          sectionFilter.includes(inspection.section);

        // Status filter
        const matchesStatus =
          statusFilter.length === 0 || statusFilter.includes(inspection.status);

        return matchesSearch && matchesSection && matchesStatus;
      });

      // Sort
      if (sortConfig.key) {
        filtered = [...filtered].sort((a, b) => {
          let aVal, bVal;

          if (sortConfig.key === "name") {
            aVal =
              a.establishment?.name?.toLowerCase() ||
              a.establishment_detail?.name?.toLowerCase() ||
              "";
            bVal =
              b.establishment?.name?.toLowerCase() ||
              b.establishment_detail?.name?.toLowerCase() ||
              "";
          } else if (sortConfig.key === "id") {
            aVal = (a.id || a.code || "").toLowerCase();
            bVal = (b.id || b.code || "").toLowerCase();
          } else if (sortConfig.key === "created_at") {
            aVal = new Date(a.created_at || 0).getTime();
            bVal = new Date(b.created_at || 0).getTime();
          } else {
            aVal = (a[sortConfig.key] || "").toString().toLowerCase();
            bVal = (b[sortConfig.key] || "").toString().toLowerCase();
          }

          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      // Paginate
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginated = filtered.slice(startIndex, endIndex);

      return {
        filteredInspections: filtered,
        paginatedInspections: paginated,
        totalCount: filtered.length,
      };
    }, [
      inspections,
      debouncedSearchQuery,
      sectionFilter,
      statusFilter,
      sortConfig,
      currentPage,
      pageSize,
    ]);

  // Selection handlers
  const toggleSelect = useCallback((id) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedInspections.length === paginatedInspections.length) {
      setSelectedInspections([]);
    } else {
      setSelectedInspections(paginatedInspections.map((i) => i.id || i.code));
    }
  }, [selectedInspections.length, paginatedInspections]);

  // Pagination handlers
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const goToPage = useCallback(
    (page) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    },
    [totalPages, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      const newPageSize = parseInt(newSize);
      setPageSize(newPageSize);
      setCurrentPage(1);
      if (pagination.onPageSizeChange) {
        pagination.onPageSizeChange(newPageSize);
      }
      if (onPageChange) {
        onPageChange(1);
      }
    },
    [pagination, onPageChange]
  );

  const handleInternalSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
      if (onPageChange) {
        onPageChange(1);
      }
    },
    [setSearchQuery, onPageChange]
  );

  const activeFilterCount = sectionFilter.length + statusFilter.length;
  const hasActiveFilters =
    searchQuery || activeFilterCount > 0 || sortConfig.key;

  // Calculate filtered count for display
  const filteredCount = totalCount;
  const totalInspections = inspections.length;

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
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Get establishment name with fallbacks
  const getEstablishmentName = (inspection) => {
    return (
      inspection.establishment?.name ||
      inspection.establishment_detail?.name ||
      "Unknown Establishment"
    );
  };

  // Get establishment address with fallbacks
  const getEstablishmentAddress = (inspection) => {
    const establishment =
      inspection.establishment || inspection.establishment_detail;
    if (!establishment) return "N/A";

    const street =
      establishment.street_building || establishment.address?.street || "";
    const barangay =
      establishment.barangay || establishment.address?.barangay || "";
    const city = establishment.city || establishment.address?.city || "";
    const province =
      establishment.province || establishment.address?.province || "";

    return { street, barangay, city, province };
  };

  // Get unique sections and statuses for filters
  const uniqueSections = useMemo(
    () =>
      [...new Set(inspections.map((i) => i.section).filter(Boolean))].sort(),
    [inspections]
  );

  const uniqueStatuses = useMemo(
    () => [...new Set(inspections.map((i) => i.status).filter(Boolean))].sort(),
    [inspections]
  );

  // Export selected inspections
  const handleExportSelected = useCallback(() => {
    if (selectedInspections.length === 0) {
      alert("Please select inspections to export.");
      return;
    }

    const selected = inspections.filter((i) =>
      selectedInspections.includes(i.id || i.code)
    );

    // Simple CSV export
    const headers = [
      "ID",
      "Establishment",
      "Section",
      "Status",
      "Created Date",
    ];
    const csvData = selected.map((inspection) => [
      inspection.id || inspection.code,
      getEstablishmentName(inspection),
      inspection.section,
      statusLabels[inspection.status] || inspection.status,
      formatDate(inspection.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspections-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedInspections, inspections]);

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header with search and filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Inspections</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => handleInternalSearch(e.target.value)}
              className="w-full py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full min-w-64 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute -translate-y-1/2 right-3 top-1/2"
                type="button"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
              type="button"
            >
              <ArrowUpDown size={14} />
              Sort
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-48 p-2 mt-2 bg-white border rounded shadow">
                {[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Establishment" },
                  { key: "section", label: "Section" },
                  { key: "status", label: "Status" },
                  { key: "created_at", label: "Created Date" },
                ].map((field) => (
                  <button
                    key={field.key}
                    onClick={() => handleSort(field.key)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                      sortConfig.key === field.key
                        ? "bg-sky-50 font-medium"
                        : ""
                    }`}
                    type="button"
                  >
                    <span className="mr-2 text-xs text-sky-600">
                      {sortConfig.key === field.key ? "•" : ""}
                    </span>
                    <span>{field.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
              type="button"
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                    type="button"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Export Selected */}
          <button
            onClick={
              selectedInspections.length > 0 ? handleExportSelected : undefined
            }
            disabled={selectedInspections.length === 0}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${
              selectedInspections.length > 0
                ? "text-white bg-green-600 hover:bg-green-700"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }`}
            type="button"
          >
            <Download size={14} />
            Export ({selectedInspections.length})
          </button>

          {canCreate && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
              type="button"
            >
              + New Inspection
            </button>
          )}
        </div>
      </div>

      {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalInspections) && (
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <div>
            {filteredCount === totalInspections
              ? `Showing all ${totalInspections} inspection(s)`
              : `Showing ${filteredCount} of ${totalInspections} inspection(s)`}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="underline text-sky-600 hover:text-sky-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

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
                    selectedInspections.length === paginatedInspections.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              {[
                { key: "id", label: "Inspection ID", sortable: true },
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
                    col.sortable ? "cursor-pointer hover:bg-sky-800" : ""
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
            {loading ? (
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
            ) : paginatedInspections.length === 0 ? (
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
                        type="button"
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
              paginatedInspections.map((inspection) => {
                const inspectionId = inspection.id || inspection.code;
                const address = getEstablishmentAddress(inspection);

                return (
                  <tr
                    key={inspectionId}
                    className="text-xs border border-gray-300 hover:bg-gray-50"
                  >
                    <td className="p-2 text-center border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedInspections.includes(inspectionId)}
                        onChange={() => toggleSelect(inspectionId)}
                      />
                    </td>
                    <td className="px-2 py-3 font-mono text-center border border-gray-300">
                      {inspectionId}
                    </td>
                    <td className="px-2 py-3 border border-gray-300">
                      <div className="font-medium">
                        {getEstablishmentName(inspection)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inspection.establishment?.nature_of_business ||
                          inspection.establishment_detail?.nature_of_business ||
                          inspection.establishment?.natureOfBusiness ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="px-2 py-3 border border-gray-300">
                      <div className="text-xs">
                        {`${address.street}, ${address.barangay}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {`${address.city}, ${address.province}`}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center border border-gray-300">
                      {inspection.section || "N/A"}
                    </td>
                    <td className="px-2 py-3 border border-gray-300">
                      <WorkflowStatus
                        inspection={inspection}
                        userLevel={userLevel}
                        onWorkflowOpen={onWorkflowOpen}
                      />
                    </td>
                    <td className="px-2 py-3 border border-gray-300">
                      {inspection.current_assignee_name ||
                        inspection.current_assigned_to?.name ||
                        "Unassigned"}
                    </td>
                    <td className="px-2 py-3 text-center border border-gray-300">
                      {formatDate(inspection.created_at)}
                    </td>
                    <td className="px-2 py-3 border border-gray-300">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => onView && onView(inspection)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                          type="button"
                          title="View Inspection Details"
                        >
                          <Eye size={12} /> View
                        </button>
                        {inspection.can_act && onWorkflowOpen && (
                          <button
                            onClick={() => onWorkflowOpen(inspection)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                            type="button"
                            title="Take Workflow Action"
                          >
                            <Workflow size={12} /> Workflow
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount}
        hasActiveFilters={hasActiveFilters}
        onPageChange={goToPage}
        onPageSizeChange={handlePageSizeChange}
        startItem={startItem}
        endItem={endItem}
      />
    </div>
  );
}
