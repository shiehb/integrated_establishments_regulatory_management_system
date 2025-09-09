import { useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PolygonMap from "../components/establishments/PolygonMap";
import { Map as MapIcon } from "lucide-react";

// Initialize leaflet-draw dynamically (client-side only)
if (typeof window !== "undefined") {
  import("leaflet-draw");
}

// Default marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Focus map on a clicked establishment
function MapFocus({ establishment }) {
  const map = useMap();
  if (establishment) {
    const { latitude, longitude } = establishment.coordinates;
    map.setView([latitude, longitude], 16);
  }
  return null;
}

export default function MapPage() {
  const mapRef = useRef(null);

  const [establishments, setEstablishments] = useState([
    {
      id: 1,
      name: "SAMPLE ESTABLISHMENT",
      yearEstablished: "2020",
      address: {
        street: "123 MAIN ST",
        barangay: "SANDY",
        city: "QUEZON CITY",
        province: "METRO MANILA",
        postalCode: "1100",
      },
      coordinates: { latitude: 14.676, longitude: 121.0437 },
      polygon: [
        [14.676, 121.0437],
        [14.677, 121.0445],
        [14.6765, 121.045],
        [14.6755, 121.044],
      ],
    },
    {
      id: 2,
      name: "ANOTHER ESTABLISHMENT",
      yearEstablished: "2018",
      address: {
        street: "456 SECOND ST",
        barangay: "BAGONG SILANG",
        city: "SAN PABLO",
        province: "LAGUNA",
        postalCode: "4000",
      },
      coordinates: { latitude: 14.0668, longitude: 121.326 },
      polygon: null,
    },
  ]);

  const [focusedEstablishment, setFocusedEstablishment] = useState(null);
  const [showPolygonModal, setShowPolygonModal] = useState(false);

  const handlePolygonSave = (polygon) => {
    if (!focusedEstablishment) return;
    setEstablishments((prev) =>
      prev.map((est) =>
        est.id === focusedEstablishment.id ? { ...est, polygon } : est
      )
    );
    setFocusedEstablishment((prev) => (prev ? { ...prev, polygon } : prev));
    setShowPolygonModal(false);
  };

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

          <div className="grid grid-cols-2 gap-4 h-[calc(100vh-230px)]">
            {/* Left: Establishments Table */}
            <div className="overflow-y-auto">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="text-sm text-center text-white bg-sky-700">
                    <th className="p-1 border border-gray-300">Name</th>
                    <th className="p-1 border border-gray-300">Address</th>
                    <th className="p-1 border border-gray-300">Coordinates</th>
                    <th className="p-1 border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {establishments.map((e) => (
                    <tr
                      key={e.id}
                      className={`p-1 text-xs border border-gray-300 hover:bg-gray-50 ${
                        focusedEstablishment?.id === e.id ? "bg-sky-100" : ""
                      }`}
                      onClick={() => setFocusedEstablishment(e)}
                    >
                      <td className="p-2 border border-gray-300">{e.name}</td>
                      <td className="p-2 text-left border border-gray-300">
                        {`${e.address.street}, ${e.address.barangay}, ${e.address.city}`}
                      </td>
                      <td className="p-2 text-center border border-gray-300">
                        {`${e.coordinates.latitude.toFixed(
                          4
                        )}, ${e.coordinates.longitude.toFixed(4)}`}
                      </td>
                      <td className="w-10 p-2 text-center border border-gray-300">
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                          onClick={(event) => {
                            event.stopPropagation();
                            setFocusedEstablishment(e);
                            setShowPolygonModal(true);
                          }}
                          title="Edit Polygon"
                        >
                          <MapIcon size={14} />
                          Polygon
                        </button>
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
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <MapFocus establishment={focusedEstablishment} />

                {/* Pins */}
                {establishments.map((e) => (
                  <Marker
                    key={e.id}
                    position={[e.coordinates.latitude, e.coordinates.longitude]}
                    icon={markerIcon}
                  >
                    <Popup>{e.name}</Popup>
                  </Marker>
                ))}

                {/* Show polygons */}
                {establishments.map(
                  (e) =>
                    e.polygon && (
                      <Polyline key={e.id} positions={e.polygon} color="blue" />
                    )
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />

      {/* Modal with PolygonMap (leaflet-draw) */}
      {showPolygonModal && focusedEstablishment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 modal-overlay">
          <div className="bg-white rounded-lg p-4 w-[700px]">
            <h3 className="mb-2 text-lg font-semibold text-sky-700">
              {focusedEstablishment.polygon ? "Edit Polygon" : "Draw Polygon"} –{" "}
              {focusedEstablishment.name}
            </h3>
            <PolygonMap
              existingPolygons={focusedEstablishment.polygon || []}
              onSave={handlePolygonSave}
              onClose={() => setShowPolygonModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
