import * as turf from "@turf/turf";

/**
 * Calculate the area of a polygon in square meters
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {number} - Area in square meters
 */
export function calculatePolygonArea(polygonData) {
  if (!polygonData || polygonData.length < 3) {
    return 0;
  }

  try {
    // Convert to Turf format [lng, lat]
    const coordinates = polygonData.map(([lat, lng]) => [lng, lat]);
    coordinates.push([polygonData[0][1], polygonData[0][0]]); // Close polygon
    
    const polygon = turf.polygon([coordinates]);
    return turf.area(polygon); // Returns area in square meters
  } catch (error) {
    console.error("Error calculating polygon area:", error);
    return 0;
  }
}

/**
 * Calculate the perimeter of a polygon in meters
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {number} - Perimeter in meters
 */
export function calculatePerimeter(polygonData) {
  if (!polygonData || polygonData.length < 3) {
    return 0;
  }

  try {
    // Convert to Turf format [lng, lat]
    const coordinates = polygonData.map(([lat, lng]) => [lng, lat]);
    coordinates.push([polygonData[0][1], polygonData[0][0]]); // Close polygon
    
    const polygon = turf.polygon([coordinates]);
    const lineString = turf.polygonToLine(polygon);
    return turf.length(lineString, { units: 'meters' }); // Returns length in meters
  } catch (error) {
    console.error("Error calculating polygon perimeter:", error);
    return 0;
  }
}

/**
 * Format area for display (m² or hectares)
 * @param {number} areaInSquareMeters - Area in square meters
 * @returns {string} - Formatted area string
 */
export function formatArea(areaInSquareMeters) {
  if (areaInSquareMeters < 10000) {
    // Show in square meters if less than 1 hectare
    return `${areaInSquareMeters.toFixed(2)} m²`;
  } else {
    // Show in hectares if 1 hectare or more
    const hectares = areaInSquareMeters / 10000;
    return `${hectares.toFixed(2)} ha (${areaInSquareMeters.toFixed(0)} m²)`;
  }
}

/**
 * Calculate distance from a point to the nearest edge of a polygon
 * @param {Array} point - [lat, lng] coordinates of the point
 * @param {Array} polygonData - Array of [lat, lng] coordinates forming the polygon
 * @returns {number} - Distance in meters
 */
export function distanceToEdge(point, polygonData) {
  if (!point || !polygonData || polygonData.length < 3) {
    return Infinity;
  }

  try {
    // Convert point to Turf format
    const turfPoint = turf.point([point[1], point[0]]); // [lng, lat]
    
    // Convert polygon to Turf format
    const coordinates = polygonData.map(([lat, lng]) => [lng, lat]);
    coordinates.push([polygonData[0][1], polygonData[0][0]]); // Close polygon
    
    const polygon = turf.polygon([coordinates]);
    const lineString = turf.polygonToLine(polygon);
    
    return turf.distance(turfPoint, lineString, { units: 'meters' });
  } catch (error) {
    console.error("Error calculating distance to edge:", error);
    return Infinity;
  }
}

/**
 * Get the center point of a polygon
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {Object|null} - {lat: number, lng: number} or null if invalid
 */
export function getPolygonCenter(polygonData) {
  if (!polygonData || polygonData.length < 3) {
    return null;
  }

  try {
    // Convert to Turf format [lng, lat]
    const coordinates = polygonData.map(([lat, lng]) => [lng, lat]);
    coordinates.push([polygonData[0][1], polygonData[0][0]]); // Close polygon
    
    const polygon = turf.polygon([coordinates]);
    const center = turf.centroid(polygon);
    
    return {
      lat: center.geometry.coordinates[1],
      lng: center.geometry.coordinates[0]
    };
  } catch (error) {
    console.error("Error calculating polygon center:", error);
    return null;
  }
}

/**
 * Calculate the bounding box of a polygon
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {Object|null} - {north, south, east, west} or null if invalid
 */
export function getPolygonBounds(polygonData) {
  if (!polygonData || polygonData.length < 3) {
    return null;
  }

  try {
    // Convert to Turf format [lng, lat]
    const coordinates = polygonData.map(([lat, lng]) => [lng, lat]);
    coordinates.push([polygonData[0][1], polygonData[0][0]]); // Close polygon
    
    const polygon = turf.polygon([coordinates]);
    const bbox = turf.bbox(polygon); // Returns [west, south, east, north]
    
    return {
      west: bbox[0],
      south: bbox[1],
      east: bbox[2],
      north: bbox[3]
    };
  } catch (error) {
    console.error("Error calculating polygon bounds:", error);
    return null;
  }
}

/**
 * Validate if a polygon is valid (simple validation)
 * @param {Array} polygonData - Array of [lat, lng] coordinates
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export function validatePolygon(polygonData) {
  const errors = [];
  
  if (!Array.isArray(polygonData)) {
    errors.push("Polygon data must be an array");
    return { isValid: false, errors };
  }
  
  if (polygonData.length < 3) {
    errors.push("Polygon must have at least 3 vertices");
    return { isValid: false, errors };
  }
  
  // Check for valid coordinates
  for (let i = 0; i < polygonData.length; i++) {
    const coord = polygonData[i];
    if (!Array.isArray(coord) || coord.length !== 2) {
      errors.push(`Vertex ${i + 1} must be [lat, lng] array`);
      continue;
    }
    
    const [lat, lng] = coord;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      errors.push(`Vertex ${i + 1} must have valid numbers`);
      continue;
    }
    
    if (lat < -90 || lat > 90) {
      errors.push(`Vertex ${i + 1} latitude must be between -90 and 90`);
    }
    
    if (lng < -180 || lng > 180) {
      errors.push(`Vertex ${i + 1} longitude must be between -180 and 180`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
