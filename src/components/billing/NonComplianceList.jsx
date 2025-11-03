import { useEffect, useState, useMemo } from "react";
import { mockApi } from "../../services/mockApi";
import { X, Eye } from "lucide-react";
import PaginationControls from "../PaginationControls";
import { useLocalStoragePagination } from "../../hooks/useLocalStoragePagination";
import { getProfile } from "../../services/api";
import { canExportAndPrint } from "../../utils/permissions";
import TableToolbar from "../common/TableToolbar";

export default function NonComplianceList({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔒 User level for permissions
  const [userLevel, setUserLevel] = useState(null);

  // State for filtering
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [establishmentFilter, setEstablishmentFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedReports, setSelectedReports] = useState([]);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("noncompliance_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // Fetch user level on mount
  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const profile = await getProfile();
        setUserLevel(profile.userlevel);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to localStorage
        setUserLevel(localStorage.getItem('userLevel') || null);
      }
    };
    fetchUserLevel();
  }, []);

  useEffect(() => {
    mockApi.getNonCompliantReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  // Get unique establishment names for filter
  const establishmentNames = useMemo(() => {
    return [
      ...new Set(reports.map((report) => report.establishment_name)),
    ].sort();
  }, [reports]);

  // Get unique status values for filter
  const statusOptions = useMemo(() => {
    return [
      ...new Set(reports.map((report) => report.status || "Pending")),
    ].sort();
  }, [reports]);

  // Filtering logic
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Search filter
      const matchesSearch =
        report.establishment_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        report.findings.toLowerCase().includes(search.toLowerCase()) ||
        report.date.toLowerCase().includes(search.toLowerCase());

      // Establishment filter
      const matchesEstablishment =
        establishmentFilter.length === 0 ||
        establishmentFilter.includes(report.establishment_name);

      // Status filter
      const reportStatus = report.status || "Pending";
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(reportStatus);

      // Date filter
      const reportDate = new Date(report.date);
      const matchesDateFrom = dateFrom
        ? reportDate >= new Date(dateFrom)
        : true;
      const matchesDateTo = dateTo ? reportDate <= new Date(dateTo) : true;

      return (
        matchesSearch &&
        matchesEstablishment &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [reports, search, establishmentFilter, statusFilter, dateFrom, dateTo]);

  // Pagination logic
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const totalCount = reports.length;
  const filteredCount = filteredReports.length;

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCount);

  // Check if there are active filters
  const hasActiveFilters = 
    search || 
    establishmentFilter.length > 0 || 
    statusFilter.length > 0 || 
    dateFrom || 
    dateTo;

  // Toggle functions for filters
  const toggleEstablishment = (establishment) => {
    setEstablishmentFilter((prev) =>
      prev.includes(establishment)
        ? prev.filter((e) => e !== establishment)
        : [...prev, establishment]
    );
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Bulk selection functions
  const toggleSelect = (id) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === paginatedReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(paginatedReports.map((r) => r.id));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Custom filters dropdown
  const customFiltersDropdown = useMemo(() => {
    if (!filtersOpen) return null;
    
    return (
      <div className="absolute right-0 top-full z-20 w-64 mt-1 bg-white border border-gray-200 rounded shadow max-h-80 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
              Filter Options
            </div>
            {(establishmentFilter.length > 0 || statusFilter.length > 0 || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setEstablishmentFilter([]);
                  setStatusFilter([]);
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Establishment filter */}
          <div className="mb-3">
            <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Establishment
            </div>
            <div className="max-h-32 overflow-y-auto">
              {establishmentNames.map((establishment) => (
                <button
                  key={establishment}
                  onClick={() => toggleEstablishment(establishment)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                    establishmentFilter.includes(establishment) ? "bg-sky-50 font-medium" : ""
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate">{establishment}</div>
                  </div>
                  {establishmentFilter.includes(establishment) && (
                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="mb-3">
            <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Status
            </div>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                  statusFilter.includes(status) ? "bg-sky-50 font-medium" : ""
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium">{status}</div>
                </div>
                {statusFilter.includes(status) && (
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Date Range filter */}
          <div className="mb-2">
            <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Date Range
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-b border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-b border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [filtersOpen, establishmentFilter, statusFilter, dateFrom, dateTo, establishmentNames, statusOptions, toggleEstablishment, toggleStatus]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-sky-600 mb-3">
          Non-Compliant Establishments
        </h2>

        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          onSearchClear={() => setSearch("")}
          searchPlaceholder="Search reports..."
          onFilterClick={() => setFiltersOpen(!filtersOpen)}
          customFilterDropdown={customFiltersDropdown}
          filterOpen={filtersOpen}
          onFilterClose={() => setFiltersOpen(false)}
          exportConfig={canExportAndPrint(userLevel, 'billing') ? {
            title: "Non-Compliance Reports Export",
            fileName: "non_compliance_reports_export",
            columns: selectedReports.length > 0 
              ? ["ID", "Establishment", "Date", "Status", "Violations"]
              : ["Establishment", "Date", "Findings", "Status"],
            rows: selectedReports.length > 0
              ? selectedReports.map(id => {
                  const report = reports.find(r => r.id === id);
                  return [
                    report.id,
                    report.establishment_name,
                    formatDate(report.date),
                    report.status,
                    report.violations.length
                  ];
                })
              : filteredReports.map(r => [
                  r.establishment_name,
                  formatDate(r.date),
                  r.findings,
                  r.status || "Pending"
                ])
          } : null}
          printConfig={canExportAndPrint(userLevel, 'billing') ? {
            title: "Non-Compliance Reports Print",
            fileName: "non_compliance_reports_print",
            columns: selectedReports.length > 0 
              ? ["ID", "Establishment", "Date", "Status", "Violations"]
              : ["Establishment", "Date", "Findings", "Status"],
            rows: selectedReports.length > 0
              ? selectedReports.map(id => {
                  const report = reports.find(r => r.id === id);
                  return [
                    report.id,
                    report.establishment_name,
                    formatDate(report.date),
                    report.status,
                    report.violations.length
                  ];
                })
              : filteredReports.map(r => [
                  r.establishment_name,
                  formatDate(r.date),
                  r.findings,
                  r.status || "Pending"
                ]),
            selectedCount: selectedReports.length || filteredReports.length
          } : null}
        />
      </div>


      {filteredReports.length === 0 ? (
        <p className="p-4 text-center text-gray-500">
          {reports.length === 0
            ? "No non-compliance reports found."
            : "No reports match your search criteria."}
        </p>
      ) : (
        <table className="w-full border-b border-gray-300 rounded">
          <thead>
            <tr className="text-sm text-left text-white bg-gradient-to-r from-sky-600 to-sky-700">
              <th className="w-6 px-3 py-2 text-center border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedReports.length > 0 &&
                    selectedReports.length === paginatedReports.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-2 border-b border-gray-300">Establishment</th>
              <th className="px-3 py-2 border-b border-gray-300">Date</th>
              <th className="px-3 py-2 border-b border-gray-300">Findings</th>
              <th className="px-3 py-2 border-b border-gray-300">Status</th>
              <th className="px-3 py-2 border-b border-gray-300 w-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((r) => (
              <tr
                key={r.id}
                className="text-xs text-left border-b border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <td className="text-center px-3 py-2 border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </td>
                <td className="px-3 py-2 border-b border-gray-300">
                  {r.establishment_name}
                </td>
                <td className="px-3 py-2 border-b border-gray-300">
                  {formatDate(r.date)}
                </td>
                <td className="px-3 py-2 border-b border-gray-300">
                  <div className="max-w-xs truncate" title={r.findings}>
                    {r.findings}
                  </div>
                </td>
                <td className="px-3 py-2 text-center border-b border-gray-300">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold border border-gray-400 rounded ${
                      r.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status || "Pending"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center border-b border-gray-300">
                  <button
                    onClick={() => onSelectReport(r)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount}
        filteredItems={filteredCount}
        hasActiveFilters={hasActiveFilters}
        onPageChange={goToPage}
        onPageSizeChange={handlePageSizeChange}
        startItem={startItem}
        endItem={endItem}
        storageKey="noncompliance_list"
      />

    </div>
  );
}
