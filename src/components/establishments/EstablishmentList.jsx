import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Pencil,
  Map,
  Plus,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getEstablishments } from "../../services/api";
import ExportModal from "../ExportModal";
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

export default function EstablishmentList({
  onAdd,
  onEdit,
  onPolygon,
  refreshTrigger,
  canEditEstablishments,
}) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [provinceFilter, setProvinceFilter] = useState([]);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Export
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch data with server-side pagination
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Set search mode
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setSearchMode(true);
      } else {
        setSearchMode(false);
      }

      const response = await getEstablishments({
        page: currentPage,
        page_size: pageSize,
        ...(debouncedSearchQuery && debouncedSearchQuery.length >= 2 && { search: debouncedSearchQuery }),
        ...(provinceFilter.length > 0 && { province: provinceFilter.join(',') })
      });
      
      if (response.results) {
        // Server-side paginated response
        setEstablishments(response.results);
        setTotalCount(response.count || 0);
      } else {
        // Fallback for non-paginated response
        setEstablishments(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      console.error("Error fetching establishments:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching establishments");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, provinceFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

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
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "year_established", label: "Year Established" },
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
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
  };

  const clearProvinces = () => setProvinceFilter([]);
  const clearSearch = () => setSearchQuery("");

  const clearAllFilters = () => {
    setSearchQuery("");
    setProvinceFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Filter establishments locally when not in search mode
  const filteredEstablishments = useMemo(() => {
    if (searchMode) return establishments;

    let list = establishments.filter((e) => {
      const matchesProvince =
        provinceFilter.length === 0 || provinceFilter.includes(e.province);
      return matchesProvince;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "name" || sortConfig.key === "city") {
          aVal = aVal ? aVal.toLowerCase() : "";
          bVal = bVal ? bVal.toLowerCase() : "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [establishments, provinceFilter, sortConfig, searchMode]);

  // Selection
  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEstablishments.length === filteredEstablishments.length) {
      setSelectedEstablishments([]);
    } else {
      setSelectedEstablishments(filteredEstablishments.map((e) => e.id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const activeFilterCount = provinceFilter.length;
  const hasActiveFilters =
    searchQuery || provinceFilter.length > 0 || sortConfig.key;
  const provinces = ["LA UNION", "PANGASINAN", "ILOCOS SUR", "ILOCOS NORTE"];

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search establishments..."
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

          {/* Sort Dropdown */}
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

          {/* Filters */}
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
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Province
                    </h4>
                    {provinceFilter.length > 0 && (
                      <button
                        onClick={clearProvinces}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {provinces.map((province) => (
                    <button
                      key={province}
                      onClick={() => toggleProvince(province)}
                      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                        provinceFilter.includes(province)
                          ? "bg-sky-50 font-medium"
                          : ""
                      }`}
                    >
                      <span className="mr-2 text-xs text-sky-600">
                        {provinceFilter.includes(province) ? "•" : ""}
                      </span>
                      <span>{province}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => selectedEstablishments.length > 0 && setShowExportModal(true)}
            disabled={selectedEstablishments.length === 0}
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${
              selectedEstablishments.length > 0
                ? "text-white bg-sky-600 hover:bg-sky-700"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }`}
          >
            <Download size={14} /> Export ({selectedEstablishments.length})
          </button>
          {canEditEstablishments && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Plus size={16} /> Add Establishment
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
                    selectedEstablishments.length > 0 &&
                    selectedEstablishments.length ===
                      filteredEstablishments.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th
                className="p-1 border border-gray-300 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name {getSortIcon("name")}
                </div>
              </th>
              <th
                className="p-1 border border-gray-300 cursor-pointer"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center gap-1">
                  Address {getSortIcon("city")}
                </div>
              </th>
              <th className="p-1 text-center border border-gray-300">
                Coordinates
              </th>
              <th className="p-1 border border-gray-300">Nature of Business</th>
              <th
                className="p-1 text-center border border-gray-300 cursor-pointer"
                onClick={() => handleSort("year_established")}
              >
                <div className="flex items-center justify-center gap-1">
                  Year Established {getSortIcon("year_established")}
                </div>
              </th>
              <th className="p-1 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-2 py-6 text-center text-gray-500 border border-gray-300"
                >
                  <div
                    className="flex flex-col items-center justify-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">
                      Loading establishments...
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredEstablishments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-2 py-4 text-center text-gray-500 border border-gray-300"
                >
                  {hasActiveFilters ? (
                    <div>
                      No establishments found matching your criteria.
                      <br />
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 underline text-sky-600 hover:text-sky-700"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    "No establishments found."
                  )}
                </td>
              </tr>
            ) : (
              filteredEstablishments.map((e) => (
                <tr
                  key={e.id}
                  className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
                >
                  <td className="text-center border border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedEstablishments.includes(e.id)}
                      onChange={() => toggleSelect(e.id)}
                    />
                  </td>
                  <td className="px-2 font-semibold border border-gray-300">
                    {e.name}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {e.street_building}, {e.barangay}, {e.city}, {e.province},{" "}
                    {e.postal_code}
                  </td>
                  <td className="px-2 text-center border border-gray-300">
                    {e.latitude}, {e.longitude}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {e.nature_of_business}
                  </td>
                  <td className="px-2 text-center border border-gray-300">
                    {e.year_established}
                  </td>
                  <td className="relative w-20 p-1 text-center border border-gray-300">
                    <div className="flex justify-center gap-2">
                      {canEditEstablishments && (
                        <button
                          onClick={() => onEdit(e)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                          title="Edit"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => onPolygon(e)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                        title="Polygon"
                      >
                        <Map size={14} />
                        Polygon
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
        hasActiveFilters={searchMode && debouncedSearchQuery}
        onPageChange={goToPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        startItem={startItem}
        endItem={endItem}
      />

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Establishments Export Report"
        fileName={`establishments_export${
          searchQuery ? `_${searchQuery}` : ""
        }`}
        companyName="DENR Environmental Office"
        companySubtitle="Establishment Records System"
        logo="/logo.png"
        columns={[
          "Name",
          "Address",
          "Coordinates",
          "Nature of Business",
          "Year Established",
        ]}
        rows={selectedEstablishments.map((id) => {
          const e = establishments.find((x) => x.id === id);
          return [
            e.name,
            `${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}, ${e.postal_code}`,
            `Lat: ${e.latitude}, Lng: ${e.longitude}`,
            e.nature_of_business,
            e.year_established,
          ];
        })}
      />
    </div>
  );
}
