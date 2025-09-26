import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Filter,
  Download,
} from "lucide-react";

const WORKFLOW_STAGES = {
  PENDING: { label: "Pending", color: "gray", order: 0 },
  LEGAL_REVIEW: { label: "Legal Review", color: "blue", order: 1 },
  DIVISION_CREATED: { label: "Division Created", color: "purple", order: 2 },
  SECTION_REVIEW: { label: "Section Review", color: "yellow", order: 3 },
  UNIT_REVIEW: { label: "Unit Review", color: "orange", order: 4 },
  MONITORING_INSPECTION: {
    label: "Monitoring Inspection",
    color: "red",
    order: 5,
  },
  COMPLETED: { label: "Completed", color: "green", order: 6 },
  REJECTED: { label: "Rejected", color: "red", order: 7 },
};

const ROLE_ACTIONS = {
  "Legal Unit": {
    canCreate: true,
    canReview: true,
    canAdvance: true,
    fields: ["billing_record", "compliance_call"],
    action: "legal_review",
  },
  "Division Chief": {
    canCreate: true,
    canReview: true,
    canAdvance: true,
    fields: ["inspection_list", "applicable_laws"],
    action: "division_create",
  },
  "Section Chief": {
    canCreate: true,
    canReview: true,
    canAdvance: true,
    fields: [],
    action: "section_review",
  },
  "Unit Head": {
    canCreate: true,
    canReview: true,
    canAdvance: true,
    fields: [],
    action: "unit_review",
  },
  "Monitoring Personnel": {
    canCreate: true,
    canReview: true,
    canAdvance: true,
    fields: ["inspection_notes"],
    action: "monitoring_inspection",
  },
};

export default function InspectionWorkflow({
  inspection,
  userLevel,
  onUpdate,
  onClose,
}) {
  const [formData, setFormData] = useState({
    billing_record: inspection.billing_record || "",
    compliance_call: inspection.compliance_call || "",
    inspection_list: inspection.inspection_list || "",
    applicable_laws: inspection.applicable_laws || "",
    inspection_notes: inspection.inspection_notes || "",
    comments: inspection.workflow_comments || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 Search, Sort, and Filter State
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const currentStage = WORKFLOW_STAGES[inspection.status];
  const userRole = ROLE_ACTIONS[userLevel];
  const canAct = inspection.can_act && userRole;

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

  // Mock workflow history data for demonstration
  const workflowHistory = useMemo(
    () => [
      {
        id: 1,
        action: "Created",
        by: "Legal Unit",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        comments: "Initial inspection created",
        status: "PENDING",
      },
      {
        id: 2,
        action: "Reviewed",
        by: "Division Chief",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        comments: "Assigned to section",
        status: "DIVISION_CREATED",
      },
      {
        id: 3,
        action: "Assigned",
        by: "Section Chief",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        comments: "Forwarded to monitoring team",
        status: "SECTION_REVIEW",
      },
      // Add more mock data as needed
    ],
    []
  );

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
    { key: "timestamp", label: "Date" },
    { key: "by", label: "User" },
    { key: "action", label: "Action" },
    { key: "status", label: "Status" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  const getCurrentSortLabel = () => {
    if (!sortConfig.key) return "Sort by";
    const field = sortFields.find((f) => f.key === sortConfig.key);
    const direction = sortDirections.find(
      (d) => d.key === sortConfig.direction
    );
    return `${field?.label} (${direction?.label})`;
  };

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
    setSortDropdownOpen(false);
  };

  // Filter functions
  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleSection = (section) => {
    setSectionFilter((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // ✅ Filter + Sort workflow history
  const filteredWorkflowHistory = useMemo(() => {
    let list = workflowHistory.filter((item) => {
      // Apply local search filter
      const query = localSearchQuery.toLowerCase();
      const matchesSearch = localSearchQuery
        ? item.action.toLowerCase().includes(query) ||
          item.by.toLowerCase().includes(query) ||
          item.comments.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
        : true;

      // Apply status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(item.status);

      // Apply section filter (using 'by' field as section)
      const matchesSection =
        sectionFilter.length === 0 || sectionFilter.includes(item.by);

      return matchesSearch && matchesStatus && matchesSection;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "timestamp") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    workflowHistory,
    localSearchQuery,
    statusFilter,
    sectionFilter,
    sortConfig,
  ]);

  // Clear functions
  const clearLocalSearch = () => setLocalSearchQuery("");
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setStatusFilter([]);
    setSectionFilter([]);
    setSortConfig({ key: null, direction: null });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdvance = async () => {
    if (!canAct) return;

    setLoading(true);
    setError("");

    try {
      const action = userRole.action;
      const response = await api.post(
        `/inspections/${inspection.id}/${action}/`,
        formData
      );

      if (response.data) {
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to advance inspection");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        `/inspections/${inspection.id}/advance/`,
        {
          ...formData,
          status: "REJECTED",
        }
      );

      if (response.data) {
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reject inspection");
    } finally {
      setLoading(false);
    }
  };

  const renderStageIndicator = () => {
    const stages = Object.entries(WORKFLOW_STAGES)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, stage]) => {
        const isActive = key === inspection.status;
        const isCompleted =
          WORKFLOW_STAGES[inspection.status]?.order > stage.order;

        return (
          <div key={key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isActive
                  ? `bg-${stage.color}-500 text-white`
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stage.order + 1}
            </div>
            <span className={`ml-2 text-sm ${isActive ? "font-medium" : ""}`}>
              {stage.label}
            </span>
            {key !== "REJECTED" && (
              <div className="w-8 h-0.5 bg-gray-200 mx-2" />
            )}
          </div>
        );
      });

    return (
      <div className="flex items-center overflow-x-auto py-4">{stages}</div>
    );
  };

  const renderRoleSpecificFields = () => {
    if (!userRole?.fields) return null;

    return userRole.fields.map((field) => {
      const fieldLabels = {
        billing_record: "Billing Record",
        compliance_call: "Compliance Call",
        inspection_list: "Inspection List",
        applicable_laws: "Applicable Laws",
        inspection_notes: "Inspection Notes",
      };

      return (
        <div key={field} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {fieldLabels[field]}
          </label>
          <textarea
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder={`Enter ${fieldLabels[field].toLowerCase()}...`}
          />
        </div>
      );
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeFilterCount = statusFilter.length + sectionFilter.length;
  const hasActiveFilters =
    localSearchQuery ||
    statusFilter.length > 0 ||
    sectionFilter.length > 0 ||
    sortConfig.key;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Inspection Workflow - {inspection.code}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Establishment Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Establishment</h3>
            <p className="text-gray-700">
              {inspection.establishment_detail?.name}
            </p>
            <p className="text-sm text-gray-500">
              {inspection.establishment_detail?.nature_of_business}
            </p>
          </div>

          {/* Workflow Stages */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Workflow Progress
            </h3>
            {renderStageIndicator()}
          </div>

          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Current Status</h3>
            <p className="text-blue-800">
              {currentStage.label} -{" "}
              {inspection.current_assignee_name || "Unassigned"}
            </p>
            {inspection.workflow_comments && (
              <p className="text-sm text-blue-700 mt-2">
                Comments: {inspection.workflow_comments}
              </p>
            )}
          </div>

          {/* Role-specific fields */}
          {canAct && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {userLevel} Actions
              </h3>
              {renderRoleSpecificFields()}

              {/* Comments */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) =>
                    handleInputChange("comments", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add comments..."
                />
              </div>
            </div>
          )}

          {/* Workflow History with Search, Sort, and Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Workflow History
            </h3>

            {/* Search and Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* 🔍 Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full max-w-xs py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                  {getCurrentSortLabel()}
                  <ChevronDown size={14} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 z-20 w-40 p-2 mt-2 bg-white border rounded shadow">
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

              {/* 🎚 Filters Dropdown */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                >
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </button>

                {filtersOpen && (
                  <div className="absolute right-0 z-20 w-56 p-2 mt-2 bg-white border rounded shadow">
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
                      {Object.keys(WORKFLOW_STAGES).map((status) => (
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
                          <span>{WORKFLOW_STAGES[status].label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Section Filter */}
                    <div className="mb-2">
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
                      {[
                        "Legal Unit",
                        "Division Chief",
                        "Section Chief",
                        "Unit Head",
                        "Monitoring Personnel",
                      ].map((section) => (
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
                          <span>{section}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear All Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-2 py-1 text-sm text-sky-600 hover:text-sky-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Workflow History Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-left text-white bg-sky-700">
                    <th className="p-2 border border-gray-300">Date & Time</th>
                    <th className="p-2 border border-gray-300">Action</th>
                    <th className="p-2 border border-gray-300">By</th>
                    <th className="p-2 border border-gray-300">Status</th>
                    <th className="p-2 border border-gray-300">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkflowHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        {hasActiveFilters ? (
                          <div>
                            No workflow history found matching your criteria.
                            <br />
                            <button
                              onClick={clearAllFilters}
                              className="mt-2 text-sky-600 hover:text-sky-700 underline"
                            >
                              Clear all filters
                            </button>
                          </div>
                        ) : (
                          "No workflow history available."
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredWorkflowHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="text-sm border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-2 border border-gray-300">
                          {formatDate(item.timestamp)}
                        </td>
                        <td className="p-2 border border-gray-300 font-medium">
                          {item.action}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {item.by}
                        </td>
                        <td className="p-2 border border-gray-300">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : item.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {WORKFLOW_STAGES[item.status]?.label || item.status}
                          </span>
                        </td>
                        <td className="p-2 border border-gray-300 text-gray-600">
                          {item.comments}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            {(hasActiveFilters ||
              filteredWorkflowHistory.length !== workflowHistory.length) && (
              <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                <div>
                  Showing {filteredWorkflowHistory.length} of{" "}
                  {workflowHistory.length} history item(s)
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>

            {canAct && (
              <>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Reject"}
                </button>
                <button
                  onClick={handleAdvance}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Advance"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
