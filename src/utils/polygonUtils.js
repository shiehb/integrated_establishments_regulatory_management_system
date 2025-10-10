import * as turf from "@turf/turf";

/**
 * Validates polygon coordinate data
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export function validatePolygonCoordinates(polygonData) {
  const errors = [];
  
  if (!Array.isArray(polygonData)) {
    errors.push("Polygon data must be an array");
    return { isValid: false, errors };
  }
  
  if (polygonData.length < 3) {
    errors.push("Polygon must have at least 3 points");
    return { isValid: false, errors };
  }
  
  for (let i = 0; i < polygonData.length; i++) {
    const coord = polygonData[i];
    if (!Array.isArray(coord) || coord.length !== 2) {
      errors.push(`Coordinate ${i} must be [lat, lng] array`);
      continue;
    }
    
    const [lat, lng] = coord;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      errors.push(`Coordinate ${i} must have valid numbers`);
      continue;
    }
    
    if (lat < -90 || lat > 90) {
      errors.push(`Coordinate ${i} latitude must be between -90 and 90`);
    }
    
    if (lng < -180 || lng > 180) {
      errors.push(`Coordinate ${i} longitude must be between -180 and 180`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Converts Leaflet latlngs to Turf polygon format
 * @param {Array} latlngs - Array of {lat, lng} objects
 * @returns {Object|null} - Turf polygon or null if invalid
 */
export function convertToTurfPolygon(latlngs) {
  if (!latlngs || latlngs.length < 3) return null;
  
  try {
    // Convert to [lng, lat] format for Turf (GeoJSON standard)
    const coordinates = latlngs.map(point => [point.lng, point.lat]);
    // Close the polygon by adding the first point at the end
    coordinates.push([latlngs[0].lng, latlngs[0].lat]);
    
    return turf.polygon([coordinates]);
  } catch (error) {
    console.error("Error converting to Turf polygon:", error);
    return null;
  }
}

/**
 * Converts Turf polygon back to Leaflet latlngs format
 * @param {Object} turfPolygon - Turf polygon object
 * @returns {Array} - Array of {lat, lng} objects
 */
export function convertFromTurfPolygon(turfPolygon) {
  if (!turfPolygon || !turfPolygon.geometry) return [];
  
  try {
    const coordinates = turfPolygon.geometry.coordinates[0] || [];
    // Remove the last coordinate if it's a duplicate of the first (closed polygon)
    const coords = coordinates.slice(0, -1);
    
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch (error) {
    console.error("Error converting from Turf polygon:", error);
    return [];
  }
}

/**
 * Subtracts overlapping polygons from the current polygon
 * @param {Array} currentLatLngs - Current polygon as {lat, lng} objects
 * @param {Array} otherPolygons - Array of other polygons as {lat, lng} objects
 * @returns {Object} - {adjustedLatLngs: Array, wasAdjusted: boolean, message: string}
 */
export function subtractOverlappingPolygons(currentLatLngs, otherPolygons) {
  if (!currentLatLngs || currentLatLngs.length < 3) {
    return { adjustedLatLngs: [], wasAdjusted: false, message: "Invalid current polygon" };
  }
  
  if (!otherPolygons || otherPolygons.length === 0) {
    return { adjustedLatLngs: currentLatLngs, wasAdjusted: false, message: "No other polygons to check" };
  }
  
  try {
    // Convert current polygon to Turf format
    const current = convertToTurfPolygon(currentLatLngs);
    if (!current) {
      return { adjustedLatLngs: [], wasAdjusted: false, message: "Invalid current polygon geometry" };
    }
    
    const originalArea = turf.area(current);
    let adjusted = current;
    
    // Convert other polygons to Turf format and subtract overlaps
    const validOtherPolygons = otherPolygons
      .filter(poly => poly && poly.latlngs && poly.latlngs.length >= 3)
      .map(poly => convertToTurfPolygon(poly.latlngs))
      .filter(turfPoly => turfPoly !== null);
    
    if (validOtherPolygons.length === 0) {
      return { adjustedLatLngs: currentLatLngs, wasAdjusted: false, message: "No valid other polygons" };
    }
    
    // Subtract each overlapping polygon iteratively
    validOtherPolygons.forEach(otherPoly => {
      try {
        if (turf.booleanIntersects(adjusted, otherPoly)) {
          const difference = turf.difference(adjusted, otherPoly);
          if (difference && !difference.is_empty) {
            adjusted = difference;
          }
        }
      } catch (error) {
        console.warn("Error subtracting polygon:", error);
      }
    });
    
    // Handle the result
    if (adjusted.is_empty) {
      return { 
        adjustedLatLngs: [], 
        wasAdjusted: true, 
        message: "Polygon fully overlapped existing areas and was cleared" 
      };
    }
    
    // If result is MultiPolygon, keep the largest piece
    if (adjusted.geometry.type === "MultiPolygon") {
      let bestPolygon = null;
      let bestArea = -1;
      
      adjusted.geometry.coordinates.forEach(polyCoords => {
        try {
          const poly = turf.polygon(polyCoords);
          const area = turf.area(poly);
          if (area > bestArea) {
            bestArea = area;
            bestPolygon = poly;
          }
        } catch (error) {
          console.warn("Error processing MultiPolygon piece:", error);
        }
      });
      
      if (bestPolygon) {
        adjusted = bestPolygon;
      } else {
        return { 
          adjustedLatLngs: [], 
          wasAdjusted: true, 
          message: "No valid polygon pieces found after adjustment" 
        };
      }
    }
    
    const newArea = turf.area(adjusted);
    const adjustedLatLngs = convertFromTurfPolygon(adjusted);
    
    return {
      adjustedLatLngs,
      wasAdjusted: newArea < originalArea,
      message: newArea < originalArea ? "Adjusted polygon to avoid overlaps" : "No overlaps found"
    };
    
  } catch (error) {
    console.error("Error in subtractOverlappingPolygons:", error);
    return { 
      adjustedLatLngs: currentLatLngs, 
      wasAdjusted: false, 
      message: "Error processing polygon intersection" 
    };
  }
}

/**
 * Filters out invalid coordinates from polygon data
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {Array} - Filtered array of valid coordinates
 */
export function filterValidCoordinates(polygonData) {
  if (!Array.isArray(polygonData)) return [];
  
  return polygonData.filter(([lat, lng]) => {
    return (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(parseFloat(lat)) &&
      !isNaN(parseFloat(lng))
    );
  });
}

/**
 * Converts coordinates to LatLng objects safely
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {Array} - Array of {lat, lng} objects
 */
export function convertToLatLngs(coordinates) {
  return coordinates
    .map(([lat, lng]) => ({
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }))
    .filter(point => !isNaN(point.lat) && !isNaN(point.lng));
}

/**
 * Snaps polygon vertices to nearby edges of existing polygons
 * @param {Array} newPolygonLatLngs - New polygon as {lat, lng} objects
 * @param {Array} existingPolygons - Array of existing polygons with latlngs property
 * @param {number} threshold - Distance threshold in meters (default: 10)
 * @returns {Object} - {snappedLatLngs: Array, wasSnapped: boolean, message: string}
 */
export function snapToNearbyEdges(newPolygonLatLngs, existingPolygons, threshold = 10) {
  if (!newPolygonLatLngs || newPolygonLatLngs.length === 0) {
    return { snappedLatLngs: [], wasSnapped: false, message: "No polygon to snap" };
  }
  
  if (!existingPolygons || existingPolygons.length === 0) {
    return { snappedLatLngs: newPolygonLatLngs, wasSnapped: false, message: "No existing polygons to snap to" };
  }
  
  try {
    let snappedPoints = [...newPolygonLatLngs];
    let snapCount = 0;
    
    // Convert new polygon points to Turf format
    const newPolygonPoints = newPolygonLatLngs.map(point => turf.point([point.lng, point.lat]));
    
    // Check each point against all existing polygons
    newPolygonPoints.forEach((point, index) => {
      let closestSnap = null;
      let minDistance = threshold;
      
      existingPolygons.forEach(existingPoly => {
        if (!existingPoly.latlngs || existingPoly.latlngs.length < 3) return;
        
        try {
          // Convert existing polygon to LineString for edge checking
          const polyCoords = existingPoly.latlngs.map(pt => [pt.lng, pt.lat]);
          polyCoords.push([existingPoly.latlngs[0].lng, existingPoly.latlngs[0].lat]); // Close polygon
          
          const polygon = turf.polygon([polyCoords]);
          const lineString = turf.polygonToLine(polygon);
          
          // Find nearest point on the polygon edges
          const nearest = turf.nearestPointOnLine(lineString, point);
          const distance = turf.distance(point, nearest, { units: 'meters' });
          
          if (distance < minDistance) {
            minDistance = distance;
            closestSnap = {
              lat: nearest.geometry.coordinates[1],
              lng: nearest.geometry.coordinates[0]
            };
          }
        } catch (error) {
          console.warn("Error snapping to polygon edge:", error);
        }
      });
      
      // Apply the snap if found
      if (closestSnap) {
        snappedPoints[index] = closestSnap;
        snapCount++;
      }
    });
    
    return {
      snappedLatLngs: snappedPoints,
      wasSnapped: snapCount > 0,
      message: snapCount > 0 ? `Snapped ${snapCount} vertices to existing edges` : "No snapping needed"
    };
    
  } catch (error) {
    console.error("Error in snapToNearbyEdges:", error);
    return { 
      snappedLatLngs: newPolygonLatLngs, 
      wasSnapped: false, 
      message: "Error during edge snapping" 
    };
  }
}

