import { useState, useEffect, useCallback } from "react";
import InspectionList from "./InspectionList";
import InspectionWizard from "./InspectionWizard";
import EditInspection from "./EditInspection";
import ViewInspection from "./ViewInspection";
import InspectionDisplay from "./InspectionDisplay";
import InspectionWorkflow from "./InspectionWorkflow";
import {
  getEstablishments,
  getInspections,
  searchInspections,
} from "../../services/api";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InspectionsCore({ canCreate = false, userLevel }) {
  const [showWizard, setShowWizard] = useState(false);
  const [editInspection, setEditInspection] = useState(null);
  const [viewInspection, setViewInspection] = useState(null);
  const [workflowInspection, setWorkflowInspection] = useState(null);
  const [currentFormInspection, setCurrentFormInspection] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce

  // Fetch establishments (unchanged)
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

  // Fetch inspections with pagination and search
  const fetchInspections = useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      try {
        let data;
        if (search) {
          data = await searchInspections(search, page, pagination.pageSize);
        } else {
          data = await getInspections({
            page,
            page_size: pagination.pageSize,
          });
        }

        // Map backend to frontend expected model with workflow data
        const mapped = data.results.map((d) => ({
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
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));

        setInspections(mapped);
        setPagination((prev) => ({
          ...prev,
          page: data.page || page,
          totalCount: data.count || 0,
          totalPages: data.total_pages || 0,
        }));
      } catch (e) {
        console.error("Failed to load inspections", e);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize]
  );

  // Fetch inspections when page changes or search query debounces
  useEffect(() => {
    fetchInspections(1, debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchInspections]);

  const handlePageChange = (newPage) => {
    fetchInspections(newPage, debouncedSearchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  // IDs are provided by backend (code), no local generation needed

  const getLastInspectionLaw = (establishmentId) => {
    const list = inspections
      .filter((i) => i.establishmentId === establishmentId)
      .sort((a, b) => b.id.localeCompare(a.id));
    return list.length > 0 ? list[0].section : null;
  };

  const handleSaveInspection = (arr) => {
    // Refresh the list after creating new inspections
    fetchInspections(pagination.page, debouncedSearchQuery);
    setShowWizard(false);
  };

  const handleUpdateInspection = (id, section) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === id ? { ...i, section } : i))
    );
  };

  const inspectionsWithDetails = inspections.map((i) => {
    const establishment = establishments.find(
      (e) => e.id === i.establishmentId
    );
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
    fetchInspections(pagination.page, debouncedSearchQuery); // Refresh the inspections list
  };

  const handleWorkflowUpdate = (updatedInspection) => {
    setInspections((prev) =>
      prev.map((inspection) =>
        inspection.id === updatedInspection.code ||
        inspection.id === updatedInspection.id
          ? { ...inspection, ...updatedInspection }
          : inspection
      )
    );
  };

  if (loading && inspections.length === 0) {
    return <div className="p-4">Loading inspections...</div>;
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
          loading={loading}
          // Pagination props
          pagination={pagination}
          onPageChange={handlePageChange}
          // Search props
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      )}

      {/* Existing modals remain the same */}
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
