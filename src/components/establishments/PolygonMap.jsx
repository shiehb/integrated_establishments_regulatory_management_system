import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import * as turf from "@turf/turf";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PolygonMap({ existingPolygons = [], onSave, onClose }) {
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const [areaLabel, setAreaLabel] = useState(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // ✅ Add drawn items layer to map
    map.addLayer(drawnItemsRef.current);

    // ✅ Add leaflet-draw toolbar
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "blue" },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // ✅ Load existing polygon if available
    if (existingPolygons && existingPolygons.length > 0) {
      const poly = L.polygon(existingPolygons, { color: "blue" });
      drawnItemsRef.current.addLayer(poly);
      computeAreaLabel(existingPolygons);
    }

    // ✅ Listen for created polygons
    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItemsRef.current.clearLayers(); // allow only one polygon
      drawnItemsRef.current.addLayer(e.layer);

      const coords = e.layer
        .getLatLngs()[0]
        .map((latlng) => [latlng.lat, latlng.lng]);
      computeAreaLabel(coords);
    });

    // ✅ Listen for edited polygons
    map.on(L.Draw.Event.EDITED, (e) => {
      e.layers.eachLayer((layer) => {
        const coords = layer
          .getLatLngs()[0]
          .map((latlng) => [latlng.lat, latlng.lng]);
        computeAreaLabel(coords);
      });
    });

    // ✅ Listen for deleted polygons
    map.on(L.Draw.Event.DELETED, () => {
      setAreaLabel(null);
    });

    return () => {
      map.off();
    };
  }, [existingPolygons]);

  const computeAreaLabel = (poly) => {
    if (!poly || poly.length < 3) return;
    const coords = poly.map((p) => [p[1], p[0]]);
    const turfPoly = turf.polygon([coords]);
    const area = turf.area(turfPoly);
    const center = turf.centerOfMass(turfPoly).geometry.coordinates;
    setAreaLabel({
      lat: center[1],
      lng: center[0],
      area: area.toFixed(2),
    });
  };

  const handleSave = () => {
    if (drawnItemsRef.current.getLayers().length === 0) {
      onSave(null);
      return;
    }
    const layer = drawnItemsRef.current.getLayers()[0];
    const coords = layer
      .getLatLngs()[0]
      .map((latlng) => [latlng.lat, latlng.lng]);
    onSave(coords);
  };

  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={[14.5995, 120.9842]} // Manila
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* 📍 Sample marker */}
        <Marker position={[14.5995, 120.9842]} icon={markerIcon}>
          <Popup>Sample Pin (Manila)</Popup>
        </Marker>

        {/* Area label */}
        {areaLabel && (
          <Marker
            position={[areaLabel.lat, areaLabel.lng]}
            icon={L.divIcon({
              className: "polygon-label",
              html: `<div style="background:white;padding:2px 6px;border-radius:4px;border:1px solid #555;">
                       ${areaLabel.area} m²
                     </div>`,
            })}
          />
        )}
      </MapContainer>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Save Polygon
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
