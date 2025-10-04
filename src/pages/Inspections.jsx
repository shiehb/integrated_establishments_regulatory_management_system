import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import InspectionsList from "../components/inspections/InspectionsList";
import SimpleInspectionWizard from "../components/inspections/SimpleInspectionWizard";
import ViewInspection from "../components/inspections/ViewInspection";
import { 
  getProfile, 
  getEstablishments, 
  createInspection, 
  makeWorkflowDecision, 
  sectionReview, 
  forwardToMonitoring, 
  unitReview, 
  monitoringInspection,
  sendNoticeOfViolation,
  sendNoticeOfOrder,
  closeCase,
  updateComplianceStatus,
  advanceReturnPath
} from "../services/api";
import ComplianceModal from "../components/inspections/ComplianceModal";
import LegalUnitModal from "../components/inspections/LegalUnitModal";

export default function Inspections() {
  const [showAdd, setShowAdd] = useState(false);
  const [viewInspection, setViewInspection] = useState(null);
  const [workflowInspection, setWorkflowInspection] = useState(null);
  const [complianceModal, setComplianceModal] = useState({ open: false, inspection: null });
  const [legalUnitModal, setLegalUnitModal] = useState({ open: false, inspection: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userLevel, setUserLevel] = useState("public");
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState([]);
  const [establishmentsLoading, setEstablishmentsLoading] = useState(false);

  const refreshInspections = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleWorkflowAction = async (inspection, actionType = 'inspect') => {
    try {
      let result;
      let actionMessage = '';
      
      // Call the appropriate backend API based on current status and action
      if (['DIVISION_CREATED', 'SECTION_ASSIGNED'].includes(inspection.status) && actionType === 'inspect') {
        // Section Chief clicking "Inspect" button - moves to SECTION_IN_PROGRESS
        result = await makeWorkflowDecision(inspection.id, 'INSPECT', 'Section Chief started inspection');
        actionMessage = `Inspection ${inspection.code} has been moved to "My Inspections" tab with SECTION_IN_PROGRESS status.`;
      } else if (['DIVISION_CREATED', 'SECTION_ASSIGNED'].includes(inspection.status) && actionType === 'forward_to_unit') {
        // Section Chief clicking "Forward to Unit Head" button
        result = await makeWorkflowDecision(inspection.id, 'FORWARD_TO_UNIT', 'Forwarded to Unit Head by Section Chief');
        actionMessage = `Inspection ${inspection.code} has been forwarded to Unit Head.`;
      } else if (['DIVISION_CREATED', 'SECTION_ASSIGNED'].includes(inspection.status) && actionType === 'forward_to_monitoring') {
        // Section Chief clicking "Forward to Monitoring" button
        result = await makeWorkflowDecision(inspection.id, 'FORWARD_TO_MONITORING', 'Forwarded to Monitoring by Section Chief');
        actionMessage = `Inspection ${inspection.code} has been forwarded to Monitoring Personnel.`;
      } else if (inspection.status === 'SECTION_IN_PROGRESS' && actionType === 'complete_inspection') {
        // Section Chief clicking "Complete Inspection" button
        result = await makeWorkflowDecision(inspection.id, 'COMPLETE_INSPECTION', 'Section Chief completed inspection');
        actionMessage = `Inspection ${inspection.code} has been completed.`;
      } else if (inspection.status === 'SECTION_REVIEWED' && actionType === 'review') {
        // Section Chief clicking "Review" button - forward to Division
        result = await makeWorkflowDecision(inspection.id, 'REVIEW', 'Section Chief reviewed and forwarded to Division');
        actionMessage = `Inspection ${inspection.code} has been forwarded to Division Chief.`;
      } else if (inspection.status === 'UNIT_ASSIGNED' && actionType === 'inspect') {
        // Unit Head clicking "Inspect" button - moves to UNIT_IN_PROGRESS
        result = await makeWorkflowDecision(inspection.id, 'INSPECT', 'Unit Head started inspection');
        actionMessage = `Inspection ${inspection.code} has been moved to "My Inspections" tab with UNIT_IN_PROGRESS status.`;
      } else if (inspection.status === 'UNIT_ASSIGNED' && actionType === 'forward_to_monitoring') {
        // Unit Head clicking "Forward to Monitoring" button
        result = await makeWorkflowDecision(inspection.id, 'FORWARD_TO_MONITORING', 'Forwarded to Monitoring by Unit Head');
        actionMessage = `Inspection ${inspection.code} has been forwarded to Monitoring Personnel.`;
      } else if (inspection.status === 'UNIT_IN_PROGRESS' && actionType === 'complete_inspection') {
        // Unit Head clicking "Complete Inspection" button
        result = await makeWorkflowDecision(inspection.id, 'COMPLETE_INSPECTION', 'Unit Head completed inspection');
        actionMessage = `Inspection ${inspection.code} has been completed.`;
      } else if (inspection.status === 'UNIT_REVIEWED' && actionType === 'review') {
        // Unit Head clicking "Review" button - forward to Section
        result = await makeWorkflowDecision(inspection.id, 'REVIEW', 'Unit Head reviewed and forwarded to Section');
        actionMessage = `Inspection ${inspection.code} has been forwarded to Section Chief.`;
      } else if (inspection.status === 'MONITORING_ASSIGN' && actionType === 'start_inspection') {
        // Monitoring Personnel clicking "Start Inspection" button
        result = await makeWorkflowDecision(inspection.id, 'START_INSPECTION', 'Monitoring Personnel started inspection');
        actionMessage = `Inspection ${inspection.code} has been started by Monitoring Personnel.`;
      } else if (inspection.status === 'MONITORING_IN_PROGRESS' && actionType === 'complete_compliant') {
        // Monitoring Personnel clicking "Complete - Compliant" button
        result = await makeWorkflowDecision(inspection.id, 'COMPLETE_COMPLIANT', 'Monitoring Personnel completed inspection - compliant');
        actionMessage = `Inspection ${inspection.code} has been completed as compliant. Return path initiated.`;
      } else if (inspection.status === 'MONITORING_IN_PROGRESS' && actionType === 'complete_non_compliant') {
        // Monitoring Personnel clicking "Complete - Non-Compliant" button
        result = await makeWorkflowDecision(inspection.id, 'COMPLETE_NON_COMPLIANT', 'Monitoring Personnel completed inspection - non-compliant');
        actionMessage = `Inspection ${inspection.code} has been completed as non-compliant. Return path initiated.`;
      } else if (inspection.status === 'DIVISION_REVIEWED' && actionType === 'review') {
        // Division Chief clicking "Review" button
        result = await makeWorkflowDecision(inspection.id, 'REVIEW', 'Division Chief reviewed inspection');
        actionMessage = `Inspection ${inspection.code} has been reviewed by Division Chief.`;
      } else if (inspection.status === 'LEGAL_REVIEW' && actionType === 'send_nov') {
        // Legal Unit clicking "Send NOV" button
        result = await makeWorkflowDecision(inspection.id, 'SEND_NOV', 'Notice of Violation sent to establishment');
        actionMessage = `Notice of Violation has been sent for inspection ${inspection.code}.`;
      } else if (inspection.status === 'LEGAL_REVIEW' && actionType === 'send_noo') {
        // Legal Unit clicking "Send NOO" button
        result = await makeWorkflowDecision(inspection.id, 'SEND_NOO', 'Notice of Order sent to establishment');
        actionMessage = `Notice of Order has been sent for inspection ${inspection.code}.`;
      } else if (inspection.status === 'LEGAL_REVIEW' && actionType === 'close_case') {
        // Legal Unit clicking "Close Case" button
        result = await makeWorkflowDecision(inspection.id, 'CLOSE_CASE', 'Case closed by Legal Unit');
        actionMessage = `Case has been closed for inspection ${inspection.code}.`;
      } else if (inspection.status === 'NOV_SENT' && actionType === 'send_noo') {
        // Legal Unit clicking "Send NOO" button after NOV
        result = await makeWorkflowDecision(inspection.id, 'SEND_NOO', 'Notice of Order sent to establishment');
        actionMessage = `Notice of Order has been sent for inspection ${inspection.code}.`;
      } else if (inspection.status === 'NOV_SENT' && actionType === 'close_case') {
        // Legal Unit clicking "Close Case" button after NOV
        result = await makeWorkflowDecision(inspection.id, 'CLOSE_CASE', 'Case closed by Legal Unit');
        actionMessage = `Case has been closed for inspection ${inspection.code}.`;
      } else if (inspection.status === 'NOO_SENT' && actionType === 'close_case') {
        // Legal Unit clicking "Close Case" button after NOO
        result = await makeWorkflowDecision(inspection.id, 'CLOSE_CASE', 'Case closed by Legal Unit');
        actionMessage = `Case has been closed for inspection ${inspection.code}.`;
      } else if (actionType === 'update_compliance') {
        // Update compliance status
        result = await updateComplianceStatus(inspection.id, inspection.complianceData);
        actionMessage = `Compliance status updated for inspection ${inspection.code}.`;
      } else if (actionType === 'advance_return_path') {
        // Advance return path
        result = await advanceReturnPath(inspection.id);
        actionMessage = `Return path advanced for inspection ${inspection.code}.`;
      } else {
        // Fallback for other actions
        actionMessage = `Workflow action for inspection: ${inspection.code}\nStatus: ${inspection.status}`;
      }
      
      // Show success message
      alert(actionMessage);
      setWorkflowInspection(null);
      
      // Refresh the inspections list to show updated data
      refreshInspections();
      
    } catch (error) {
      console.error('Workflow action error:', error);
      alert(`Error performing workflow action: ${error.message}`);
      setWorkflowInspection(null);
    }
  };

  // Handle compliance modal
  const handleComplianceSubmit = async (complianceData) => {
    try {
      await updateComplianceStatus(complianceModal.inspection.id, complianceData);
      setComplianceModal({ open: false, inspection: null });
      refreshInspections();
      alert('Compliance status updated successfully!');
    } catch (error) {
      console.error('Error updating compliance:', error);
      alert(`Error updating compliance: ${error.message}`);
    }
  };

  // Handle Legal Unit modal
  const handleLegalUnitSubmit = async (actionType, formData) => {
    try {
      let result;
      switch (actionType) {
        case 'send_nov':
          result = await sendNoticeOfViolation(legalUnitModal.inspection.id, formData);
          break;
        case 'send_noo':
          result = await sendNoticeOfOrder(legalUnitModal.inspection.id, formData);
          break;
        case 'close_case':
          result = await closeCase(legalUnitModal.inspection.id, formData);
          break;
        default:
          throw new Error('Invalid action type');
      }
      
      setLegalUnitModal({ open: false, inspection: null });
      refreshInspections();
      alert(`${actionType.replace('_', ' ').toUpperCase()} action completed successfully!`);
    } catch (error) {
      console.error('Error performing Legal Unit action:', error);
      alert(`Error performing action: ${error.message}`);
    }
  };

  // Fetch establishments for the wizard - following EstablishmentList.jsx pattern
  const fetchEstablishments = useCallback(async (searchQuery = '', page = 1, pageSize = 100) => {
    setEstablishmentsLoading(true);
    try {
      // Use the same API call pattern as EstablishmentList.jsx
      const response = await getEstablishments({
        page: page,
        page_size: pageSize,
        ...(searchQuery && searchQuery.length >= 2 && { search: searchQuery }),
      });

      if (response.results) {
        // Transform the data to match the expected format for wizard
        const transformedEstablishments = response.results.map(est => ({
          id: est.id,
          name: est.name,
          address: `${est.street_building || ''}, ${est.barangay || ''}, ${est.city || ''}, ${est.province || ''}, ${est.postal_code || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
          coordinates: `${est.latitude || ''}, ${est.longitude || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
          nature_of_business: est.nature_of_business || 'N/A',
          year_established: est.year_established || 'N/A'
        }));
        setEstablishments(transformedEstablishments);
      } else {
        // Fallback for non-paginated response
        const transformedEstablishments = response.map(est => ({
          id: est.id,
          name: est.name,
          address: `${est.street_building || ''}, ${est.barangay || ''}, ${est.city || ''}, ${est.province || ''}, ${est.postal_code || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
          coordinates: `${est.latitude || ''}, ${est.longitude || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
          nature_of_business: est.nature_of_business || 'N/A',
          year_established: est.year_established || 'N/A'
        }));
        setEstablishments(transformedEstablishments);
      }
    } catch (error) {
      console.error("Error fetching establishments:", error);
      // Fallback to mock data on error
      setEstablishments([
        {
          id: 1,
          name: "ABC Manufacturing Corp.",
          address: "123 Industrial St, San Fernando, La Union",
          coordinates: "16.6164, 120.3162",
          nature_of_business: "Manufacturing",
          year_established: "2015"
        },
        {
          id: 2,
          name: "XYZ Industries Inc.",
          address: "456 Business Ave, Bauang, La Union",
          coordinates: "16.5308, 120.3331",
          nature_of_business: "Industrial Processing",
          year_established: "2018"
        }
      ]);
    } finally {
      setEstablishmentsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  // Create stable callback functions for wizard props
  const handleRefreshEstablishments = useCallback(() => fetchEstablishments(), [fetchEstablishments]);
  const handleSearchEstablishments = useCallback((searchQuery) => fetchEstablishments(searchQuery), [fetchEstablishments]);

  // Fetch user profile to get actual user level
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
          setUserLevel("public");
          setLoading(false);
          return;
        }

        const profile = await getProfile();
        const level = profile.userlevel || "public";

        setUserLevel(level);
        localStorage.setItem("userLevel", level);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        const fallbackLevel = localStorage.getItem("userLevel") || "public";
        setUserLevel(fallbackLevel);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch establishments when component mounts
  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);



  const [laws] = useState([
    { code: "PD-1586", name: "EIA Monitoring" },
    { code: "RA-8749", name: "Air Quality Monitoring" },
    { code: "RA-9275", name: "Water Quality Monitoring" },
    { code: "RA-6969", name: "Toxic Chemicals Monitoring" },
    { code: "RA-9003", name: "Solid Waste Management" }
  ]);

  // Show loading state while fetching user profile
  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel="admin">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
              <span>Loading inspections...</span>
            </div>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  // If showing wizard, render the wizard component (which includes its own layout)
  if (showAdd) {
    return (
      <SimpleInspectionWizard
        onClose={() => setShowAdd(false)}
        onSave={async (formData) => {
          try {
            console.log('Creating inspections:', formData);
            
            const selectedLaw = laws.find(law => law.code === formData.law_code);
            const establishmentCount = formData.establishment_ids.length;
            
            // Create inspection for each selected establishment
            const inspectionPromises = formData.establishment_ids.map(establishmentId => {
              const inspectionData = {
                establishment: establishmentId,
                section: formData.law_code,
                inspection_list: `Inspection for ${selectedLaw?.name || formData.law_code}`,
                applicable_laws: formData.law_code,
                // The backend will handle auto-assignment based on the workflow rules
              };
              return createInspection(inspectionData);
            });
            
            // Create all inspections in parallel
            const createdInspections = await Promise.all(inspectionPromises);
            console.log('Inspections created successfully:', createdInspections);
            
            // Close wizard and refresh list
            setShowAdd(false);
            refreshInspections();
            
            // Show success message
            alert(`Successfully created ${establishmentCount} inspection(s) for ${selectedLaw?.name || formData.law_code}!`);
            
          } catch (error) {
            console.error('Error creating inspections:', error);
            alert(`Error creating inspections: ${error.message}`);
          }
        }}
        userProfile={{ userlevel: userLevel }}
        establishments={establishments}
        establishmentsLoading={establishmentsLoading}
        laws={laws}
        userLevel={userLevel}
        onRefreshEstablishments={handleRefreshEstablishments}
        onSearchEstablishments={handleSearchEstablishments}
      />
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Inspections List */}
          <InspectionsList
            userLevel={userLevel}
            onAdd={() => setShowAdd(true)}
            onView={(inspection) => setViewInspection(inspection)}
            onWorkflow={(inspection, actionType) => setWorkflowInspection({...inspection, actionType})}
            onCompliance={(inspection) => setComplianceModal({ open: true, inspection })}
            onLegalUnit={(inspection) => setLegalUnitModal({ open: true, inspection })}
            refreshTrigger={refreshTrigger}
          />


          {/* View Inspection Modal */}
          {viewInspection && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <ViewInspection
                inspection={viewInspection}
                onClose={() => setViewInspection(null)}
              />
            </div>
          )}

          {/* Simple Workflow Modal */}
          {workflowInspection && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Workflow Action</h3>
                  <button
                    onClick={() => setWorkflowInspection(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Inspection:</strong> {workflowInspection.code}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Current Status:</strong> {workflowInspection.status}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Establishment:</strong> {workflowInspection.establishment_name}
                  </p>
                  {workflowInspection.status === 'DIVISION_CREATED' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Action:</strong> This will move the inspection to "My Inspections" tab with SECTION_INSPECTING status.
                      </p>
                    </div>
                  )}
                  {workflowInspection.status === 'SECTION_INSPECTING' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Action:</strong> This will complete the inspection or forward it to the next stage.
                      </p>
                    </div>
                  )}
                  {workflowInspection.status === 'UNIT_REVIEW' && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Action:</strong> This will move the inspection to "My Inspections" tab with UNIT_INSPECTING status.
                      </p>
                    </div>
                  )}
                  {workflowInspection.status === 'UNIT_INSPECTING' && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-md">
                      <p className="text-sm text-indigo-800">
                        <strong>Action:</strong> This will complete the inspection or forward it to Monitoring Personnel.
                      </p>
                    </div>
                  )}
                  {workflowInspection.status === 'MONITORING_INSPECTION' && (
                    <div className="mt-3 p-3 bg-cyan-50 rounded-md">
                      <p className="text-sm text-cyan-800">
                        <strong>Action:</strong> This will complete the inspection and initiate the return path based on compliance status.
                      </p>
                    </div>
                  )}
                  {workflowInspection.status === 'LEGAL_REVIEW' && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Action:</strong> This will send notices to the establishment or close the case.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setWorkflowInspection(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleWorkflowAction(workflowInspection, workflowInspection.actionType)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Execute Action
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Modal */}
          <ComplianceModal
            open={complianceModal.open}
            inspection={complianceModal.inspection}
            onClose={() => setComplianceModal({ open: false, inspection: null })}
            onSubmit={handleComplianceSubmit}
          />

          {/* Legal Unit Modal */}
          <LegalUnitModal
            open={legalUnitModal.open}
            inspection={legalUnitModal.inspection}
            onClose={() => setLegalUnitModal({ open: false, inspection: null })}
            onSubmit={handleLegalUnitSubmit}
          />

                </div>
        </LayoutWithSidebar>
      <Footer />
            </>
  );
}