import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { getEstablishments } from "../../services/api";
import ExportModal from "../ExportModal";

export default function EstablishmentList({
  onAdd,
  onEdit,
  onPolygon,
  refreshTrigger,
  canEditEstablishments,
}) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Local search state
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState([]);

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ For export
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchEstablishments();
  }, [refreshTrigger]);

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

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching establishments");
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Sort options for dropdown - Updated to focus on Name, Year, City with asc/desc
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

  // Toggle province filter
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
  };

  // Clear provinces
  const clearProvinces = () => {
    setProvinceFilter([]);
  };

  // Clear local search
  const clearLocalSearch = () => {
    setLocalSearchQuery("");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setProvinceFilter([]);
    setSortConfig({ key: null, direction: null });
  };

  // ✅ Filter + Sort with LOCAL search
  const filteredEstablishments = useMemo(() => {
    let list = establishments.filter((e) => {
      // Apply local search filter
      const query = localSearchQuery.toLowerCase();
      const matchesSearch = localSearchQuery
        ? e.name.toLowerCase().includes(query) ||
          `${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}, ${e.postal_code}`
            .toLowerCase()
            .includes(query) ||
          e.nature_of_business.toLowerCase().includes(query) ||
          String(e.year_established).includes(query)
        : true;

      // Apply province filter
      const matchesProvince =
        provinceFilter.length === 0 || provinceFilter.includes(e.province);

      return matchesSearch && matchesProvince;
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
  }, [establishments, localSearchQuery, provinceFilter, sortConfig]);

  // ✅ Selection
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

  // Filter count for badge
  const activeFilterCount = provinceFilter.length;

  if (loading) {
    return <p className="p-4">Loading establishments...</p>;
  }

  const totalEstablishments = establishments.length;
  const filteredCount = filteredEstablishments.length;
  const hasActiveFilters =
    localSearchQuery || provinceFilter.length > 0 || sortConfig.key;

  const provinces = ["LA UNION", "PANGASINAN", "ILOCOS SUR", "ILOCOS NORTE"];

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search establishments..."
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

          {/* 🔽 Sort Dropdown - Updated for field selection then asc/desc */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <ArrowUpDown size={14} />
              Sort by {/* Always shows "Sort by" */}
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-40 p-2 mt-2 bg-white border rounded shadow">
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

          {/* 🎚 Filters dropdown - Improved to match sort style */}
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
                {/* Province Section */}
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
                      <span className="text-xs text-sky-600 mr-2">
                        {provinceFilter.includes(province) ? "•" : ""}
                      </span>
                      <span>{province}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedEstablishments.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Download size={14} /> Export ({selectedEstablishments.length})
            </button>
          )}
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
          {filteredEstablishments.length === 0 ? (
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
                      className="mt-2 text-sky-600 hover:text-sky-700 underline"
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

      {/* 📊 Search results info - MOVED TO BOTTOM */}
      {(hasActiveFilters || filteredCount !== totalEstablishments) && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <div>
            Showing {filteredCount} of {totalEstablishments} establishment(s)
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

      {/* ✅ Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Establishments Export Report"
        fileName={`establishments_export${
          localSearchQuery ? `_${localSearchQuery}` : ""
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
