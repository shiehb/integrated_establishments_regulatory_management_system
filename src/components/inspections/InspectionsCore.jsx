import { useState, useEffect } from "react";
import InspectionList from "./InspectionList";
import InspectionWizard from "./InspectionWizard";
import EditInspection from "./EditInspection";
import ViewInspection from "./ViewInspection";
import InspectionDisplay from "./InspectionDisplay";
import InspectionWorkflow from "./InspectionWorkflow";
import { getEstablishments, getInspections } from "../../services/api";

export default function InspectionsCore({ canCreate = false, userLevel }) {
  const [showWizard, setShowWizard] = useState(false);
  const [editInspection, setEditInspection] = useState(null);
  const [viewInspection, setViewInspection] = useState(null);
  const [workflowInspection, setWorkflowInspection] = useState(null);
  const [currentFormInspection, setCurrentFormInspection] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const data = await getEstablishments();
      const formatted = data.map((est) => ({
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
        coordinates: { latitude: est.latitude, longitude: est.longitude },
      }));
      setEstablishments(formatted);
    } catch (err) {
      console.error("Error fetching establishments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const data = await getInspections();
      // Map backend to frontend expected model with workflow data
      const mapped = data.map((d) => ({
        id: d.code || `${d.id}`,
        establishmentId: d.establishment,
        section: d.section,
        status: d.status,
        can_act: d.can_act,
        current_assignee_name: d.current_assignee_name,
        workflow_comments: d.workflow_comments,
        assigned_legal_unit_name: d.assigned_legal_unit_name,
        assigned_division_head_name: d.assigned_division_head_name,
        assigned_section_chief_name: d.assigned_section_chief_name,
        assigned_unit_head_name: d.assigned_unit_head_name,
        assigned_monitor_name: d.assigned_monitor_name,
        billing_record: d.billing_record,
        compliance_call: d.compliance_call,
        inspection_list: d.inspection_list,
        applicable_laws: d.applicable_laws,
        inspection_notes: d.inspection_notes,
        establishment_detail: d.establishment_detail,
      }));
      setInspections(mapped);
    } catch (e) {
      console.error("Failed to load inspections", e);
    }
  };

  // IDs are provided by backend (code), no local generation needed

  const getLastInspectionLaw = (establishmentId) => {
    const list = inspections
      .filter((i) => i.establishmentId === establishmentId)
      .sort((a, b) => b.id.localeCompare(a.id));
    return list.length > 0 ? list[0].section : null;
  };

  const handleSaveInspection = (arr) => {
    setInspections((prev) => [...prev, ...arr]);
    setShowWizard(false);
  };

  const handleUpdateInspection = (id, section) => {
    setInspections((prev) => prev.map((i) => (i.id === id ? { ...i, section } : i)));
  };

  const inspectionsWithDetails = inspections.map((i) => {
    const establishment = establishments.find((e) => e.id === i.establishmentId);
    return { ...i, establishments: establishment ? [establishment] : [] };
  });

  const handleOpenForm = (inspection) => {
    setCurrentFormInspection(inspection);
    setViewInspection(null);
  };

  const handleCloseForm = () => setCurrentFormInspection(null);

  const handleWorkflowOpen = (inspection) => {
    setWorkflowInspection(inspection);
  };

  const handleWorkflowClose = () => {
    setWorkflowInspection(null);
    fetchInspections(); // Refresh the inspections list
  };

  const handleWorkflowUpdate = (updatedInspection) => {
    setInspections(prev => 
      prev.map(inspection => 
        inspection.id === updatedInspection.code || inspection.id === updatedInspection.id
          ? { ...inspection, ...updatedInspection }
          : inspection
      )
    );
  };

  if (loading) {
    return <div className="p-4">Loading establishments...</div>;
  }

  return (
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
          onAdd={canCreate ? () => setShowWizard(true) : undefined}
          onView={(insp) => setViewInspection(insp)}
          onWorkflowOpen={handleWorkflowOpen}
          userLevel={userLevel}
        />
      )}

      {editInspection && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
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

      {viewInspection && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <ViewInspection
            inspection={viewInspection}
            onClose={() => setViewInspection(null)}
            onOpenForm={handleOpenForm}
          />
        </div>
      )}

      {currentFormInspection && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full h-full p-1 overflow-hidden bg-white">
            <InspectionDisplay inspectionData={currentFormInspection} />
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCloseForm}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close Form
              </button>
            </div>
          </div>
        </div>
      )}

      {workflowInspection && (
        <InspectionWorkflow
          inspection={workflowInspection}
          userLevel={userLevel}
          onUpdate={handleWorkflowUpdate}
          onClose={handleWorkflowClose}
        />
      )}
    </div>
  );
}


