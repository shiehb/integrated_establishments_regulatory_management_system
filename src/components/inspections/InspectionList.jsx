import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import WorkflowStatus from "./WorkflowStatus";
import ExportModal from "../ExportModal";

export default function InspectionList({
  inspections,
  onAdd,
  onView,
  userLevel,
  onWorkflowOpen,
}) {
  // 🔍 Search and Filter State
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedInspections, setSelectedInspections] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Flatten the inspections to show each establishment in a separate row
  const flattenedInspections = inspections.flatMap((inspection) =>
    inspection.establishments.map((establishment) => ({
      id: inspection.id,
      establishment,
      section: inspection.section,
      status: inspection.status,
      can_act: inspection.can_act,
      current_assignee_name: inspection.current_assignee_name,
      workflow_comments: inspection.workflow_comments,
      assigned_legal_unit_name: inspection.assigned_legal_unit_name,
      assigned_division_head_name: inspection.assigned_division_head_name,
      assigned_section_chief_name: inspection.assigned_section_chief_name,
      assigned_unit_head_name: inspection.assigned_unit_head_name,
      assigned_monitor_name: inspection.assigned_monitor_name,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
    }))
  );

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

  // ✅ Sorting handler
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

  // Sort options for dropdown
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

  // ✅ Filter + Sort with LOCAL search
  const filteredInspections = useMemo(() => {
    let list = flattenedInspections.filter((inspection) => {
      // Apply local search filter
      const query = localSearchQuery.toLowerCase();
      const matchesSearch = localSearchQuery
        ? inspection.id.toLowerCase().includes(query) ||
          inspection.establishment.name.toLowerCase().includes(query) ||
          inspection.establishment.address.street
            .toLowerCase()
            .includes(query) ||
          inspection.establishment.address.city.toLowerCase().includes(query) ||
          inspection.section.toLowerCase().includes(query) ||
          inspection.status.toLowerCase().includes(query) ||
          inspection.current_assignee_name?.toLowerCase().includes(query) ||
          inspection.workflow_comments?.toLowerCase().includes(query)
        : true;

      // Apply section filter
      const matchesSection =
        sectionFilter.length === 0 ||
        sectionFilter.includes(inspection.section);

      // Apply status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(inspection.status);

      return matchesSearch && matchesSection && matchesStatus;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "name") {
          aVal = a.establishment.name.toLowerCase();
          bVal = b.establishment.name.toLowerCase();
        } else if (sortConfig.key === "id") {
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
        } else if (sortConfig.key === "created_at") {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else {
          aVal = a[sortConfig.key]?.toLowerCase() || "";
          bVal = b[sortConfig.key]?.toLowerCase() || "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    flattenedInspections,
    localSearchQuery,
    sectionFilter,
    statusFilter,
    sortConfig,
  ]);

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInspections.length === filteredInspections.length) {
      setSelectedInspections([]);
    } else {
      setSelectedInspections(filteredInspections.map((i) => i.id));
    }
  };

  // Toggle functions for filters
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

  // Clear functions
  const clearLocalSearch = () => setLocalSearchQuery("");
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setSectionFilter([]);
    setStatusFilter([]);
    setSortConfig({ key: null, direction: null });
  };

  const totalInspections = flattenedInspections.length;
  const filteredCount = filteredInspections.length;
  const hasActiveFilters =
    localSearchQuery ||
    sectionFilter.length > 0 ||
    statusFilter.length > 0 ||
    sortConfig.key;
  const activeFilterCount = sectionFilter.length + statusFilter.length;

  // Get unique sections and statuses for filters
  const uniqueSections = [
    ...new Set(flattenedInspections.map((i) => i.section).filter(Boolean)),
  ].sort();
  const uniqueStatuses = [
    ...new Set(flattenedInspections.map((i) => i.status).filter(Boolean)),
  ].sort();

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

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header with search and filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Inspections</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full min-w-sm py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {localSearchQuery && (
              <button
                onClick={clearLocalSearch}
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
                {/* Sort by Field Section */}
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
                      <span className="text-xs text-sky-600 mr-2">
                        {sortConfig.key === field.key ? "•" : ""}
                      </span>
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>

                {/* Order Section - Shown if a field is selected */}
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
                          <span className="text-xs text-sky-600 mr-2">
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
              <div className="absolute right-0 z-20 w-64 p-2 mt-2 bg-white border rounded shadow max-h-96 overflow-y-auto">
                {/* Section Filter */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Section
                    </h4>
                    {sectionFilter.length > 0 && (
                      <button
                        onClick={() => setSectionFilter([])}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto">
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
                        <span className="text-xs text-sky-600 mr-2">
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
                        onClick={() => setStatusFilter([])}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto">
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
                        <span className="text-xs text-sky-600 mr-2">
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

          {onAdd && (
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
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-left text-white bg-sky-700">
            <th className="w-6 p-1 text-center border border-gray-300">
              <input
                type="checkbox"
                checked={
                  selectedInspections.length > 0 &&
                  selectedInspections.length === filteredInspections.length
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
            <th className="p-1 text-center border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInspections.length === 0 ? (
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
                      className="mt-2 text-sky-600 hover:text-sky-700 underline"
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
            filteredInspections.map((inspection) => (
              <tr
                key={`${inspection.id}-${inspection.establishment.id}`}
                className="text-xs hover:bg-gray-50 border border-gray-300"
              >
                <td className="text-center border border-gray-300 p-2">
                  <input
                    type="checkbox"
                    checked={selectedInspections.includes(inspection.id)}
                    onChange={() => toggleSelect(inspection.id)}
                  />
                </td>
                <td className="px-2 py-3 border border-gray-300 text-center font-medium">
                  {inspection.id}
                </td>
                <td className="px-2 py-3 border border-gray-300">
                  <div className="font-medium">
                    {inspection.establishment.name}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {inspection.establishment.natureOfBusiness}
                  </div>
                </td>
                <td className="px-2 py-3 border border-gray-300">
                  <div className="text-xs">
                    {`${inspection.establishment.address.street}, ${inspection.establishment.address.barangay}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {`${inspection.establishment.address.city}, ${inspection.establishment.address.province}`}
                  </div>
                </td>
                <td className="px-2 py-3 border border-gray-300 text-center">
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
                <td className="px-2 py-3 border border-gray-300 text-center">
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
                        className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-green-600 hover:bg-green-700"
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
      {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalInspections) && (
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <div>
            Showing {filteredCount} of {totalInspections} inspection(s)
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sky-600 hover:text-sky-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Inspections Export Report"
        fileName={`inspections_export${
          localSearchQuery ? `_${localSearchQuery}` : ""
        }`}
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
            `${inspection.establishment.address.street}, ${inspection.establishment.address.city}`,
            inspection.establishment.natureOfBusiness,
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
