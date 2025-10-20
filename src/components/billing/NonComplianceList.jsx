import { useEffect, useState, useMemo, useRef } from "react";
import { mockApi } from "../../services/mockApi";
import { Search, Filter, X, Eye, Download, ArrowUpDown, ChevronDown } from "lucide-react";
import ExportDropdown from "../ExportDropdown";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";

export default function NonComplianceList({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for filtering
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [establishmentFilter, setEstablishmentFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedReports, setSelectedReports] = useState([]);
  const filterRef = useRef(null);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("noncompliance_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  useEffect(() => {
    mockApi.getNonCompliantReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  // Add this useEffect to handle clicks outside the filter dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    }

    if (filtersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen]);

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

  // Prepare data for export
  const exportColumns = ["Establishment", "Date", "Findings", "Status"];
  const exportRows =
    selectedReports.length > 0
      ? reports
          .filter((r) => selectedReports.includes(r.id))
          .map((r) => [
            r.establishment_name,
            formatDate(r.date),
            r.findings,
            r.status || "Pending",
          ])
      : filteredReports.map((r) => [
          r.establishment_name,
          formatDate(r.date),
          r.findings,
          r.status || "Pending",
        ]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header with search and filters */}
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <h2 className="text-2xl font-bold text-sky-600">
          Non-Compliant Establishments
        </h2>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-1 pl-10 pr-8 transition bg-gray-100 border-b border-gray-300 rounded min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute -translate-y-1/2 right-3 top-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
               className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
               <ArrowUpDown size={14} />
               Filters
               <ChevronDown size={14} />
              {(establishmentFilter.length > 0 ||
                statusFilter.length > 0 ||
                dateFrom ||
                 dateTo) && ` (${establishmentFilter.length +
                    statusFilter.length +
                    (dateFrom ? 1 : 0) +
                     (dateTo ? 1 : 0)})`}
            </button>

            {filtersOpen && (
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
            )}
          </div>

          <ExportDropdown
            title="Non-Compliance Reports"
            fileName="non_compliance_reports"
            columns={["ID", "Establishment", "Date", "Status", "Violations"]}
            rows={selectedReports.length > 0 ? 
              selectedReports.map(id => {
                const report = reports.find(r => r.id === id);
                return [
                  report.id,
                  report.establishment_name,
                  report.date,
                  report.status,
                  report.violations.length
                ];
              }) : 
              reports.map(report => [
                report.id,
                report.establishment_name,
                report.date,
                report.status,
                report.violations.length
              ])
            }
            disabled={reports.length === 0}
            className="flex items-center text-sm"
          />
        </div>
      </div>

      {/* Active filters display */}
      {(establishmentFilter.length > 0 ||
        statusFilter.length > 0 ||
        dateFrom ||
        dateTo) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {establishmentFilter.map((establishment) => (
            <span
              key={establishment}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 rounded"
            >
              Establishment: {establishment}
              <button onClick={() => toggleEstablishment(establishment)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {statusFilter.map((status) => (
            <span
              key={status}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 rounded"
            >
              Status: {status}
              <button onClick={() => toggleStatus(status)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {dateFrom && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 rounded">
              From: {new Date(dateFrom).toLocaleDateString()}
              <button onClick={() => setDateFrom("")}>
                <X size={12} />
              </button>
            </span>
          )}
          {dateTo && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 rounded">
              To: {new Date(dateTo).toLocaleDateString()}
              <button onClick={() => setDateTo("")}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {filteredReports.length === 0 ? (
        <p className="p-4 text-center text-gray-500">
          {reports.length === 0
            ? "No non-compliance reports found."
            : "No reports match your search criteria."}
        </p>
      ) : (
        <table className="w-full border-b border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-left text-white bg-gradient-to-r from-sky-600 to-sky-700">
              <th className="w-6 p-1 text-center border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedReports.length > 0 &&
                    selectedReports.length === paginatedReports.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-1 border-b border-gray-300">Establishment</th>
              <th className="p-1 border-b border-gray-300">Date</th>
              <th className="p-1 border-b border-gray-300">Findings</th>
              <th className="p-1 border-b border-gray-300">Status</th>
              <th className="p-1 border w-10 border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((r) => (
              <tr
                key={r.id}
                className="text-xs text-left border-b border-gray-300 hover:bg-gray-50"
              >
                <td className="text-center border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </td>
                <td className="px-2 border-b border-gray-300">
                  {r.establishment_name}
                </td>
                <td className="px-2 border-b border-gray-300">
                  {formatDate(r.date)}
                </td>
                <td className="px-2 border-b border-gray-300">
                  <div className="max-w-xs truncate" title={r.findings}>
                    {r.findings}
                  </div>
                </td>
                <td className="px-2 border text-center border-gray-300">
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
                <td className="p-1 text-center border-b border-gray-300">
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
