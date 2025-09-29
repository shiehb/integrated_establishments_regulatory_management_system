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

export default function InspectionTable({
  inspections: propInspections = [],
  onAdd,
  onView,
  userLevel = "public",
  onWorkflowOpen,
  loading = false,
  canCreate = false,
  userProfile = null,
}) {
  const [inspections, setInspections] = useState(propInspections);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    setSortDropdownOpen(false);
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
  const clearSearch = useCallback(() => setSearchQuery(""), []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSectionFilter([]);
    setStatusFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  }, []);

  // Filter and paginate inspections
  const { filteredInspections, paginatedInspections, totalCount } =
    useMemo(() => {
      let filtered = inspections.filter((inspection) => {
        // Search filter
        const matchesSearch =
          !debouncedSearchQuery ||
          inspection.id
            ?.toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          inspection.establishment?.name
            ?.toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          inspection.section
            ?.toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase());

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
            aVal = a.establishment?.name?.toLowerCase() || "";
            bVal = b.establishment?.name?.toLowerCase() || "";
          } else if (sortConfig.key === "id") {
            aVal = (a.id || "").toLowerCase();
            bVal = (b.id || "").toLowerCase();
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
      setSelectedInspections(paginatedInspections.map((i) => i.id));
    }
  }, [selectedInspections.length, paginatedInspections]);

  // Pagination handlers
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  }, []);

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
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
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
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

          {canCreate && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
              type="button"
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
                    selectedInspections.length === paginatedInspections.length
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
              paginatedInspections.map((inspection) => (
                <tr
                  key={inspection.id}
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
                    {inspection.id || "N/A"}
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <div className="font-medium">
                      {inspection.establishment?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {inspection.establishment?.nature_of_business ||
                        inspection.establishment?.natureOfBusiness ||
                        "N/A"}
                    </div>
                  </td>
                  <td className="px-2 py-3 border border-gray-300">
                    <div className="text-xs">
                      {`${
                        inspection.establishment?.street_building ||
                        inspection.establishment?.address?.street ||
                        ""
                      }, ${
                        inspection.establishment?.barangay ||
                        inspection.establishment?.address?.barangay ||
                        ""
                      }`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {`${
                        inspection.establishment?.city ||
                        inspection.establishment?.address?.city ||
                        ""
                      }, ${
                        inspection.establishment?.province ||
                        inspection.establishment?.address?.province ||
                        ""
                      }`}
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
                    {inspection.current_assignee_name || "Unassigned"}
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
                      >
                        <Eye size={12} /> View
                      </button>
                      {inspection.can_act && onWorkflowOpen && (
                        <button
                          onClick={() => onWorkflowOpen(inspection)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                          type="button"
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
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              type="button"
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
                  type="button"
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
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
    </div>
  );
}
