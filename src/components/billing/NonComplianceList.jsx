import { useEffect, useState, useMemo, useRef } from "react";
import { mockApi } from "../../services/mockApi";
import { Search, Filter, X, Eye, Download } from "lucide-react";
import ExportModal from "../ExportModal";

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
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const filterRef = useRef(null);

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
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
              size={16}
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-1 pl-8 pr-2 text-sm border rounded"
            />
          </div>

          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
              {(establishmentFilter.length > 0 ||
                statusFilter.length > 0 ||
                dateFrom ||
                dateTo) && (
                <span className="flex items-center justify-center w-4 h-4 text-xs bg-red-500 rounded-full">
                  {establishmentFilter.length +
                    statusFilter.length +
                    (dateFrom ? 1 : 0) +
                    (dateTo ? 1 : 0)}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 p-3 mt-2 bg-white border rounded shadow w-82">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">Filters</h4>
                  <button
                    onClick={() => {
                      setEstablishmentFilter([]);
                      setStatusFilter([]);
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>

                {/* Establishment filter */}
                <h5 className="mt-2 mb-1 text-sm font-semibold">
                  Establishment
                </h5>
                <div className="max-h-32 overflow-y-auto">
                  {establishmentNames.map((establishment) => (
                    <label
                      key={establishment}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={establishmentFilter.includes(establishment)}
                        onChange={() => toggleEstablishment(establishment)}
                      />
                      <span className="truncate">{establishment}</span>
                    </label>
                  ))}
                </div>

                {/* Status filter */}
                <h5 className="mt-3 mb-1 text-sm font-semibold">Status</h5>
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    {status}
                  </label>
                ))}

                {/* Date Range filter */}
                <h5 className="mt-3 mb-1 text-sm font-semibold">Date Range</h5>
                <div className="flex items-center gap-2 text-sm">
                  <label className="flex flex-col flex-1">
                    From
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-2 py-1 mt-1 border rounded"
                    />
                  </label>
                  <label className="flex flex-col flex-1">
                    To
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-2 py-1 mt-1 border rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => selectedReports.length > 0 && setShowExportModal(true)}
            disabled={selectedReports.length === 0}
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${
              selectedReports.length > 0
                ? "text-white bg-sky-600 hover:bg-sky-700"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }`}
          >
            <Download size={14} /> Export ({selectedReports.length})
          </button>
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
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-left text-white bg-sky-700">
              <th className="w-6 p-1 text-center border border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedReports.length > 0 &&
                    selectedReports.length === filteredReports.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-1 border border-gray-300">Establishment</th>
              <th className="p-1 border border-gray-300">Date</th>
              <th className="p-1 border border-gray-300">Findings</th>
              <th className="p-1 border border-gray-300">Status</th>
              <th className="p-1 border w-10 border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r) => (
              <tr
                key={r.id}
                className="text-xs text-left border border-gray-300 hover:bg-gray-50"
              >
                <td className="text-center border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </td>
                <td className="px-2 border border-gray-300">
                  {r.establishment_name}
                </td>
                <td className="px-2 border border-gray-300">
                  {formatDate(r.date)}
                </td>
                <td className="px-2 border border-gray-300">
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
                <td className="p-1 text-center border border-gray-300">
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

      {/* Results count */}
      {filteredReports.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Non-Compliance Reports"
        fileName="non_compliance_reports"
        columns={exportColumns}
        rows={exportRows}
      />
    </div>
  );
}
