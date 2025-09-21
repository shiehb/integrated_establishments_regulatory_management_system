import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";
import PolygonMap from "../components/establishments/PolygonMap";
import ConfirmationDialog from "../components/common/ConfirmationDialog"; // shared dialog
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
      "Monitoring Personel",
    ].includes(userRole);
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
      setCurrentView("list");
      setPolygonEstablishment(null);
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
    setPolygonEstablishment(est);
    setCurrentView("polygon");
  };

  // 🔹 handle cancel polygon
  const handleCancelPolygon = () => {
    setCurrentView("list");
    setPolygonEstablishment(null);
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
            />
          ) : (
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-sky-600">
                  {canEditPolygons()
                    ? `Draw Polygon for ${polygonEstablishment.name}`
                    : `Viewing Polygon for ${polygonEstablishment.name}`}
                </h1>
                <div className="flex gap-2">
                  {canEditPolygons() ? (
                    <>
                      <button
                        onClick={handleCancelPolygon}
                        className="px-2 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="px-2 py-1 text-white rounded bg-sky-600 hover:bg-sky-700"
                      >
                        Save Polygon
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCancelPolygon}
                      className="px-2 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Back to List
                    </button>
                  )}
                </div>
              </div>
              <PolygonMap
                establishment={polygonEstablishment}
                userRole={userRole}
                onSave={(polygon) =>
                  setPolygonEstablishment((prev) =>
                    prev ? { ...prev, polygon } : prev
                  )
                }
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
