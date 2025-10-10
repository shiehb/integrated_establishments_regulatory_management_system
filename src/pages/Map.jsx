import { useState, useRef, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";
import L from "leaflet";
import { getEstablishments } from "../services/api";
import { useNotifications } from "../components/NotificationManager";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Fix for default markers in react-leaflet - using local assets for offline support
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/assets/map/marker-icon-2x.png",
  iconUrl: "/assets/map/marker-icon.png",
  shadowUrl: "/assets/map/marker-shadow.png",
});

const blueIcon = new L.Icon({
  iconUrl: "/assets/map/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: "/assets/map/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "/assets/map/marker-icon.png", // Using blue icon for now, can be customized later
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: "/assets/map/marker-shadow.png",
  className: "green-marker", // Add CSS class to style as green
});

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

// Focus map on a clicked establishment
function MapFocus({ establishment }) {
  const map = useMap();
  useEffect(() => {
    if (establishment) {
      map.setView(
        [
          parseFloat(establishment.latitude),
          parseFloat(establishment.longitude),
        ],
        16
      );
    }
  }, [establishment, map]);
  return null;
}

export default function MapPage() {
  const mapRef = useRef(null);
  const [allEstablishments, setAllEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedEstablishment, setFocusedEstablishment] = useState(null);
  const notifications = useNotifications();

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [businessTypeFilter, setBusinessTypeFilter] = useState([]);

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all establishments from API
  useEffect(() => {
    fetchAllEstablishments();
  }, []);

  const fetchAllEstablishments = async () => {
    setLoading(true);
    try {
      // Get all establishments for the map (use a large page size)
      const data = await getEstablishments({ page: 1, page_size: 10000 });

      // Handle both paginated and non-paginated responses
      if (data.results) {
        setAllEstablishments(data.results);
      } else {
        setAllEstablishments(data);
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
  };

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

  // Sort options for dropdown
  const sortFields = [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "province", label: "Province" },
    { key: "nature_of_business", label: "Business Type" },
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

  // ✅ Filter + Sort with LOCAL search (client-side only)
  const filteredEstablishments = useMemo(() => {
    let list = allEstablishments.filter((e) => {
      // Apply local search filter
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch = debouncedSearchQuery
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

      // Apply business type filter
      const matchesBusinessType =
        businessTypeFilter.length === 0 ||
        businessTypeFilter.includes(e.nature_of_business);

      return matchesSearch && matchesProvince && matchesBusinessType;
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (
          sortConfig.key === "name" ||
          sortConfig.key === "city" ||
          sortConfig.key === "province" ||
          sortConfig.key === "nature_of_business"
        ) {
          aVal = aVal ? aVal.toLowerCase() : "";
          bVal = bVal ? bVal.toLowerCase() : "";
        }

        if (sortConfig.key === "year_established") {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    allEstablishments,
    debouncedSearchQuery,
    provinceFilter,
    businessTypeFilter,
    sortConfig,
  ]);

  // ✅ Pagination
  const paginatedEstablishments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEstablishments.slice(startIndex, endIndex);
  }, [filteredEstablishments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEstablishments.length / pageSize);

  // Toggle province filter
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
    setCurrentPage(1);
  };

  // Toggle business type filter
  const toggleBusinessType = (businessType) => {
    setBusinessTypeFilter((prev) =>
      prev.includes(businessType)
        ? prev.filter((b) => b !== businessType)
        : [...prev, businessType]
    );
    setCurrentPage(1);
  };

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setProvinceFilter([]);
    setBusinessTypeFilter([]);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Get unique provinces and business types for filters
  const provinces = useMemo(() => {
    return [
      ...new Set(allEstablishments.map((e) => e.province).filter(Boolean)),
    ].sort();
  }, [allEstablishments]);

  const businessTypes = useMemo(() => {
    return [
      ...new Set(
        allEstablishments.map((e) => e.nature_of_business).filter(Boolean)
      ),
    ].sort();
  }, [allEstablishments]);

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const activeFilterCount = provinceFilter.length + businessTypeFilter.length;
  const hasActiveFilters =
    searchQuery ||
    provinceFilter.length > 0 ||
    businessTypeFilter.length > 0 ||
    sortConfig.key;

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(
    currentPage * pageSize,
    filteredEstablishments.length
  );

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="p-4 bg-white h-[calc(100vh-165px)]">
          {/* Header with Search, Filters, and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h1 className="text-2xl font-bold text-sky-600">
              Establishments Map
            </h1>

            <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
              {/* 🔍 Local Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search establishments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-1 pl-10 pr-8 transition bg-gray-100 border-b border-gray-300 rounded min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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

              {/* 🔽 Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Sort by
                  <ChevronDown size={14} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Sort Options
                      </div>
                      
                      {/* Sort by Field Section */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Sort by Field
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
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{field.label}</div>
                            </div>
                            {sortConfig.key === field.key && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Order Section - Shown if a field is selected */}
                      {sortConfig.key && (
                        <>
                          <div className="my-1 border-t border-gray-200"></div>
                          <div>
                            <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Sort Order
                            </div>
                            {sortDirections.map((dir) => (
                              <button
                                key={dir.key}
                                onClick={() =>
                                  handleSortFromDropdown(sortConfig.key, dir.key)
                                }
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                                  sortConfig.direction === dir.key ? "bg-sky-50 font-medium" : ""
                                }`}
                              >
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{dir.label}</div>
                                </div>
                                {sortConfig.direction === dir.key && (
                                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 🎚 Filters dropdown */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Filters
                  <ChevronDown size={14} />
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </button>

                {filtersOpen && (
                  <div className="absolute right-0 z-20 w-56 mt-1 bg-white border border-gray-200 rounded shadow max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Filter Options
                        </div>
                        {(provinceFilter.length > 0 || businessTypeFilter.length > 0) && (
                          <button
                            onClick={() => {
                              setProvinceFilter([]);
                              setBusinessTypeFilter([]);
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
                        {businessTypes.map((businessType) => (
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
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-240px)]">
            {/* Map Container */}
            <div className="overflow-hidden rounded shadow">
              <MapContainer
                center={[16.597668, 120.322477]}
                zoom={8}
                style={{ width: "100%", height: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                maxZoom={22}
                fullscreenControl={true}
                fullscreenControlOptions={{
                  position: 'topright'
                }}
              >
                <LayersControl position="topleft">
                  {/* Base Layers */}
                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                      maxZoom={20}
                      subdomains={["mt1", "mt2", "mt3"]}
                      attribution="© Google"
                    />
                  </LayersControl.BaseLayer>

                  {/* 3D Map Layer with Buildings */}
                  <LayersControl.BaseLayer checked name="3D Terrain">
                    <TileLayer
                      url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Usuq2JxAdrdQy7GmBVyr"
                      attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
                      maxZoom={22}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                <MapFocus establishment={focusedEstablishment} />

                {/* Show ALL filtered establishments on map (not just paginated ones) */}
                {filteredEstablishments.map((e) =>
                  e.polygon && e.polygon.length > 0 ? (
                    <Polygon
                      key={`poly-${e.id}`}
                      positions={e.polygon}
                      pathOptions={{
                        color:
                          focusedEstablishment?.id === e.id
                            ? "#3388ff"
                            : "#999999",
                        weight: focusedEstablishment?.id === e.id ? 4 : 2,
                        opacity: focusedEstablishment?.id === e.id ? 0.8 : 0.6,
                        fillColor:
                          focusedEstablishment?.id === e.id
                            ? "#3388ff"
                            : "#999999",
                        fillOpacity: focusedEstablishment?.id === e.id ? 0.3 : 0.1,
                        dashArray: focusedEstablishment?.id === e.id ? "0" : "5 5",
                      }}
                      eventHandlers={{
                        click: () => setFocusedEstablishment(e),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <strong>{e.name}</strong>
                          <br />
                          <span className="text-sm text-gray-600">
                            {e.nature_of_business}
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            {e.street_building}, {e.barangay}, {e.city}
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            Established: {e.year_established}
                          </span>
                        </div>
                      </Popup>
                    </Polygon>
                  ) : (
                    <Marker
                      key={`marker-${e.id}`}
                      position={[
                        parseFloat(e.latitude),
                        parseFloat(e.longitude),
                      ]}
                      icon={
                        focusedEstablishment?.id === e.id ? greenIcon : blueIcon
                      }
                      eventHandlers={{
                        click: () => setFocusedEstablishment(e),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <strong>{e.name}</strong>
                          <br />
                          <span className="text-sm text-gray-600">
                            {e.nature_of_business}
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            {e.street_building}, {e.barangay}, {e.city}
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            Established: {e.year_established}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  )
                )}
              </MapContainer>
            </div>

            {/* Right: Establishments Table with Sortable Headers */}
            <div className="flex flex-col">
              {/* Table Container */}
              <div className="flex-grow overflow-y-auto">
                <table className="w-full border-b border-gray-300 rounded-lg">
                  <thead>
                    <tr className="text-sm text-left text-white bg-sky-700">
                      <th
                        className="p-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Name {getSortIcon("name")}
                        </div>
                      </th>
                      <th
                        className="p-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => handleSort("city")}
                      >
                        <div className="flex items-center gap-1">
                          Address {getSortIcon("city")}
                        </div>
                      </th>
                      <th className="p-2 text-center border-b border-gray-300">
                        Coordinates
                      </th>
                      {/* <th
                        className="p-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => handleSort("nature_of_business")}
                      >
                        <div className="flex items-center gap-1">
                          Business Type {getSortIcon("nature_of_business")}
                        </div>
                      </th>
                      <th
                        className="p-2 text-center border-b border-gray-300 cursor-pointer"
                        onClick={() => handleSort("year_established")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Year {getSortIcon("year_established")}
                        </div>
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-2 py-8 text-center border-b border-gray-300"
                        >
                          <div
                            className="flex flex-col items-center justify-center p-4"
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
                    ) : paginatedEstablishments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
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
                      paginatedEstablishments.map((e) => (
                        <tr
                          key={e.id}
                          className={`p-1 text-xs border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${
                            focusedEstablishment?.id === e.id
                              ? "bg-green-100"
                              : ""
                          }`}
                          onClick={() => setFocusedEstablishment(e)}
                        >
                          <td className="p-2 font-semibold border-b border-gray-300">
                            {e.name}
                          </td>
                          <td className="p-2 text-left border-b border-gray-300">
                            {`${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}`}
                          </td>
                          <td className="p-2 text-center border-b border-gray-300">
                            {`${parseFloat(e.latitude).toFixed(
                              4
                            )}, ${parseFloat(e.longitude).toFixed(4)}`}
                          </td>
                          {/* <td className="p-2 border-b border-gray-300">
                            {e.nature_of_business}
                          </td>
                          <td className="p-2 text-center border-b border-gray-300">
                            {e.year_established}
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredEstablishments.length > 0 && (
                <div className="flex items-center justify-between p-2 mt-4 rounded bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing {startItem} to {endItem} of{" "}
                    {filteredEstablishments.length} establishment(s)
                    {allEstablishments.length !==
                      filteredEstablishments.length &&
                      ` (filtered from ${allEstablishments.length} total)`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
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
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span>Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="50">100</option>
                    </select>
                    <span>per page</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
