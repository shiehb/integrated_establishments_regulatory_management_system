// Establishments.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";
import PolygonMap from "../components/establishments/PolygonMap";
import { getEstablishments, getProfile } from "../services/api";

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

  // 🔹 Check if user can add/edit establishments
  const canEditEstablishments = () => {
    return ["Admin", "Division Chief", "Section Chief", "Unit Head"].includes(
      userRole
    );
  };

  // 🔹 handle save polygon
  const handleSavePolygon = (coords) => {
    setEstablishments((prev) =>
      prev.map((e) =>
        e.id === polygonEstablishment.id ? { ...e, polygon: coords } : e
      )
    );
    setCurrentView("list");
    setRefreshTrigger((prev) => prev + 1); // Refresh the list
  };

  // 🔹 handle polygon view
  const handleShowPolygon = (est) => {
    setPolygonEstablishment(est);
    setCurrentView("polygon");
  };

  // 🔹 handle back to list
  const handleBackToList = () => {
    setCurrentView("list");
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
              establishments={establishments}
              onAdd={() => setShowAdd(true)}
              onEdit={(est) => setEditEstablishment(est)}
              onPolygon={handleShowPolygon}
              refreshTrigger={refreshTrigger}
              canEditEstablishments={canEditEstablishments()}
            />
          ) : (
            <div className="p-4 pb-0 bg-white rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-sky-600">
                  Edit Polygon - {polygonEstablishment.name}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleBackToList}
                    className="flex-1 px-2 py-1 font-medium text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Get the polygon data and save it
                      const layer = drawnItemsRef.current.getLayers()[0];
                      if (layer) {
                        const coords = layer
                          .getLatLngs()[0]
                          .map((latlng) => [latlng.lat, latlng.lng]);
                        handleSavePolygon(coords);
                      } else {
                        handleSavePolygon(null);
                      }
                    }}
                    className="px-2 py-1 text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    Save Polygon
                  </button>
                </div>
              </div>
              <PolygonMap
                establishment={polygonEstablishment}
                onSave={handleSavePolygon}
                onClose={handleBackToList}
                showButtons={false}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />

      {/* Add Establishment Modal - Only show for authorized users */}
      {showAdd && canEditEstablishments() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <AddEstablishment
            onClose={() => setShowAdd(false)}
            onEstablishmentAdded={handleEstablishmentChanged}
          />
        </div>
      )}

      {/* Edit Establishment Modal - Only show for authorized users */}
      {editEstablishment && canEditEstablishments() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <EditEstablishment
            establishmentData={editEstablishment}
            onClose={() => setEditEstablishment(null)}
            onEstablishmentUpdated={handleEstablishmentChanged}
          />
        </div>
      )}
    </>
  );
}
