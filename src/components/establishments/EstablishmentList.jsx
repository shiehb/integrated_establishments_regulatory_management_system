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
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";
import { useNotifications } from "../NotificationManager";

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
  const notifications = useNotifications();

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("establishments_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);
  const [searchMode, setSearchMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [businessTypeFilter, setBusinessTypeFilter] = useState([]);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Export
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);

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
        ...(debouncedSearchQuery &&
          debouncedSearchQuery.length >= 2 && { search: debouncedSearchQuery }),
        ...(provinceFilter.length > 0 && {
          province: provinceFilter.join(","),
        }),
        ...(businessTypeFilter.length > 0 && {
          nature_of_business: businessTypeFilter.join(","),
        }),
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
      notifications.error(
        "Error fetching establishments",
        {
          title: "Fetch Error",
          duration: 8000
        }
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, provinceFilter, businessTypeFilter]);

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
    // Removed auto-close: setSortDropdownOpen(false);
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
    // Removed auto-close: setSortDropdownOpen(false);
  };

  // Filter functions
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
  };

  const toggleBusinessType = (businessType) => {
    setBusinessTypeFilter((prev) =>
      prev.includes(businessType)
        ? prev.filter((b) => b !== businessType)
        : [...prev, businessType]
    );
  };

  const clearProvinces = () => setProvinceFilter([]);
  const clearBusinessTypes = () => setBusinessTypeFilter([]);
  const clearSearch = () => setSearchQuery("");

  const clearAllFilters = () => {
    setSearchQuery("");
    setProvinceFilter([]);
    setBusinessTypeFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Filter establishments locally when not in search mode
  const filteredEstablishments = useMemo(() => {
    if (searchMode) return establishments;

    let list = establishments.filter((e) => {
      const matchesProvince =
        provinceFilter.length === 0 || provinceFilter.includes(e.province);
      const matchesBusinessType =
        businessTypeFilter.length === 0 || businessTypeFilter.includes(e.nature_of_business);
      return matchesProvince && matchesBusinessType;
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
  }, [establishments, provinceFilter, businessTypeFilter, sortConfig, searchMode]);

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

  const activeFilterCount = provinceFilter.length + businessTypeFilter.length;
  const hasActiveFilters =
    searchQuery || provinceFilter.length > 0 || businessTypeFilter.length > 0 || sortConfig.key;

  // Calculate filtered count for display
  const filteredCount =
    searchMode || provinceFilter.length > 0 || businessTypeFilter.length > 0 ? totalCount : totalCount;
  const totalEstablishments = totalCount;

  const provinces = ["LA UNION", "PANGASINAN", "ILOCOS SUR", "ILOCOS NORTE"];
  
  // Get unique business types from establishments
  const businessTypes = useMemo(() => {
    return [
      ...new Set(
        establishments.map((e) => e.nature_of_business).filter(Boolean)
      ),
    ].sort();
  }, [establishments]);

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-10 pr-8 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowUpDown size={14} />
              Sort
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  {/* Header */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    Sort Options
                  </div>

                  {/* Sort Fields */}
                  <div className="mt-2 mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Sort by
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
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <span>{field.label}</span>
                        {sortConfig.key === field.key && (
                          <div className="flex items-center gap-1">
                            {sortConfig.direction === "asc" ? (
                              <ArrowUp size={14} className="text-sky-600" />
                            ) : (
                              <ArrowDown size={14} className="text-sky-600" />
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Clear Sort */}
                  {sortConfig.key && (
                    <>
                      <div className="my-1 border-t border-gray-200"></div>
                      <button
                        onClick={() => setSortConfig({ key: null, direction: null })}
                        className="w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-left"
                      >
                        Clear Sort
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={14} />
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-sky-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  {/* Header with Clear All */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filters
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          clearProvinces();
                          clearBusinessTypes();
                        }}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Province Section */}
                  <div className="mb-3">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Province
                    </div>
                    {provinces.map((province) => (
                      <button
                        key={province}
                        onClick={() => toggleProvince(province)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          provinceFilter.includes(province) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{province}</div>
                        </div>
                        {provinceFilter.includes(province) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Business Type Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Business Type
                    </div>
                    {businessTypes.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">
                        No business types available
                      </div>
                    ) : (
                      businessTypes.map((businessType) => (
                        <button
                          key={businessType}
                          onClick={() => toggleBusinessType(businessType)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                            businessTypeFilter.includes(businessType) ? "bg-sky-50 font-medium" : ""
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div className="font-medium">{businessType}</div>
                          </div>
                          {businessTypeFilter.includes(businessType) && (
                            <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <ExportDropdown
            title="Establishments Export Report"
            fileName={`establishments_export${searchQuery ? `_${searchQuery}` : ""}`}
            columns={["ID", "Name", "Nature of Business", "Province", "City", "Year Established", "Status"]}
            rows={selectedEstablishments.length > 0 ? 
              selectedEstablishments.map(id => {
                const establishment = establishments.find(e => e.id === id);
                return [
                  establishment.id,
                  establishment.name,
                  establishment.nature_of_business,
                  establishment.province,
                  establishment.city,
                  establishment.year_established,
                  "Active"
                ];
              }) : 
              establishments.map(establishment => [
                establishment.id,
                establishment.name,
                establishment.nature_of_business,
                establishment.province,
                establishment.city,
                establishment.year_established,
                "Active"
              ])
            }
            disabled={establishments.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Establishments Report"
            fileName="establishments_report"
            columns={["ID", "Name", "Nature of Business", "Province", "City", "Year Established", "Status"]}
            rows={selectedEstablishments.length > 0 ? 
              selectedEstablishments.map(id => {
                const establishment = establishments.find(e => e.id === id);
                return establishment ? [
                  establishment.id,
                  establishment.name,
                  establishment.nature_of_business,
                  establishment.province,
                  establishment.city,
                  establishment.year_established,
                  "Active"
                ] : [];
              }).filter(row => row.length > 0) : 
              establishments.map(establishment => [
                establishment.id,
                establishment.name,
                establishment.nature_of_business,
                establishment.province,
                establishment.city,
                establishment.year_established,
                "Active"
              ])
            }
            selectedCount={selectedEstablishments.length}
            disabled={establishments.length === 0}
            className="flex items-center text-sm"
          />

          {canEditEstablishments && (
            <button
              onClick={onAdd}
              className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Plus size={16} /> Add Establishment
            </button>
          )}
        </div>
      </div>

      {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalEstablishments) && (
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <div>
            {filteredCount === totalEstablishments
              ? `Showing all ${totalEstablishments} establishment(s)`
              : `Showing ${filteredCount} of ${totalEstablishments} establishment(s)`}
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
      <div className="overflow-auto h-[calc(100vh-270px)] border border-gray-300 rounded-lg scroll-smooth custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-left text-white bg-sky-700 sticky top-0 z-10">
              <th className="w-6 p-1 text-center border-b border-gray-300">
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
                className="p-1 border-b border-gray-300 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name {getSortIcon("name")}
                </div>
              </th>
              <th
                className="p-1 border-b border-gray-300 cursor-pointer"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center gap-1">
                  Address {getSortIcon("city")}
                </div>
              </th>
              <th className="p-1 text-center border-b border-gray-300">
                Coordinates
              </th>
              <th className="p-1 border-b border-gray-300">Nature of Business</th>
              <th
                className="p-1 text-center border-b border-gray-300 cursor-pointer"
                onClick={() => handleSort("year_established")}
              >
                <div className="flex items-center justify-center gap-1">
                  Year Established {getSortIcon("year_established")}
                </div>
              </th>
              <th className="p-1 text-center border-b border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-2 py-6 text-center text-gray-500 border-b border-gray-300"
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
                  className="px-2 py-4 text-center text-gray-500 border-b border-gray-300"
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
                  className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
                >
                  <td className="text-center border-b border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedEstablishments.includes(e.id)}
                      onChange={() => toggleSelect(e.id)}
                    />
                  </td>
                  <td className="px-2 font-semibold border-b border-gray-300">
                    {e.name}
                  </td>
                  <td className="px-2 border-b border-gray-300">
                    {e.street_building}, {e.barangay}, {e.city}, {e.province},{" "}
                    {e.postal_code}
                  </td>
                  <td className="px-2 text-center border-b border-gray-300">
                    {e.latitude}, {e.longitude}
                  </td>
                  <td className="px-2 border-b border-gray-300">
                    {e.nature_of_business}
                  </td>
                  <td className="px-2 text-center border-b border-gray-300">
                    {e.year_established}
                  </td>
                  <td className="relative w-20 p-1 text-center border-b border-gray-300">
                    <div className="flex justify-center gap-2">
                      {canEditEstablishments && (
                        <button
                          onClick={() => onEdit(e)}
                          className="flex items-center px-3 py-1 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
                          title="Edit"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => onPolygon(e)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
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
        storageKey="establishments_list"
      />

    </div>
  );
}
