import React, { useState, useEffect } from "react";
import PolygonMap from "../establishments/PolygonMap";
import { setEstablishmentPolygon } from "../../services/api";
import { useNotifications } from "../NotificationManager";

export default function InspectionPolygonMap({ inspectionData, currentUser }) {
  const notifications = useNotifications();
  const [loading, setLoading] = useState(false);
  const [establishment, setEstablishment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user can edit polygons (exclude Division Chief)
  const canEditPolygon = () => {
    if (!currentUser?.userlevel) return false;
    const allowedRoles = ["Section Chief", "Unit Head", "Monitoring Personnel"];
    const canEdit = allowedRoles.includes(currentUser.userlevel);
    console.log('Polygon edit permission check:', {
      userLevel: currentUser.userlevel,
      allowedRoles,
      canEdit,
      establishment: establishment?.name
    });
    return canEdit;
  };

  // Extract establishment data from inspection data
  useEffect(() => {
    if (inspectionData?.establishments_detail?.[0]) {
      const establishmentData = inspectionData.establishments_detail[0];
      setEstablishment({
        id: establishmentData.id,
        name: establishmentData.name,
        latitude: establishmentData.latitude,
        longitude: establishmentData.longitude,
        polygon: establishmentData.polygon || []
      });
    }
  }, [inspectionData]);

  // Handle polygon save
  const handlePolygonSave = async (polygonData, isValid) => {
    if (!establishment?.id || !canEditPolygon()) {
      return;
    }

    if (!isValid) {
      notifications.warning("Please fix polygon validation errors before saving", {
        title: "Invalid Polygon"
      });
      return;
    }

    setLoading(true);
    try {
      await setEstablishmentPolygon(establishment.id, polygonData);
      
      // Update local establishment state
      setEstablishment(prev => ({
        ...prev,
        polygon: polygonData
      }));

      notifications.success("Polygon boundary updated successfully", {
        title: "Polygon Saved"
      });
    } catch (error) {
      console.error("Error saving polygon:", error);
      notifications.error(
        error.response?.data?.detail || 
        error.message || 
        "Failed to save polygon. Please try again.",
        {
          title: "Save Error"
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle missing establishment data
  if (!establishment) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">No establishment data available</p>
        </div>
      </div>
    );
  }

  // Handle missing coordinates
  if (!establishment.latitude || !establishment.longitude) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">Establishment coordinates not available</p>
          <p className="text-xs text-gray-400 mt-1">Cannot display map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Establishment Boundary
          </h3>
          {canEditPolygon() && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditMode ? (
                <>
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Mode
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Mode
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {establishment.name}
        </p>
        {canEditPolygon() && (
          <p className={`text-xs mt-1 ${
            isEditMode ? 'text-orange-600' : 'text-green-600'
          }`}>
            {isEditMode ? '✏️ Edit mode active - Draw or modify polygon' : '✓ Ready to edit polygon boundary'}
          </p>
        )}
        {!canEditPolygon() && currentUser?.userlevel && (
          <p className="text-xs text-gray-500 mt-1">
            View only - {currentUser.userlevel}
          </p>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Saving polygon...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div className="flex-1 relative">
        <PolygonMap
          establishment={establishment}
          onSave={handlePolygonSave}
          userRole={currentUser?.userlevel}
          editMode={canEditPolygon() && isEditMode}
          showOtherPolygons={true}
          snapEnabled={true}
          snapDistance={10}
        />
      </div>

      {/* Debug info */}
      <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-600 rounded">
        <p><strong>Debug Info:</strong></p>
        <p>User Level: {currentUser?.userlevel || 'Not loaded'}</p>
        <p>Can Edit: {canEditPolygon() ? 'Yes' : 'No'}</p>
        <p>Edit Mode: {isEditMode ? 'Active' : 'Inactive'}</p>
        <p>Establishment ID: {establishment?.id || 'Not found'}</p>
      </div>

      {/* Instructions */}
      {canEditPolygon() && (
        <div className={`mt-4 p-3 border rounded-md ${
          isEditMode 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h4 className={`text-sm font-medium mb-1 ${
            isEditMode ? 'text-orange-800' : 'text-blue-800'
          }`}>
            {isEditMode ? 'Edit Instructions:' : 'Ready to Edit:'}
          </h4>
          {isEditMode ? (
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Click the polygon tool in the map to draw or edit</li>
              <li>• Drag vertices to modify existing boundaries</li>
              <li>• Polygon will snap to nearby edges automatically</li>
              <li>• Establishment marker must be inside the polygon</li>
              <li>• Changes are saved automatically when valid</li>
            </ul>
          ) : (
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click "Edit Mode" to start drawing or editing</li>
              <li>• You can create new polygons or modify existing ones</li>
              <li>• All changes will be saved to the establishment</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
