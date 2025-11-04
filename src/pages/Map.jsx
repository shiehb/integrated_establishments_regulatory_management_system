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
import { getEstablishments, getMyEstablishments } from "../services/api";
import { useNotifications } from "../components/NotificationManager";
import { useAuth } from "../contexts/AuthContext";
import { getIconByNatureOfBusiness } from '../constants/markerIcons';
import { createCustomMarkerIcon } from '../components/map/CustomMarkerIcon';
import {
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
} from "lucide-react";
import TableToolbar from "../components/common/TableToolbar";

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const blueIcon = new L.Icon({
  iconUrl: icon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: iconShadow,
});

const greenIcon = new L.Icon({
  iconUrl: icon, // Using blue icon for now, can be customized later
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: iconShadow,
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
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [allEstablishments, setAllEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedEstablishment, setFocusedEstablishment] = useState(null);
  const notifications = useNotifications();

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // ✅ Pagination - Load from localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('map_pagination_page');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('map_pagination_pageSize');
    return saved ? parseInt(saved, 10) : 10;
  });

  // ✅ Details Panel State
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);

  // Save pagination settings to localStorage
  useEffect(() => {
    localStorage.setItem('map_pagination_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('map_pagination_pageSize', pageSize.toString());
  }, [pageSize]);

  // Fetch all establishments from API
  useEffect(() => {
    if (user) {
      fetchAllEstablishments();
    }
  }, [user]);

  const fetchAllEstablishments = async () => {
    setLoading(true);
    try {
      // Determine which API to call based on user role
      const isHighLevelUser = user?.userlevel && ['Admin', 'Division Chief', 'Legal Unit'].includes(user.userlevel);
      
      let data;
      if (isHighLevelUser) {
        // High-level users see all establishments
        data = await getEstablishments({ page: 1, page_size: 10000 });
      } else {
        // Lower-level users see only their assigned establishments
        data = await getMyEstablishments({ page: 1, page_size: 10000 });
      }

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


  // ✅ Sorting handler
  const handleSort = (fieldKey, directionKey = null) => {
    if (fieldKey === null) {
      setSortConfig({ key: null, direction: null });
    } else {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Sort options for dropdown
  const sortFields = [
    { key: "name", label: "Name" },
    { key: "year_established", label: "Year Established" },
  ];

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

      return matchesSearch;
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "name") {
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
    sortConfig,
  ]);

  // ✅ Pagination
  const paginatedEstablishments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEstablishments.slice(startIndex, endIndex);
  }, [filteredEstablishments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEstablishments.length / pageSize);

  // Filter functions removed as per plan

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Filter data removed as per plan

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

  const activeFilterCount = 0; // No filters as per plan
  const hasActiveFilters = searchQuery || sortConfig.key;

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
              <TableToolbar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchClear={clearSearch}
                searchPlaceholder="Search establishments..."
                sortConfig={sortConfig}
                sortFields={sortFields}
                onSort={handleSort}
              />
            </div>
          </div>
                      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Map + Details Panel */}
            <div className="flex flex-col gap-2 h-[calc(100vh-240px)]">
              {/* Map Container - Dynamic height */}
              <div className={`overflow-hidden rounded shadow transition-all duration-300 ${
                focusedEstablishment && showDetailsPanel 
                  ? 'h-[calc(100%-180px)]' 
                  : 'flex-1'
              }`}>
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
                        click: () => {
                          setFocusedEstablishment(e);
                          setShowDetailsPanel(true); // Show panel when clicking
                        },
                      }}
                    >
                      {/* Only show Popup when details panel is hidden */}
                      {!showDetailsPanel && (
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
                      )}
                    </Polygon>
                  ) : (
                    <Marker
                      key={`marker-${e.id}`}
                      position={[
                        parseFloat(e.latitude),
                        parseFloat(e.longitude),
                      ]}
                      icon={(() => {
                        // Get custom icon based on establishment type
                        const iconData = getIconByNatureOfBusiness(e.marker_icon || e.nature_of_business);
                        return createCustomMarkerIcon(iconData.icon, iconData.color, 28);
                      })()}
                      eventHandlers={{
                        click: () => {
                          setFocusedEstablishment(e);
                          setShowDetailsPanel(true); // Show panel when clicking
                        },
                      }}
                    >
                      {/* Only show Popup when details panel is hidden */}
                      {!showDetailsPanel && (
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
                      )}
                    </Marker>
                  )
                )}
              </MapContainer>
            </div>

              {/* Compressed Details Panel - Shows when establishment is selected */}
              {focusedEstablishment && (
                <div className="bg-white rounded shadow-lg border border-gray-300 transition-all duration-300">
                  {/* Compact Header with Toggle */}
                  <div className="flex items-center justify-between p-2 bg-sky-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-sky-600" />
                      <h3 className="text-sm font-bold text-sky-700">
                        {focusedEstablishment.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-sky-600 bg-white border border-sky-300 rounded hover:bg-sky-50 transition-colors"
                      >
                        {showDetailsPanel ? (
                          <>
                            <ChevronUp size={14} />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            Show
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setFocusedEstablishment(null)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Details Content */}
                  {showDetailsPanel && (
                    <div className="p-3 max-h-36 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-semibold text-gray-600">Business Type:</span>
                          <p className="text-gray-900">{focusedEstablishment.nature_of_business}</p>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-gray-600">Year Est.:</span>
                          <p className="text-gray-900">{focusedEstablishment.year_established}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-600">Address:</span>
                          <p className="text-gray-900">
                            {focusedEstablishment.street_building}, {focusedEstablishment.barangay}, 
                            {focusedEstablishment.city}, {focusedEstablishment.province}, 
                            {focusedEstablishment.postal_code}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-gray-600">Coordinates:</span>
                          <p className="text-gray-900 font-mono text-[10px]">
                            {parseFloat(focusedEstablishment.latitude).toFixed(6)}, 
                            {parseFloat(focusedEstablishment.longitude).toFixed(6)}
                          </p>
                        </div>
                        
                        {focusedEstablishment.contact_number && (
                          <div>
                            <span className="font-semibold text-gray-600">Contact:</span>
                            <p className="text-gray-900">{focusedEstablishment.contact_number}</p>
                          </div>
                        )}
                        
                        {focusedEstablishment.email && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-600">Email:</span>
                            <p className="text-gray-900 truncate">{focusedEstablishment.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Table */}
            <div className="flex flex-col h-[calc(100vh-240px)]">
              {/* Table Container */}
              <div className=" rounded flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <table className="w-full border-b border-gray-300 rounded-lg">
                  <thead>
                    <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
                      <th
                        className="px-3 py-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortConfig.key === "name") {
                            handleSort("name", sortConfig.direction === "asc" ? "desc" : "asc");
                          } else {
                            handleSort("name", "asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          Name {getSortIcon("name")}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortConfig.key === "city") {
                            handleSort("city", sortConfig.direction === "asc" ? "desc" : "asc");
                          } else {
                            handleSort("city", "asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          Address {getSortIcon("city")}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-center border-b border-gray-300">
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
                          className={`text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${
                            focusedEstablishment?.id === e.id
                              ? "bg-green-100"
                              : ""
                          }`}
                          onClick={() => setFocusedEstablishment(e)}
                        >
                          <td className="px-3 py-2 font-semibold border-b border-gray-300">
                            {e.name}
                          </td>
                          <td className="px-3 py-2 text-left border-b border-gray-300">
                            <div className="truncate max-w-xs" title={`${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}`}>
                            {`${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}`}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center border-b border-gray-300">
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
                <div className="flex-shrink-0 flex items-center justify-between p-2 mt-4 rounded bg-gray-50">
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
                      <option value="100">100</option>
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
