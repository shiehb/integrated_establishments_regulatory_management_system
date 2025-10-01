import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
  Polygon,
  LayersControl,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import osm from "../map/osm-provider";
import { getEstablishments } from "../../services/api";
import * as turf from "@turf/turf";

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
  const [otherPolygons, setOtherPolygons] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");
  const infoTimerRef = useRef(null);

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

  // Load other establishments' polygons to show as gray overlays and for overlap checks
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await getEstablishments({ page: 1, page_size: 10000 });
        const list = response.results || response;
        if (!isMounted) return;
        const currentId = establishment?.id;
        const polys = (list || [])
          .filter(
            (e) => Array.isArray(e.polygon) && e.polygon.length > 0 && e.id !== currentId
          )
          .map((e) => ({
            id: e.id,
            latlngs: convertToLatLngs(filterValidCoordinates(e.polygon)),
          }));
        setOtherPolygons(polys);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [establishment?.id]);

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
        let latlngs = layer.getLatLngs()[0];

        // Filter out any invalid coordinates
        let validLatLngs = latlngs.filter(
          (latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng)
        );

        // Client-side non-overlap: subtract each overlapping polygon iteratively (more reliable than union)
        if (otherPolygons.length > 0 && validLatLngs.length >= 3) {
          let current = turf.polygon([
            validLatLngs
              .map((p) => [p.lng, p.lat])
              .concat([[validLatLngs[0].lng, validLatLngs[0].lat]]),
          ]);
          const originalArea = turf.area(current);
          const others = otherPolygons
            .filter((p) => (p.latlngs || []).length >= 3)
            .map((poly) =>
              turf.polygon([
                poly.latlngs
                  .map((pt) => [pt.lng, pt.lat])
                  .concat([[poly.latlngs[0].lng, poly.latlngs[0].lat]]),
              ])
            );
          try {
            others.forEach((o) => {
              try {
                if (turf.booleanIntersects(current, o)) {
                  const d = turf.difference(current, o);
                  if (d) current = d;
                }
              } catch (err) {
                // skip problematic polygon
              }
            });
          } catch (err) {
            // ignore
          }
          if (current && current.geometry) {
            if (current.geometry.type === "Polygon") {
              const coords = current.geometry.coordinates[0] || [];
              validLatLngs = coords.map(([lng, lat]) => ({ lat, lng }));
              const newArea = turf.area(current);
              if (newArea < originalArea) {
                setInfoMessage("Adjusted polygon to avoid overlaps.");
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              }
            } else if (current.geometry.type === "MultiPolygon") {
              let best = null;
              let bestArea = -1;
              current.geometry.coordinates.forEach((polyCoords) => {
                const poly = turf.polygon(polyCoords);
                const area = turf.area(poly);
                if (area > bestArea) {
                  bestArea = area;
                  best = poly;
                }
              });
              if (best) {
                const coords = best.geometry.coordinates[0] || [];
                validLatLngs = coords.map(([lng, lat]) => ({ lat, lng }));
                setInfoMessage("Adjusted polygon to avoid overlaps.");
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              } else {
                validLatLngs = [];
              }
            }
            if (validLatLngs.length === 0) {
              setInfoMessage("Polygon fully overlapped existing areas and was cleared.");
              if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
              infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
            }
          }
        }

        // Reflect adjustment on the actual Leaflet-draw layer immediately
        if (validLatLngs.length > 0) {
          try {
            layer.setLatLngs([validLatLngs]);
            if (layer.redraw) layer.redraw();
          } catch (_) {}
        } else {
          try {
            const fg = featureGroupRef.current;
            if (fg && fg._leaflet_id && fg.removeLayer) {
              fg.removeLayer(layer);
            } else if (layer.remove) {
              layer.remove();
            }
          } catch (_) {}
        }

        const newLayers = validLatLngs.length ? [{ id: _leaflet_id, latlngs: validLatLngs }] : [];
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
      let editedLayers = Object.values(_layers).map((l) => {
        const { _leaflet_id, editing } = l;
        let latlngs = editing.latlngs[0].filter((latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng));
        if (otherPolygons.length > 0 && latlngs.length >= 3) {
          let current = turf.polygon([
            latlngs.map((p) => [p.lng, p.lat]).concat([[latlngs[0].lng, latlngs[0].lat]]),
          ]);
          const originalArea = turf.area(current);
          const others = otherPolygons
            .filter((p) => (p.latlngs || []).length >= 3)
            .map((poly) =>
              turf.polygon([
                poly.latlngs
                  .map((pt) => [pt.lng, pt.lat])
                  .concat([[poly.latlngs[0].lng, poly.latlngs[0].lat]]),
              ])
            );
          try {
            others.forEach((o) => {
              try {
                if (turf.booleanIntersects(current, o)) {
                  const d = turf.difference(current, o);
                  if (d) current = d;
                }
              } catch (err) {
                // skip problematic polygon
              }
            });
          } catch (err) {
            // ignore
          }
          if (current && current.geometry) {
            if (current.geometry.type === "Polygon") {
              const coords = current.geometry.coordinates[0] || [];
              latlngs = coords.map(([lng, lat]) => ({ lat, lng }));
              const newArea = turf.area(current);
              if (newArea < originalArea) {
                setInfoMessage("Adjusted polygon to avoid overlaps.");
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              }
            } else if (current.geometry.type === "MultiPolygon") {
              let best = null;
              let bestArea = -1;
              current.geometry.coordinates.forEach((polyCoords) => {
                const poly = turf.polygon(polyCoords);
                const area = turf.area(poly);
                if (area > bestArea) {
                  bestArea = area;
                  best = poly;
                }
              });
              if (best) {
                const coords = best.geometry.coordinates[0] || [];
                latlngs = coords.map(([lng, lat]) => ({ lat, lng }));
                setInfoMessage("Adjusted polygon to avoid overlaps.");
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              } else {
                latlngs = [];
              }
            }
            if (latlngs.length === 0) {
              setInfoMessage("Polygon fully overlapped existing areas and was cleared.");
              if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
              infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
            }
          }
        }
        // Reflect on the actual Leaflet layer
        try {
          if (latlngs.length > 0) {
            l.setLatLngs([latlngs]);
            if (l.redraw) l.redraw();
          } else {
            const fg = featureGroupRef.current;
            if (fg && fg._leaflet_id && fg.removeLayer) {
              fg.removeLayer(l);
            } else if (l.remove) {
              l.remove();
            }
          }
        } catch (_) {}

        return { id: _leaflet_id, latlngs };
      });
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
    <div className="relative h-[calc(100vh-238px)] w-full">
      <MapContainer
        center={getCenter()}
        zoom={18}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        maxZoom={22}
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              url={osm.maptiler.url}
              attribution={osm.maptiler.attribution}
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

        {otherPolygons.map((poly) => (
          <Polygon
            key={`other-${poly.id}`}
            positions={poly.latlngs}
            pathOptions={{
              color: "#999999",
              weight: 1,
              opacity: 0.7,
              fillOpacity: 0.1,
              dashArray: "4 4",
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
      {infoMessage && (
        <div className="pointer-events-none absolute left-3 bottom-3 z-[1000] rounded bg-black/70 px-3 py-2 text-xs text-white shadow">
          {infoMessage}
        </div>
      )}
    </div>
  );
}
