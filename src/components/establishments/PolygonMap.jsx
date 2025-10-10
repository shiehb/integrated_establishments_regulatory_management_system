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
import { getEstablishments } from "../../services/api";
import * as turf from "@turf/turf";
import {
  subtractOverlappingPolygons,
  snapToNearbyEdges
} from "../../utils/polygonUtils";
import SnapIndicator from "./map-overlays/SnapIndicator";
import MarkerSnapZone from "./map-overlays/MarkerSnapZone";
import { Maximize2, Minimize2 } from "lucide-react";

// Fix Leaflet marker icons - using local assets for offline support
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/assets/map/marker-icon-2x.png",
  iconUrl: "/assets/map/marker-icon.png",
  shadowUrl: "/assets/map/marker-shadow.png",
});

export default function PolygonMap({
  establishment,
  onSave,
  userRole,
  editMode,
  showOtherPolygons = true,
  snapEnabled = true,
  snapDistance = 10,
}) {
  const featureGroupRef = useRef();
  const fullscreenContainerRef = useRef(null);
  
  // Simplified state management
  const [displayPolygon, setDisplayPolygon] = useState(null);
  const [otherPolygons, setOtherPolygons] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");
  const infoTimerRef = useRef(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Visual feedback state
  const [snapIndicator, setSnapIndicator] = useState({ active: false, distance: 0, type: 'edge' });
  const [showMarkerSnap, setShowMarkerSnap] = useState(false);
  
  // Validation state
  const [isPolygonValid, setIsPolygonValid] = useState(true);
  const [validationError, setValidationError] = useState("");

  // Role check
  const canEditEstablishments = () => {
    return [
      "Division Chief",
      "Section Chief",
      "Unit Head",
      "Monitoring Personnel",
    ].includes(userRole);
  };

  // Helper functions
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

  const convertToLatLngs = (coordinates) => {
    return coordinates
      .map(([lat, lng]) => ({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      }))
      .filter((point) => !isNaN(point.lat) && !isNaN(point.lng));
  };

  // Load existing polygon into FeatureGroup when entering edit mode
  useEffect(() => {
    const fg = featureGroupRef.current;
    if (!fg) return;
    
    // Clear existing layers
    fg.clearLayers();
    
    if (editMode && establishment?.polygon && establishment.polygon.length > 0) {
      // Add polygon to FeatureGroup for editing
      const validPolygon = filterValidCoordinates(establishment.polygon);
      if (validPolygon.length >= 3) {
        const latlngs = convertToLatLngs(validPolygon);
        const polygon = L.polygon(latlngs);
        fg.addLayer(polygon);
        setDisplayPolygon(latlngs);
      }
    } else if (!editMode && establishment?.polygon && establishment.polygon.length > 0) {
      // Set display polygon for view mode
      const validPolygon = filterValidCoordinates(establishment.polygon);
      if (validPolygon.length >= 3) {
        const latlngs = convertToLatLngs(validPolygon);
        setDisplayPolygon(latlngs);
      }
    } else {
      setDisplayPolygon(null);
    }
  }, [editMode, establishment?.polygon]);

  // Load other establishments' polygons
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
      } catch (error) {
        console.warn("Error loading other polygons:", error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [establishment?.id]);

  // Fullscreen functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    console.log('Entering fullscreen...');
    const container = fullscreenContainerRef.current;
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      console.error('Container not found');
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Validate that marker is inside polygon
  const validateMarkerInsidePolygon = (polygonLatLngs, markerPos) => {
    if (!markerPos || !polygonLatLngs || polygonLatLngs.length < 3) {
      return { isValid: false, error: "Invalid polygon or marker position" };
    }
    
    try {
      const polygonCoords = polygonLatLngs.map(p => [p.lng, p.lat]);
      polygonCoords.push([polygonLatLngs[0].lng, polygonLatLngs[0].lat]);
      
      const polygon = turf.polygon([polygonCoords]);
      const point = turf.point([markerPos[1], markerPos[0]]);
      
      const isInside = turf.booleanPointInPolygon(point, polygon);
      
      if (!isInside) {
        return { 
          isValid: false, 
          error: "Establishment marker must be inside the polygon boundary" 
        };
      }
      
      return { isValid: true, error: "" };
    } catch (error) {
      console.error("Error validating polygon:", error);
      return { isValid: false, error: "Error validating polygon" };
    }
  };

  // Check marker snap
  const checkMarkerSnap = (point, markerLocation, threshold = 20) => {
    if (!markerLocation || !point) return { shouldSnap: false };
    
    try {
      const distance = turf.distance(
        turf.point([point.lng, point.lat]),
        turf.point([markerLocation.lng, markerLocation.lat]),
        { units: 'meters' }
      );
      
      if (distance < threshold) {
        return { 
          shouldSnap: true, 
          snapTo: { lat: markerLocation.lat, lng: markerLocation.lng },
          distance: distance
        };
      }
      return { shouldSnap: false, distance: distance };
    } catch (error) {
      console.warn("Error checking marker snap:", error);
      return { shouldSnap: false };
    }
  };

  // Get polygon style based on state
  const getPolygonStyle = (state) => {
    const styles = {
      drawing: { 
        color: '#3388ff', 
        fillColor: '#3388ff', 
        fillOpacity: 0.3,
        weight: 4,
        opacity: 0.8
      },
      valid: { 
        color: '#22c55e', 
        fillColor: '#22c55e', 
        fillOpacity: 0.2,
        weight: 3,
        opacity: 0.8
      },
      modified: { 
        color: '#f59e0b', 
        fillColor: '#f59e0b', 
        fillOpacity: 0.25,
        weight: 3,
        opacity: 0.8
      },
      error: { 
        color: '#ef4444', 
        fillColor: '#ef4444', 
        fillOpacity: 0.2,
        weight: 3,
        opacity: 0.8
      }
    };
    return styles[state] || styles.valid;
  };

  // Notify parent with polygon data and validation status
  const notifyParent = (latlngs, isValid = true) => {
    const polygonData = latlngs.map(pt => [pt.lat, pt.lng]);
    if (onSave) {
      onSave(polygonData, isValid);
    }
  };

  // Event handlers
  const _onCreate = (e) => {
    if (!canEditEstablishments() || !editMode) return;
    const { layerType, layer } = e;
    
    if (layerType === "polygon") {
      try {
        let latlngs = layer.getLatLngs()[0];

        // Filter out invalid coordinates
        let validLatLngs = latlngs.filter(
          (latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng)
        );

        // Check for marker snap
        const markerPosition = getMarkerPosition();
        if (markerPosition && snapEnabled) {
          const markerLocation = { lat: markerPosition[0], lng: markerPosition[1] };
          validLatLngs = validLatLngs.map(point => {
            const snapResult = checkMarkerSnap(point, markerLocation, snapDistance);
            if (snapResult.shouldSnap) {
              setSnapIndicator({ active: true, distance: snapResult.distance, type: 'marker' });
              return snapResult.snapTo;
            }
            return point;
          });
          
          const hasMarkerSnap = validLatLngs.some((point, index) => {
            const snapResult = checkMarkerSnap(latlngs[index], markerLocation, snapDistance);
            return snapResult.shouldSnap;
          });
          setShowMarkerSnap(hasMarkerSnap);
        }

        // Snap to nearby edges
        if (otherPolygons.length > 0 && validLatLngs.length >= 3 && snapEnabled) {
          const snapResult = snapToNearbyEdges(validLatLngs, otherPolygons, snapDistance);
          if (snapResult.wasSnapped) {
            validLatLngs = snapResult.snappedLatLngs;
            setSnapIndicator({ active: true, distance: snapDistance, type: 'edge' });
            setInfoMessage(snapResult.message);
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              }
        }

        // Subtract overlapping areas
        if (otherPolygons.length > 0 && validLatLngs.length >= 3) {
          const result = subtractOverlappingPolygons(validLatLngs, otherPolygons);
          validLatLngs = result.adjustedLatLngs;
          
          if (result.wasAdjusted && result.message) {
            setInfoMessage(result.message);
              if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
              infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
          }
        }

        // Update layer with adjusted coordinates
          try {
            layer.setLatLngs([validLatLngs]);
            if (layer.redraw) layer.redraw();
        } catch (err) {
          console.warn("Error updating layer:", err);
        }

        // Validate marker inside polygon
        let validationResult = { isValid: true, error: "" };
        if (validLatLngs.length > 0 && markerPosition) {
          validationResult = validateMarkerInsidePolygon(validLatLngs, markerPosition);
          setIsPolygonValid(validationResult.isValid);
          setValidationError(validationResult.error);
          
          if (!validationResult.isValid) {
            setInfoMessage(validationResult.error);
            if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
            infoTimerRef.current = setTimeout(() => setInfoMessage(""), 5000);
          }
        }
        
        // Update state and notify parent
        setDisplayPolygon(validLatLngs);
        notifyParent(validLatLngs, validationResult.isValid);
        
        // Reset visual feedback
        setSnapIndicator({ active: false, distance: 0, type: 'edge' });
        setShowMarkerSnap(false);
        
      } catch (error) {
        console.error("Error creating polygon:", error);
      }
    }
  };

  const _onEdit = (e) => {
    if (!canEditEstablishments() || !editMode) return;
    
    try {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        let latlngs = layer.getLatLngs()[0];
        
        // Filter valid coordinates
        latlngs = latlngs.filter(
          (latlng) => !isNaN(latlng.lat) && !isNaN(latlng.lng)
        );
        
        // Apply snapping
        if (otherPolygons.length > 0 && latlngs.length >= 3 && snapEnabled) {
          const snapResult = snapToNearbyEdges(latlngs, otherPolygons, snapDistance);
          if (snapResult.wasSnapped) {
            latlngs = snapResult.snappedLatLngs;
            setSnapIndicator({ active: true, distance: snapDistance, type: 'edge' });
            setInfoMessage(snapResult.message);
                if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
                infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
              }
        }
        
        // Subtract overlapping areas
        if (otherPolygons.length > 0 && latlngs.length >= 3) {
          const result = subtractOverlappingPolygons(latlngs, otherPolygons);
          latlngs = result.adjustedLatLngs;
          
          if (result.wasAdjusted && result.message) {
            setInfoMessage(result.message);
              if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
              infoTimerRef.current = setTimeout(() => setInfoMessage(""), 2500);
            }
          }
        
        // Update layer
        try {
          layer.setLatLngs([latlngs]);
          if (layer.redraw) layer.redraw();
        } catch (err) {
          console.warn("Error updating edited layer:", err);
        }
        
        // Validate marker inside polygon
        const markerPosition = getMarkerPosition();
        let validationResult = { isValid: true, error: "" };
        if (latlngs.length > 0 && markerPosition) {
          validationResult = validateMarkerInsidePolygon(latlngs, markerPosition);
          setIsPolygonValid(validationResult.isValid);
          setValidationError(validationResult.error);
          
          if (!validationResult.isValid) {
            setInfoMessage(validationResult.error);
            if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
            infoTimerRef.current = setTimeout(() => setInfoMessage(""), 5000);
          }
        }
        
        // Update state and notify parent
        setDisplayPolygon(latlngs);
        notifyParent(latlngs, validationResult.isValid);
      });
      
    } catch (error) {
      console.error("Error editing polygon:", error);
    }
  };

  const _onDelete = () => {
    if (!canEditEstablishments() || !editMode) return;
    setDisplayPolygon(null);
    notifyParent([], true);
  };

  // Get center coordinates
  const getCenter = () => {
    if (establishment?.latitude && establishment?.longitude) {
      const lat = parseFloat(establishment.latitude);
      const lng = parseFloat(establishment.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return [14.676, 121.0437];
  };

  // Get marker position
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
    <div 
      ref={fullscreenContainerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'w-full'} transition-all duration-300 ease-in-out`}
    >
      {/* Fullscreen Header */}
      {isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold text-sky-600">
            Polygon Map - Fullscreen
          </h1>
          <button
            onClick={exitFullscreen}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg"
            title="Exit Fullscreen (ESC)"
          >
            <Minimize2 size={20} />
            <span className="text-sm font-medium">Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-238px)]'} w-full`}>
        {/* Fullscreen Toggle Button */}
        {!isFullscreen && (
          <button
            onClick={enterFullscreen}
            className="absolute top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors duration-200 shadow-lg border-2 border-white"
            title="Enter Fullscreen"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 9999 }}
          >
            <Maximize2 size={20} />
            <span className="text-sm font-medium hidden sm:inline">Fullscreen</span>
          </button>
        )}

      <MapContainer
        center={getCenter()}
        zoom={18}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        maxZoom={22}
          className={`${isFullscreen ? 'rounded-none' : 'rounded-lg'}`}
        >
          <LayersControl position="topleft">
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={["mt1", "mt2", "mt3"]}
              attribution="© Google"
            />
          </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="3D Terrain">
              <TileLayer
                url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Usuq2JxAdrdQy7GmBVyr"
                attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
                maxZoom={22}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

          {/* Establishment marker */}
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>{establishment.name}</Popup>
          </Marker>
        )}

          {/* Marker Snap Zone */}
          {markerPosition && snapEnabled && (
            <MarkerSnapZone 
              center={{ lat: markerPosition[0], lng: markerPosition[1] }}
              radius={snapDistance}
              isActive={showMarkerSnap}
            />
          )}

          {/* Show polygon when NOT in edit mode */}
          {!editMode && displayPolygon && displayPolygon.length > 0 && (
          <Polygon
              positions={displayPolygon}
              pathOptions={getPolygonStyle('valid')}
            />
          )}

          {/* Show other polygons */}
          {showOtherPolygons && otherPolygons.map((poly) => (
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

          {/* FeatureGroup for editing */}
        {canEditEstablishments() && editMode && (
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="bottomright"
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

        {/* Snap Indicator */}
        {snapIndicator.active && (
          <div className="absolute top-20 left-4 z-[1000]">
            <SnapIndicator 
              distance={snapIndicator.distance}
              type={snapIndicator.type}
              isActive={snapIndicator.active}
            />
          </div>
        )}

        {/* Info Message */}
      {infoMessage && (
          <div className={`pointer-events-none absolute left-3 bottom-3 z-[1000] rounded px-3 py-2 text-xs text-white shadow ${
            !isPolygonValid ? 'bg-red-600/90' : 'bg-black/70'
          }`}>
          {infoMessage}
        </div>
      )}
        
        {/* Validation Error Badge */}
        {editMode && !isPolygonValid && validationError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
