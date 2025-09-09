import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import InspectionList from "../components/inspections/InspectionList";
import AddInspection from "../components/inspections/AddInspection";
import EditInspection from "../components/inspections/EditInspection";
import ViewInspection from "../components/inspections/ViewInspection";

export default function Inspections() {
  const [showAdd, setShowAdd] = useState(false);
  const [editInspection, setEditInspection] = useState(null);
  const [viewInspection, setViewInspection] = useState(null);

  // 🔹 Sample establishments
  const [establishments] = useState([
    {
      id: 1,
      name: "SAMPLE ESTABLISHMENT",
      natureOfBusiness: "RETAIL",
      address: {
        province: "METRO MANILA",
        city: "QUEZON CITY",
        barangay: "SANDY",
        street: "123 MAIN ST",
        postalCode: "1100",
      },
      coordinates: { latitude: "14.6760", longitude: "121.0437" },
    },
    {
      id: 2,
      name: "ANOTHER ESTABLISHMENT",
      natureOfBusiness: "WHOLESALE",
      address: {
        province: "LAGUNA",
        city: "SAN PABLO",
        barangay: "BAGONG SILANG",
        street: "456 SECOND ST",
        postalCode: "4000",
      },
      coordinates: { latitude: "14.0668", longitude: "121.3260" },
    },
  ]);

  // 🔹 Inspections state - now each inspection has only one establishment
  const [inspections, setInspections] = useState([
    {
      id: "EIA-2025-0001",
      establishmentId: 1, // Changed from establishments array to single establishmentId
      section: "PD-1586",
      status: "PENDING",
    },
  ]);

  // 🔹 Map law → prefix
  const sectionPrefixes = {
    "PD-1586": "EIA", // Environmental Impact Assessment
    "RA-6969": "TOX", // Toxic Substances
    "RA-8749": "AIR", // Clean Air Act
    "RA-9275": "WATER", // Clean Water Act
    "RA-9003": "WASTE", // Ecological Solid Waste
  };

  // 🔹 Generate new inspection ID based on section
  const generateInspectionId = (section) => {
    const prefix = sectionPrefixes[section] || "GEN";
    const year = new Date().getFullYear();

    // Count existing inspections for this section type
    const sectionCount =
      inspections.filter((insp) => insp.section === section).length + 1;
    const seq = sectionCount.toString().padStart(4, "0");

    return `${prefix}-${year}-${seq}`;
  };

  // 🔹 Save new inspections (multiple when multiple establishments selected)
  const handleSaveInspection = (inspectionsData) => {
    // inspectionsData is now an array of inspection objects
    setInspections((prev) => [...prev, ...inspectionsData]);
  };

  // 🔹 Update inspection section
  const handleUpdateInspection = (id, section) => {
    setInspections((prev) =>
      prev.map((insp) => (insp.id === id ? { ...insp, section } : insp))
    );
  };

  // 🔹 Expand inspections with establishment details
  const inspectionsWithDetails = inspections.map((i) => {
    const establishment = establishments.find(
      (e) => e.id === i.establishmentId
    );
    return {
      ...i,
      establishments: establishment ? [establishment] : [],
    };
  });

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {showAdd ? (
            <AddInspection
              establishments={establishments}
              onCancel={() => setShowAdd(false)}
              onSave={(inspectionsData) => {
                handleSaveInspection(inspectionsData);
                setShowAdd(false);
              }}
            />
          ) : (
            <InspectionList
              inspections={inspectionsWithDetails}
              onAdd={() => setShowAdd(true)}
              onEdit={(insp) => setEditInspection(insp)}
              onView={(insp) => setViewInspection(insp)}
            />
          )}

          {/* Edit Modal */}
          {editInspection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditInspection
                inspection={editInspection}
                onClose={() => setEditInspection(null)}
                onSave={(section) => {
                  handleUpdateInspection(editInspection.id, section);
                  setEditInspection(null);
                }}
              />
            </div>
          )}

          {/* View Modal */}
          {viewInspection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <ViewInspection
                inspection={viewInspection}
                onClose={() => setViewInspection(null)}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
