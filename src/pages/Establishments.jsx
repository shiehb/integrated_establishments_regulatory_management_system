import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";
import PolygonMap from "../components/establishments/PolygonMap";
import { getEstablishments } from "../services/api";

export default function Establishments() {
  const [showAdd, setShowAdd] = useState(false);
  const [editEstablishment, setEditEstablishment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🔹 for Polygon modal
  const [showPolygon, setShowPolygon] = useState(false);
  const [polygonEstablishment, setPolygonEstablishment] = useState(null);

  // 🔹 establishments state
  const [establishments, setEstablishments] = useState([]);

  // 🔹 Fetch establishments on component mount and refresh
  useEffect(() => {
    fetchEstablishments();
  }, [refreshTrigger]);

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
          />

          {/* Add Establishment Modal */}
          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddEstablishment
                onClose={() => setShowAdd(false)}
                onEstablishmentAdded={handleEstablishmentChanged}
              />
            </div>
          )}

          {/* Edit Establishment Modal */}
          {editEstablishment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditEstablishment
                establishmentData={editEstablishment}
                onClose={() => setEditEstablishment(null)}
                onEstablishmentUpdated={handleEstablishmentChanged}
              />
            </div>
          )}

          {/* Polygon Modal */}
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
