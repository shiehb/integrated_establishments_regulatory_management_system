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
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getEstablishments } from "../services/api";
import { useSearch } from "../contexts/SearchContext";

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
  const { searchQuery } = useSearch();

  // Fetch establishments from API
  useEffect(() => {
    fetchEstablishments();
  }, []);

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

  // Filter establishments based on search query
  const filteredEstablishments = useMemo(() => {
    if (!searchQuery) return establishments;
    
    return establishments.filter((e) => {
      const query = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(query) ||
        `${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}, ${e.postal_code}`
          .toLowerCase()
          .includes(query) ||
        e.nature_of_business.toLowerCase().includes(query) ||
        String(e.year_established).includes(query)
      );
    });
  }, [establishments, searchQuery]);

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel="admin">
          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-center h-64">
              <p>Loading establishments...</p>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-sky-600">
              Establishments Map
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-230px)]">
            {/* Left: Establishments Table */}
            <div className="overflow-y-auto">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="text-sm text-left text-white bg-sky-700">
                    <th className="p-2 border border-gray-300">Name</th>
                    <th className="p-2 border border-gray-300">Address</th>
                    <th className="p-2 text-center border border-gray-300">
                      Coordinates
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
                        {`${e.street_building}, ${e.barangay}, ${e.city}`}
                      </td>
                      <td className="p-2 text-center border border-gray-300">
                        {`${parseFloat(e.latitude).toFixed(4)}, ${parseFloat(
                          e.longitude
                        ).toFixed(4)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right: Map with pins and polygons */}
            <div className="overflow-hidden rounded shadow">
              <MapContainer
                center={[14.676, 121.0437]}
                zoom={6}
                style={{ width: "100%", height: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
              >
                <TileLayer
                  url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Usuq2JxAdrdQy7GmBVyr"
                  attribution="© MapTiler © OpenStreetMap contributors"
                />
                <MapFocus establishment={focusedEstablishment} />

                {/* Show polygons or pins */}
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
                            Polygon Area
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
                          {e.street_building}, {e.barangay}, {e.city}
                          <br />
                          {e.nature_of_business}
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
