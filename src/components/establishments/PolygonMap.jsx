import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import osm from "../map/osm-provider";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
});

export default function PolygonMap({
  establishment,
  onSave,
  userRole,
  editMode,
}) {
  const featureGroupRef = useRef();
  const [mapLayers, setMapLayers] = useState([]);

  // ✅ Role check with Monitoring Personnel added
  const canEditEstablishments = () => {
    return [
      "Division Chief",
      "Section Chief",
      "Unit Head",
      "Monitoring Personnel",
    ].includes(userRole);
  };

  // ✅ Filter out invalid coordinates (undefined, null, NaN)
  const filterValidCoordinates = (polygonData) => {
    if (!polygonData || !Array.isArray(polygonData)) return [];

    return polygonData.filter(([lat, lng]) => {
      return (
        lat !== undefined &&
        lng !== undefined &&
        !isNaN(parseFloat(lat)) &&
        !isNaN(parseFloat(lng))
      );
    });
  };

  // ✅ Convert coordinates to LatLng objects safely
  const convertToLatLngs = (coordinates) => {
    return coordinates
      .map(([lat, lng]) => ({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      }))
      .filter((point) => !isNaN(point.lat) && !isNaN(point.lng));
  };

  // Load saved polygon if exists
  useEffect(() => {
    if (establishment?.polygon && establishment.polygon.length > 0) {
      // Filter out invalid coordinates
      const validPolygon = filterValidCoordinates(establishment.polygon);

      if (validPolygon.length > 0) {
        setMapLayers([
          {
            id: "saved",
            latlngs: convertToLatLngs(validPolygon),
          },
        ]);
      } else {
        setMapLayers([]);
      }
    } else {
      setMapLayers([]);
    }
  }, [establishment]);

  const notifyParent = (layers) => {
    let polygonData = null;
    if (layers.length > 0) {
      // Convert back to array format and filter invalid coordinates
      polygonData = layers[0].latlngs
        .map((latlng) => [latlng.lat, latlng.lng])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
    }
    if (onSave) onSave(polygonData || []);
  };

  const _onCreate = (e) => {
    if (!canEditEstablishments() || !editMode) return;
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      try {
        const { _leaflet_id } = layer;
        const latlngs = layer.getLatLngs()[0];

        // Filter out any invalid coordinates
        const validLatLngs = latlngs.filter(
          (latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng)
        );

        const newLayers = [{ id: _leaflet_id, latlngs: validLatLngs }];
        setMapLayers(newLayers);
        notifyParent(newLayers);
      } catch (error) {
        console.error("Error creating polygon:", error);
      }
    }
  };

  const _onEdit = (e) => {
    if (!canEditEstablishments() || !editMode) return;
    try {
      const { _layers } = e.layers;
      const editedLayers = Object.values(_layers).map(
        ({ _leaflet_id, editing }) => ({
          id: _leaflet_id,
          latlngs: editing.latlngs[0].filter(
            (latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng)
          ),
        })
      );
      setMapLayers(editedLayers);
      notifyParent(editedLayers);
    } catch (error) {
      console.error("Error editing polygon:", error);
    }
  };

  const _onDelete = () => {
    if (!canEditEstablishments() || !editMode) return;
    setMapLayers([]);
    notifyParent([]);
  };

  // ✅ Get valid center coordinates
  const getCenter = () => {
    if (establishment?.latitude && establishment?.longitude) {
      const lat = parseFloat(establishment.latitude);
      const lng = parseFloat(establishment.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return [14.676, 121.0437]; // Default center
  };

  // ✅ Get valid marker position
  const getMarkerPosition = () => {
    if (establishment?.latitude && establishment?.longitude) {
      const lat = parseFloat(establishment.latitude);
      const lng = parseFloat(establishment.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return null;
  };

  const markerPosition = getMarkerPosition();

  return (
    <div className="relative h-[calc(100vh-230px)] w-full">
      <MapContainer
        center={getCenter()}
        zoom={18}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          url={osm.maptiler.url}
          attribution={osm.maptiler.attribution}
        />

        {/* Establishment pin - only render if valid coordinates */}
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>{establishment.name}</Popup>
          </Marker>
        )}

        {/* Draw saved polygon - only render if valid coordinates */}
        {mapLayers.map((poly) => (
          <Polygon
            key={poly.id}
            positions={poly.latlngs}
            pathOptions={{
              color: "#3388ff",
              weight: 3,
              opacity: 0.8,
              fillOpacity: 0.2,
            }}
          />
        ))}

        {/* Drawing controls only for authorized roles AND in edit mode */}
        {canEditEstablishments() && editMode && (
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={_onCreate}
              onEdited={_onEdit}
              onDeleted={_onDelete}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: true,
              }}
            />
          </FeatureGroup>
        )}
      </MapContainer>
    </div>
  );
}
