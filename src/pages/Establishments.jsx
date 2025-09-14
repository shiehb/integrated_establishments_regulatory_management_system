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

  // 🔹 for Polygon modal
  const [showPolygon, setShowPolygon] = useState(false);
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
    setShowPolygon(false);
    setRefreshTrigger((prev) => prev + 1); // Refresh the list
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
          {/* Establishments List */}
          <EstablishmentList
            establishments={establishments}
            onAdd={() => setShowAdd(true)}
            onEdit={(est) => setEditEstablishment(est)}
            onPolygon={(est) => {
              setPolygonEstablishment(est);
              setShowPolygon(true);
            }}
            refreshTrigger={refreshTrigger}
            canEditEstablishments={canEditEstablishments()}
          />

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

          {/* Polygon Modal - Show for all authenticated users */}
          {showPolygon && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white p-4 rounded-lg w-4/5 h-[700px]">
                <PolygonMap
                  establishment={polygonEstablishment}
                  onSave={handleSavePolygon}
                  onClose={() => setShowPolygon(false)}
                />
              </div>
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
