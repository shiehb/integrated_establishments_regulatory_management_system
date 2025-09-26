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
import L from "leaflet";
import { getEstablishments } from "../services/api";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
});

const blueIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
});

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
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedEstablishment, setFocusedEstablishment] = useState(null);

  // 🔍 Search, Filter, and Sort State
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [businessTypeFilter, setBusinessTypeFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Fetch establishments from API
  useEffect(() => {
    fetchEstablishments();
  }, []);

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
    setSortDropdownOpen(false);
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
    establishments,
    localSearchQuery,
    provinceFilter,
    businessTypeFilter,
    sortConfig,
  ]);

  // Toggle province filter
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
  };

  // Toggle business type filter
  const toggleBusinessType = (businessType) => {
    setBusinessTypeFilter((prev) =>
      prev.includes(businessType)
        ? prev.filter((b) => b !== businessType)
        : [...prev, businessType]
    );
  };

  // Clear functions
  const clearLocalSearch = () => setLocalSearchQuery("");
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setProvinceFilter([]);
    setBusinessTypeFilter([]);
    setSortConfig({ key: null, direction: null });
  };

  // Get unique provinces and business types for filters
  const provinces = useMemo(() => {
    return [
      ...new Set(establishments.map((e) => e.province).filter(Boolean)),
    ].sort();
  }, [establishments]);

  const businessTypes = useMemo(() => {
    return [
      ...new Set(
        establishments.map((e) => e.nature_of_business).filter(Boolean)
      ),
    ].sort();
  }, [establishments]);

  const activeFilterCount = provinceFilter.length + businessTypeFilter.length;
  const hasActiveFilters =
    localSearchQuery ||
    provinceFilter.length > 0 ||
    businessTypeFilter.length > 0 ||
    sortConfig.key;

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel="admin">
          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-center h-64">
              <p>Loading Map...</p>
            </div>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="p-4 bg-white rounded shadow">
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
                    {/* Province Section */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-600">
                          Province
                        </h4>
                        {provinceFilter.length > 0 && (
                          <button
                            onClick={() => setProvinceFilter([])}
                            className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="max-h-32 overflow-y-auto">
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
                            <span className="truncate">{province}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Business Type Section */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-600">
                          Business Type
                        </h4>
                        {businessTypeFilter.length > 0 && (
                          <button
                            onClick={() => setBusinessTypeFilter([])}
                            className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {businessTypes.map((businessType) => (
                          <button
                            key={businessType}
                            onClick={() => toggleBusinessType(businessType)}
                            className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                              businessTypeFilter.includes(businessType)
                                ? "bg-sky-50 font-medium"
                                : ""
                            }`}
                          >
                            <span className="text-xs text-sky-600 mr-2">
                              {businessTypeFilter.includes(businessType)
                                ? "•"
                                : ""}
                            </span>
                            <span className="truncate">{businessType}</span>
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-238px)]">
            {/* Left: Establishments Table with Sortable Headers */}
            <div className="overflow-y-auto">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="text-sm text-left text-white bg-sky-700">
                    <th
                      className="p-2 border border-gray-300 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="p-2 border border-gray-300 cursor-pointer"
                      onClick={() => handleSort("city")}
                    >
                      <div className="flex items-center gap-1">
                        Address {getSortIcon("city")}
                      </div>
                    </th>
                    <th className="p-2 text-center border border-gray-300">
                      Coordinates
                    </th>
                    <th
                      className="p-2 border border-gray-300 cursor-pointer"
                      onClick={() => handleSort("nature_of_business")}
                    >
                      <div className="flex items-center gap-1">
                        Business Type {getSortIcon("nature_of_business")}
                      </div>
                    </th>
                    <th
                      className="p-2 border border-gray-300 cursor-pointer text-center"
                      onClick={() => handleSort("year_established")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Year {getSortIcon("year_established")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstablishments.map((e) => (
                    <tr
                      key={e.id}
                      className={`p-1 text-xs border border-gray-300 hover:bg-gray-50 cursor-pointer ${
                        focusedEstablishment?.id === e.id ? "bg-green-100" : ""
                      }`}
                      onClick={() => setFocusedEstablishment(e)}
                    >
                      <td className="p-2 font-semibold border border-gray-300">
                        {e.name}
                      </td>
                      <td className="p-2 text-left border border-gray-300">
                        {`${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}`}
                      </td>
                      <td className="p-2 text-center border border-gray-300">
                        {`${parseFloat(e.latitude).toFixed(4)}, ${parseFloat(
                          e.longitude
                        ).toFixed(4)}`}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {e.nature_of_business}
                      </td>
                      <td className="p-2 text-center border border-gray-300">
                        {e.year_established}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEstablishments.length === 0 && (
                <div className="p-4 text-center text-gray-500">
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
                </div>
              )}
              {/* 📊 Search results info */}
              {(hasActiveFilters ||
                filteredEstablishments.length !== establishments.length) && (
                <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                  <div>
                    Showing {filteredEstablishments.length} of{" "}
                    {establishments.length} establishment(s)
                    {sortConfig.key && (
                      <span className="ml-2 text-gray-400">
                        • Sorted by{" "}
                        {
                          sortFields.find((f) => f.key === sortConfig.key)
                            ?.label
                        }{" "}
                        ({sortConfig.direction === "asc" ? "A-Z" : "Z-A"})
                      </span>
                    )}
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
            </div>

            {/* Right: Map with street and satellite layers */}
            <div className="overflow-hidden rounded shadow">
              <MapContainer
                center={[16.597668, 120.322477]}
                zoom={8}
                style={{ width: "100%", height: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                maxZoom={22}
              >
                <LayersControl position="topright">
                  {/* Base Layers */}
                  <LayersControl.BaseLayer checked name="Street Map">
                    <TileLayer
                      url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Usuq2JxAdrdQy7GmBVyr"
                      attribution="© MapTiler © OpenStreetMap contributors"
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                      maxZoom={20}
                      subdomains={["mt1", "mt2", "mt3"]}
                      attribution="© Google"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                <MapFocus establishment={focusedEstablishment} />

                {/* Show establishments */}
                {filteredEstablishments.map((e) =>
                  e.polygon && e.polygon.length > 0 ? (
                    <Polygon
                      key={`poly-${e.id}`}
                      positions={e.polygon}
                      pathOptions={{
                        color:
                          focusedEstablishment?.id === e.id
                            ? "green"
                            : "#3388ff",
                        weight: 4,
                        opacity: 0.7,
                        fillColor:
                          focusedEstablishment?.id === e.id
                            ? "green"
                            : "#3388ff",
                        fillOpacity: 0.2,
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
          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
