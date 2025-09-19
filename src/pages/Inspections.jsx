import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import InspectionList from "../components/inspections/InspectionList";
import InspectionWizard from "../components/inspections/InspectionWizard";
import EditInspection from "../components/inspections/EditInspection";
import ViewInspection from "../components/inspections/ViewInspection";
import InspectionForm from "../components/inspections/form";
import { getEstablishments } from "../services/api"; // Import the API function

export default function Inspections() {
  const [showWizard, setShowWizard] = useState(false);
  const [editInspection, setEditInspection] = useState(null);
  const [viewInspection, setViewInspection] = useState(null);
  const [currentFormInspection, setCurrentFormInspection] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Inspections state - now each inspection has only one establishment
  const [inspections, setInspections] = useState([
    {
      id: "EIA-2025-0001",
      establishmentId: 1, // Changed from establishments array to single establishmentId
      section: "PD-1586",
      status: "PENDING",
    },
  ]);

  // 🔹 Fetch establishments on component mount
  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const data = await getEstablishments();
      // Transform API data to match the expected format
      const formattedEstablishments = data.map((est) => ({
        id: est.id,
        name: est.name,
        natureOfBusiness: est.nature_of_business,
        yearEstablished: est.year_established,
        address: {
          province: est.province,
          city: est.city,
          barangay: est.barangay,
          street: est.street_building,
          postalCode: est.postal_code,
        },
        coordinates: {
          latitude: est.latitude,
          longitude: est.longitude,
        },
      }));
      setEstablishments(formattedEstablishments);
    } catch (err) {
      console.error("Error fetching establishments:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // 🔹 Get the last inspection law for an establishment (for reinspection)
  const getLastInspectionLaw = (establishmentId) => {
    const establishmentInspections = inspections
      .filter((insp) => insp.establishmentId === establishmentId)
      .sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID descending (newest first)

    return establishmentInspections.length > 0
      ? establishmentInspections[0].section
      : null;
  };

  // 🔹 Save new inspections (multiple when multiple establishments selected)
  const handleSaveInspection = (inspectionsData) => {
    // inspectionsData is now an array of inspection objects
    setInspections((prev) => [...prev, ...inspectionsData]);
    setShowWizard(false);
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

  const handleOpenForm = (inspection) => {
    setCurrentFormInspection(inspection);
    setViewInspection(null); // Close view modal
  };

  const handleCloseForm = () => {
    setCurrentFormInspection(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel="admin">
          <div className="p-4">Loading establishments...</div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {showWizard ? (
            <InspectionWizard
              establishments={establishments}
              onCancel={() => setShowWizard(false)}
              onSave={handleSaveInspection}
              getLastInspectionLaw={getLastInspectionLaw}
              existingInspections={inspections}
            />
          ) : (
            <InspectionList
              inspections={inspectionsWithDetails}
              onAdd={() => setShowWizard(true)}
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
                onOpenForm={handleOpenForm}
              />
            </div>
          )}

          {/* Inspection Form Modal */}
          {currentFormInspection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="w-full h-full p-6 overflow-auto bg-white">
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    Inspection Form - {currentFormInspection.id}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Close Form
                  </button>
                </div>
                <InspectionForm
                  inspectionData={currentFormInspection}
                  establishment={establishments.find(
                    (e) => e.id === currentFormInspection.establishmentId
                  )}
                  onSave={(formData) => {
                    console.log(
                      "Saving form for inspection:",
                      currentFormInspection.id,
                      formData
                    );
                    handleCloseForm();
                  }}
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
