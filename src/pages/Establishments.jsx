import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";
import PolygonMap from "../components/establishments/PolygonMap";

export default function Establishments() {
  const [showAdd, setShowAdd] = useState(false);
  const [editEstablishment, setEditEstablishment] = useState(null);

  // 🔹 for Polygon modal
  const [showPolygon, setShowPolygon] = useState(false);
  const [polygonEstablishment, setPolygonEstablishment] = useState(null);

  // 🔹 your establishments state (can be fetched from API later)
  const [establishments, setEstablishments] = useState([
    {
      id: 1,
      name: "SAMPLE ESTABLISHMENT",
      natureOfBusiness: "RETAIL",
      yearEstablished: "2020",
      address: {
        province: "METRO MANILA",
        city: "QUEZON CITY",
        barangay: "SANDY",
        street: "123 MAIN ST",
        postalCode: "1100",
      },
      coordinates: {
        latitude: "14.6760",
        longitude: "121.0437",
      },
      polygon: null,
    },
    {
      id: 2,
      name: "ANOTHER ESTABLISHMENT",
      natureOfBusiness: "WHOLESALE",
      yearEstablished: "2018",
      address: {
        province: "LAGUNA",
        city: "SAN PABLO",
        barangay: "BAGONG SILANG",
        street: "456 SECOND ST",
        postalCode: "4000",
      },
      coordinates: {
        latitude: "14.0668",
        longitude: "121.3260",
      },
      polygon: null,
    },
  ]);

  // 🔹 handle save polygon
  const handleSavePolygon = (coords) => {
    setEstablishments((prev) =>
      prev.map((e) =>
        e.id === polygonEstablishment.id ? { ...e, polygon: coords } : e
      )
    );
    setShowPolygon(false);
  };

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Establishments List */}
          <EstablishmentList
            onAdd={() => setShowAdd(true)}
            onEdit={(est) => setEditEstablishment(est)}
            onPolygon={(est) => {
              setPolygonEstablishment(est);
              setShowPolygon(true);
            }}
          />

          {/* Add Establishment Modal */}
          {showAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddEstablishment onClose={() => setShowAdd(false)} />
            </div>
          )}

          {/* Edit Establishment Modal */}
          {editEstablishment && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditEstablishment
                establishmentData={editEstablishment}
                onClose={() => setEditEstablishment(null)}
              />
            </div>
          )}

          {/* Polygon Modal */}
          {showPolygon && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white p-4 rounded-lg w-4/5 h-[700px]">
                <PolygonMap
                  existingPolygons={establishments
                    .filter((e) => e.polygon)
                    .map((e) => e.polygon)}
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
