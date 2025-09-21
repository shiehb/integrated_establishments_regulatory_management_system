import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";
import PolygonMap from "../components/establishments/PolygonMap";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import {
  getEstablishments,
  getProfile,
  setEstablishmentPolygon,
} from "../services/api";

export default function Establishments() {
  const [showAdd, setShowAdd] = useState(false);
  const [editEstablishment, setEditEstablishment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState("");

  // 🔹 View state: 'list' or 'polygon'
  const [currentView, setCurrentView] = useState("list");
  const [polygonEstablishment, setPolygonEstablishment] = useState(null);
  const [polygonEditMode, setPolygonEditMode] = useState(false);
  const [hasPolygonChanges, setHasPolygonChanges] = useState(false);

  // 🔹 establishments state
  const [establishments, setEstablishments] = useState([]);

  // 🔹 confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch user profile and establishments on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchEstablishments();
  }, [refreshTrigger]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile();
      setUserRole(profile.userlevel);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchEstablishments = async () => {
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching establishments");
      }
    }
  };

  // 🔹 Check if user can add/edit establishments (form only)
  const canEditEstablishments = () => {
    return ["Division Chief", "Section Chief", "Unit Head"].includes(userRole);
  };

  // 🔹 Check if user can edit polygons
  const canEditPolygons = () => {
    return [
      "Division Chief",
      "Section Chief",
      "Unit Head",
      "Monitoring Personnel",
    ].includes(userRole);
  };

  // 🔹 Check if polygon has changes
  const checkPolygonChanges = (newPolygon) => {
    if (!polygonEstablishment) return false;

    const originalPolygon = polygonEstablishment.originalPolygon || [];
    const currentPolygon = newPolygon || polygonEstablishment.polygon || [];

    // If both are empty, no changes
    if (originalPolygon.length === 0 && currentPolygon.length === 0) {
      return false;
    }

    // If lengths are different, definitely changes
    if (originalPolygon.length !== currentPolygon.length) {
      return true;
    }

    // Check if any coordinate has changed
    for (let i = 0; i < originalPolygon.length; i++) {
      const [origLat, origLng] = originalPolygon[i];
      const [currLat, currLng] = currentPolygon[i];

      if (origLat !== currLat || origLng !== currLng) {
        return true;
      }
    }

    return false;
  };

  // 🔹 save polygon with API call
  const confirmSavePolygon = async () => {
    if (!polygonEstablishment) return;
    setLoading(true);
    try {
      await setEstablishmentPolygon(
        polygonEstablishment.id,
        polygonEstablishment.polygon || []
      );
      setEstablishments((prev) =>
        prev.map((e) =>
          e.id === polygonEstablishment.id
            ? { ...e, polygon: polygonEstablishment.polygon || [] }
            : e
        )
      );
      setPolygonEditMode(false);
      setHasPolygonChanges(false);
      setRefreshTrigger((prev) => prev + 1);
      if (window.showNotification) {
        window.showNotification("success", "Polygon saved successfully!");
      }
    } catch (err) {
      console.error("Error saving polygon:", err);
      if (window.showNotification) {
        window.showNotification("error", "Failed to save polygon");
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // 🔹 handle polygon view
  const handleShowPolygon = (est) => {
    setPolygonEstablishment({
      ...est,
      originalPolygon: est.polygon ? [...est.polygon] : [],
    });
    setCurrentView("polygon");
    setPolygonEditMode(false);
    setHasPolygonChanges(false);
  };

  // 🔹 handle cancel polygon and return to list
  const handleCancelPolygon = () => {
    setCurrentView("list");
    setPolygonEstablishment(null);
    setPolygonEditMode(false);
    setHasPolygonChanges(false);
  };

  // 🔹 handle cancel polygon edit (keep in polygon view but exit edit mode)
  const handleCancelPolygonEdit = () => {
    setPolygonEditMode(false);
    setHasPolygonChanges(false);
    // Reset polygon to original state
    if (polygonEstablishment && polygonEstablishment.originalPolygon) {
      setPolygonEstablishment((prev) => ({
        ...prev,
        polygon: [...prev.originalPolygon],
      }));
    }
  };

  // 🔹 handle start editing polygon
  const handleStartPolygonEdit = () => {
    setPolygonEditMode(true);
  };

  // 🔹 handle polygon changes
  const handlePolygonChange = (polygon) => {
    setPolygonEstablishment((prev) => (prev ? { ...prev, polygon } : prev));

    // Check if there are changes compared to original
    const hasChanges = checkPolygonChanges(polygon);
    setHasPolygonChanges(hasChanges);
  };

  // 🔹 handle establishment added/updated
  const handleEstablishmentChanged = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Show either the list view or polygon view */}
          {currentView === "list" ? (
            <EstablishmentList
              onAdd={() => setShowAdd(true)}
              onEdit={(est) => setEditEstablishment(est)}
              onPolygon={handleShowPolygon}
              refreshTrigger={refreshTrigger}
              canEditEstablishments={canEditEstablishments()}
              canEditPolygons={canEditPolygons()}
            />
          ) : (
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-sky-600">
                  {polygonEditMode
                    ? `Editing Polygon for ${polygonEstablishment.name}`
                    : `Viewing Polygon for ${polygonEstablishment.name}`}
                </h1>
                <div className="flex gap-2">
                  {canEditPolygons() ? (
                    <>
                      {/* View Mode - Show Create/Update button and Back to List */}
                      {!polygonEditMode && (
                        <>
                          <button
                            onClick={handleCancelPolygon}
                            className="px-3 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Back to List
                          </button>
                          <button
                            onClick={handleStartPolygonEdit}
                            className="px-3 py-1 text-white rounded bg-sky-600 hover:bg-sky-700"
                          >
                            {polygonEstablishment.polygon &&
                            polygonEstablishment.polygon.length > 0
                              ? "Update Polygon"
                              : "Create Polygon"}
                          </button>
                        </>
                      )}

                      {/* Edit Mode - Show Save/Cancel buttons (hide Back to List) */}
                      {polygonEditMode && (
                        <>
                          <button
                            onClick={handleCancelPolygonEdit}
                            className="px-3 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setShowConfirm(true)}
                            disabled={!hasPolygonChanges}
                            className={`px-3 py-1 text-white rounded ${
                              hasPolygonChanges
                                ? "bg-sky-600 hover:bg-sky-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Save Polygon
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    // For users who can't edit polygons, always show Back to List
                    <button
                      onClick={handleCancelPolygon}
                      className="px-3 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Back to List
                    </button>
                  )}
                </div>
              </div>
              <PolygonMap
                establishment={polygonEstablishment}
                userRole={userRole}
                editMode={polygonEditMode}
                onSave={handlePolygonChange}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />

      {/* Add Establishment Modal */}
      {showAdd && canEditEstablishments() && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <AddEstablishment
            onClose={() => setShowAdd(false)}
            onEstablishmentAdded={handleEstablishmentChanged}
          />
        </div>
      )}

      {/* Edit Establishment Modal */}
      {editEstablishment && canEditEstablishments() && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <EditEstablishment
            establishmentData={editEstablishment}
            onClose={() => setEditEstablishment(null)}
            onEstablishmentUpdated={handleEstablishmentChanged}
          />
        </div>
      )}

      {/* ✅ Confirmation Dialog for Saving Polygon */}
      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Action"
        message="Are you sure you want to save changes to this polygon?"
        loading={loading}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmSavePolygon}
      />
    </>
  );
}
