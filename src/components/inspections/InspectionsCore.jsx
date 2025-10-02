import { useState, useEffect, useCallback } from "react";
import InspectionList from "./InspectionList";
import InspectionWizard from "./InspectionWizard";
import ViewInspection from "./ViewInspection";
import InspectionDisplay from "./InspectionDisplay";
import InspectionWorkflow from "./InspectionWorkflow";
import WorkflowDecisionModal from "./WorkflowDecisionModal";
import WorkflowHistoryModal from "./WorkflowHistoryModal";
import {
  getEstablishments,
  getInspections,
  searchInspections,
  createInspection,
} from "../../services/api";

// Custom hook for API calls with error handling
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, successCallback) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      if (successCallback) successCallback(result);
      return result;
    } catch (err) {
      console.error("API call failed:", err);
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, callApi, setError };
};

// Custom hook for inspections data
const useInspectionsData = (pageSize = 10) => {
  const [inspections, setInspections] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
  });

  const { loading, error, callApi } = useApi();

  const fetchEstablishments = useCallback(async () => {
    return callApi(
      async () => {
        const response = await getEstablishments({ page: 1, page_size: 10000 });
        const data = response.results || response;
        if (!Array.isArray(data)) {
          console.warn(
            "Expected array from getEstablishments, got:",
            typeof data
          );
          return [];
        }
        return data.map((est) => ({
          id: est.id,
          name: est.name || "Unknown",
          natureOfBusiness:
            est.nature_of_business || est.natureOfBusiness || "",
          yearEstablished: est.year_established || est.yearEstablished || "",
          address: {
            province: est.province || "",
            city: est.city || "",
            barangay: est.barangay || "",
            street: est.street_building || est.street || "",
            postalCode: est.postal_code || est.postalCode || "",
          },
          coordinates: {
            latitude: est.latitude || null,
            longitude: est.longitude || null,
          },
          // Add fallback fields for direct access
          street_building: est.street_building || est.street || "",
          nature_of_business:
            est.nature_of_business || est.natureOfBusiness || "",
          year_established: est.year_established || est.yearEstablished || "",
          postal_code: est.postal_code || est.postalCode || "",
        }));
      },
      (formatted) => setEstablishments(formatted)
    );
  }, [callApi]);

  const fetchInspections = useCallback(
    async (page = 1, search = "", customPageSize = null) => {
      return callApi(async () => {
        const currentPageSize = customPageSize || pagination.pageSize;
        let data;

        if (search?.trim()) {
          data = await searchInspections(search, page, currentPageSize);
        } else {
          data = await getInspections({ page, page_size: currentPageSize });
        }

        if (!data || !data.results) {
          console.warn("Invalid data structure from API:", data);
          setInspections([]);
          setPagination((prev) => ({
            ...prev,
            totalCount: 0,
            totalPages: 0,
            pageSize: currentPageSize,
          }));
          return [];
        }

        const mapped = data.results.map((d) => ({
          id: d.code || `${d.id}` || `temp-${Date.now()}-${Math.random()}`,
          establishmentId: d.establishment,
          section: d.section || "",
          status: d.status || "PENDING",
          can_act: Boolean(d.can_act),
          current_assignee_name: d.current_assignee_name || "",
          workflow_comments: d.workflow_comments || "",
          assigned_legal_unit_name: d.assigned_legal_unit_name || "",
          assigned_division_head_name: d.assigned_division_head_name || "",
          assigned_section_chief_name: d.assigned_section_chief_name || "",
          assigned_unit_head_name: d.assigned_unit_head_name || "",
          assigned_monitor_name: d.assigned_monitor_name || "",
          billing_record: d.billing_record,
          compliance_call: d.compliance_call,
          inspection_list: d.inspection_list,
          applicable_laws: d.applicable_laws || [],
          inspection_notes: d.inspection_notes || "",
          establishment_detail: d.establishment_detail,
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
        }));

        setInspections(mapped);
        setPagination((prev) => ({
          ...prev,
          page: data.page || page,
          pageSize: currentPageSize,
          totalCount: data.count || 0,
          totalPages:
            data.total_pages || Math.ceil((data.count || 0) / currentPageSize),
        }));

        return mapped;
      });
    },
    [callApi, setPagination, pagination.pageSize]
  );

  return {
    inspections,
    establishments,
    pagination,
    loading,
    error,
    fetchEstablishments,
    fetchInspections,
    setPagination,
    setInspections,
  };
};

export default function InspectionsCore({
  canCreate = false,
  userLevel = "public",
  userProfile = null,
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [viewInspection, setViewInspection] = useState(null);
  const [workflowInspection, setWorkflowInspection] = useState(null);
  const [currentFormInspection, setCurrentFormInspection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialized, setInitialized] = useState(false);
  
  // Workflow modal states
  const [workflowDecisionModal, setWorkflowDecisionModal] = useState({ isOpen: false, inspection: null });
  const [workflowHistoryModal, setWorkflowHistoryModal] = useState({ isOpen: false, inspection: null });

  const {
    inspections,
    establishments,
    pagination,
    loading,
    error,
    fetchEstablishments,
    fetchInspections,
    setPagination,
    setInspections,
  } = useInspectionsData();

  // Debug user permissions
  useEffect(() => {
    console.log("User level:", userLevel);
    console.log("Can create:", canCreate);
    console.log("User profile:", userProfile);
  }, [userLevel, canCreate, userProfile]);

  // Initial data fetch - ONLY ONCE on component mount
  useEffect(() => {
    if (initialized) return;

    const initializeData = async () => {
      try {
        // Fetch establishments first, then inspections
        await fetchEstablishments();
        await fetchInspections(1);
        setInitialized(true);
      } catch (err) {
        console.error("Failed to initialize data:", err);
      }
    };

    initializeData();
  }, [initialized, fetchEstablishments, fetchInspections]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === pagination.page) return;
      fetchInspections(newPage, searchQuery);
    },
    [fetchInspections, searchQuery, pagination.page]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      setPagination((prev) => ({
        ...prev,
        pageSize: newPageSize,
        page: 1, // Reset to first page when changing page size
      }));
      fetchInspections(1, searchQuery); // Fetch with new page size
    },
    [setPagination, fetchInspections, searchQuery]
  );

  const handleSearch = useCallback(
    (query) => {
      if (query === searchQuery) return;
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchInspections(1, query);
    },
    [fetchInspections, setPagination, searchQuery]
  );

  const getLastInspectionLaw = useCallback(
    (establishmentId) => {
      const list = inspections
        .filter((i) => i.establishmentId === establishmentId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list.length > 0 ? list[0].section : null;
    },
    [inspections]
  );

  const handleSaveInspection = useCallback(
    async (newInspections) => {
      try {
        console.log("Inspections created successfully:", newInspections);

        // Refresh the data to show the new inspections
        await fetchInspections(1, searchQuery);
        setShowWizard(false);

        // Show success message
        alert(`Successfully created ${newInspections.length} inspection(s)`);
      } catch (err) {
        console.error("Failed to save inspection:", err);
        alert(`Failed to create inspections: ${err.message}`);
      }
    },
    [fetchInspections, searchQuery]
  );

  const inspectionsWithDetails = useCallback(() => {
    return inspections.map((i) => {
      // Use establishment_detail from API response if available
      if (i.establishment_detail) {
        return {
          ...i,
          establishments: [i.establishment_detail],
          establishment: i.establishment_detail,
        };
      }

      // Fallback to establishments list
      const establishment = establishments.find(
        (e) => e.id === i.establishmentId
      );
      return {
        ...i,
        establishments: establishment ? [establishment] : [],
        establishment: establishment || {},
      };
    });
  }, [inspections, establishments]);

  const handleOpenForm = useCallback((inspection) => {
    setCurrentFormInspection(inspection);
    setViewInspection(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setCurrentFormInspection(null);
  }, []);

  const handleWorkflowOpen = useCallback((inspection) => {
    setWorkflowInspection(inspection);
  }, []);

  const handleWorkflowClose = useCallback(() => {
    setWorkflowInspection(null);
    // Refresh data after workflow action
    fetchInspections(pagination.page, searchQuery);
  }, [fetchInspections, pagination.page, searchQuery]);

  const handleWorkflowUpdate = useCallback(
    (updatedInspection) => {
      setInspections((prev) =>
        prev.map((inspection) =>
          inspection.id === updatedInspection.code ||
          inspection.id === updatedInspection.id
            ? { ...inspection, ...updatedInspection }
            : inspection
        )
      );
    },
    [setInspections]
  );

  // Workflow modal handlers
  const handleOpenWorkflowDecision = useCallback((inspection) => {
    setWorkflowDecisionModal({ isOpen: true, inspection });
  }, []);

  const handleCloseWorkflowDecision = useCallback(() => {
    setWorkflowDecisionModal({ isOpen: false, inspection: null });
  }, []);

  const handleWorkflowDecisionMade = useCallback((updatedInspection) => {
    // Update the inspection in the list
    setInspections(prev => 
      prev.map(inspection => 
        inspection.id === updatedInspection.id ? updatedInspection : inspection
      )
    );
    handleCloseWorkflowDecision();
  }, [setInspections]);

  const handleOpenWorkflowHistory = useCallback((inspection) => {
    setWorkflowHistoryModal({ isOpen: true, inspection });
  }, []);

  const handleCloseWorkflowHistory = useCallback(() => {
    setWorkflowHistoryModal({ isOpen: false, inspection: null });
  }, []);

  const handleViewInspection = useCallback((inspection) => {
    setViewInspection(inspection);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewInspection(null);
  }, []);

  return (
    <div className="h-full">
      {error && (
        <div className="p-4 mb-4 border border-red-200 rounded bg-red-50">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 mt-2 text-sm bg-red-100 border border-red-300 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {showWizard ? (
        <InspectionWizard
          establishments={establishments}
          onCancel={() => setShowWizard(false)}
          onSave={handleSaveInspection}
          getLastInspectionLaw={getLastInspectionLaw}
          existingInspections={inspections}
          userLevel={userLevel}
        />
      ) : (
        <InspectionList
          inspections={inspectionsWithDetails()}
          onAdd={canCreate ? () => setShowWizard(true) : undefined}
          onView={handleViewInspection}
          onWorkflowOpen={handleWorkflowOpen}
          onWorkflowDecision={handleOpenWorkflowDecision}
          onWorkflowHistory={handleOpenWorkflowHistory}
          userLevel={userLevel}
          loading={loading}
          canCreate={canCreate}
          pagination={{
            ...pagination,
            onPageSizeChange: handlePageSizeChange,
          }}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          userProfile={userProfile}
        />
      )}

      {viewInspection && (
        <ModalOverlay>
          <ViewInspection
            inspection={viewInspection}
            onClose={handleCloseView}
            onOpenForm={handleOpenForm}
          />
        </ModalOverlay>
      )}

      {currentFormInspection && (
        <ModalOverlay>
          <div className="w-full h-full p-1 overflow-hidden bg-white rounded-lg">
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
        </ModalOverlay>
      )}

      {workflowInspection && (
        <InspectionWorkflow
          inspection={workflowInspection}
          userLevel={userLevel}
          onUpdate={handleWorkflowUpdate}
          onClose={handleWorkflowClose}
          userProfile={userProfile}
        />
      )}

      {/* Workflow Decision Modal */}
      <WorkflowDecisionModal
        inspection={workflowDecisionModal.inspection}
        isOpen={workflowDecisionModal.isOpen}
        onClose={handleCloseWorkflowDecision}
        onDecisionMade={handleWorkflowDecisionMade}
        currentUser={userProfile}
      />

      {/* Workflow History Modal */}
      <WorkflowHistoryModal
        inspection={workflowHistoryModal.inspection}
        isOpen={workflowHistoryModal.isOpen}
        onClose={handleCloseWorkflowHistory}
      />
    </div>
  );
}

// Reusable modal overlay component
const ModalOverlay = ({ children }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
    {children}
  </div>
);
