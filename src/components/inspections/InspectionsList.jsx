import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Building,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  Scale,
  Send,
  Play,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User
} from "lucide-react";
import {
  getProfile, 
  getInspections, 
  deleteInspection
} from "../../services/api";
import StatusBadge from "./StatusBadge";
import InspectionTabs from "./InspectionTabs";
import InspectionActions from "./InspectionActions";
import { roleTabs, tabDisplayNames, canUserSeeInspection, shouldShowInTab, canUserPerformActions } from "../../constants/inspectionConstants";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";
import PaginationControls, { useLocalStoragePagination, useLocalStorageTab } from "../PaginationControls";
import { useInspectionActions } from "../../hooks/useInspectionActions";
import { useOptimizedInspections } from "../../hooks/useOptimizedInspections";
import MonitoringPersonnelModal from "./modals/MonitoringPersonnelModal";

// Debounce hook
const useDebounce = (value, delay) => {
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
};

// Helper function to get empty state message based on tab and user level
const getEmptyStateMessage = (activeTab, userLevel) => {
  const emptyStateMessages = {
    'Division Chief': {
      all_inspections: 'No inspections available. Create a new inspection to get started.',
      review: 'All caught up! No inspections pending your review.'
    },
    'Section Chief': {
      received: 'No new assignments. Check back later or view forwarded inspections.',
      my_inspections: 'No inspections currently in progress. Start by assigning yourself to an inspection.',
      forwarded: 'No inspections forwarded to other personnel.',
      review: 'All caught up! No inspections pending your review.',
      compliance: 'No completed inspections to display.'
    },
    'Unit Head': {
      received: 'No new assignments from Section Chief.',
      my_inspections: 'No inspections currently in progress.',
      forwarded: 'No inspections forwarded to Monitoring Personnel.',
      review: 'All caught up! No inspections pending your review.',
      compliance: 'No completed inspections to display.'
    },
    'Monitoring Personnel': {
      assigned: 'No new assignments waiting to start.',
      in_progress: 'No inspections currently in progress.',
      completed: 'No completed inspections to display.'
    },
    'Legal Unit': {
      legal_review: 'No cases assigned for legal review.',
      nov_sent: 'No Notice of Violation (NOV) cases.',
      noo_sent: 'No Notice of Order (NOO) cases.'
    }
  };

  return emptyStateMessages[userLevel]?.[activeTab] || 'No inspections found.';
};

// Helper function to create action-specific dialog content
const getActionDialogContent = (action, inspection, userLevel, pendingForwardAction) => {
  const establishmentNames = inspection?.establishments_detail?.length > 0 
    ? inspection.establishments_detail.map(est => est.name).join(', ')
    : 'No establishments';

  const actionConfig = {
    inspect: {
      title: 'Confirm Inspection Assignment',
      confirmColor: 'blue',
      confirmText: 'Confirm',
      message: 'Are you sure you want to assign this inspection to yourself and open the form?'
    },
    forward: {
      title: 'Confirm Forward Action',
      confirmColor: 'sky',
      confirmText: 'Confirm Forward',
      message: () => {
        const selectedPersonnel = pendingForwardAction?.selectedPersonnelName;
        return (
          <div className="space-y-3">
            <p>Are you sure you want to forward this inspection?</p>
            {selectedPersonnel && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                <p className="text-sm font-medium text-sky-900">
                  Forward to: {selectedPersonnel}
                </p>
              </div>
            )}
          </div>
        );
      }
    },
    forward_to_legal: {
      icon: <Scale className="w-5 h-5 text-orange-600" />,
      headerColor: 'orange',
      title: 'Forward to Legal Unit',
      confirmColor: 'orange',
      confirmText: 'Forward to Legal',
      message: (
        <div className="space-y-4">
          {/* Inspection Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Inspection Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Code:</span>
                <span className="text-gray-900">{inspection?.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{establishmentNames}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Status: {inspection?.current_status}</span>
              </div>
            </div>
          </div>

          {/* Legal Review Process */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Legal Review Process</span>
            </div>
            <div className="space-y-2 text-sm text-orange-700">
              <p>• This inspection will be forwarded to the Legal Unit for review</p>
              <p>• Legal Unit will assess compliance and determine next steps</p>
              <p>• They may issue NOV (Notice of Violation) or NOO (Notice of Order)</p>
              <p>• The case will be marked for legal review in the system</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-800">Important Note</span>
            </div>
            <p className="text-sm text-amber-700">
              Legal review is a critical step in the regulatory process. Ensure all documentation is complete before forwarding.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to forward this inspection to the Legal Unit?</p>
          </div>
        </div>
      )
    },
    close: {
      icon: userLevel === 'Legal Unit' || userLevel === 'Division Chief' 
        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
        : <CheckCircle className="w-5 h-5 text-green-600" />,
      headerColor: 'green',
      title: userLevel === 'Legal Unit' || userLevel === 'Division Chief' 
        ? 'Mark as Compliant'
        : 'Close Inspection',
      confirmColor: 'green',
      confirmText: userLevel === 'Legal Unit' || userLevel === 'Division Chief' 
        ? 'Mark as Compliant'
        : 'Close Inspection',
      message: (
        <div className="space-y-4">
          {/* Inspection Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Inspection Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Code:</span>
                <span className="text-gray-900">{inspection?.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{establishmentNames}</span>
              </div>
            </div>
          </div>

          {/* Completion Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Final Status</span>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              {userLevel === 'Legal Unit' || userLevel === 'Division Chief' ? (
                <>
                  <p>• This inspection will be marked as <strong>Compliant</strong></p>
                  <p>• The establishment will be considered in full compliance</p>
                  <p>• The case will be closed and archived</p>
                  <p>• A compliance certificate may be issued</p>
                </>
              ) : (
                <>
                  <p>• This inspection will be closed</p>
                  <p>• The case will be marked as completed</p>
                  <p>• No further action will be required</p>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to {userLevel === 'Legal Unit' || userLevel === 'Division Chief' ? 'mark this as compliant' : 'close this inspection'}?</p>
          </div>
        </div>
      )
    },
    assign_to_me: {
      icon: <User className="w-5 h-5 text-indigo-600" />,
      headerColor: 'indigo',
      title: 'Assign Inspection to Me',
      confirmColor: 'indigo',
      confirmText: 'Assign to Me',
      message: (
        <div className="space-y-4">
          {/* Inspection Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Inspection Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Code:</span>
                <span className="text-gray-900">{inspection?.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{establishmentNames}</span>
              </div>
            </div>
          </div>

          {/* Assignment Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-800">Assignment Details</span>
            </div>
            <div className="space-y-2 text-sm text-indigo-700">
              <p>• This inspection will be assigned to you</p>
              <p>• You will become responsible for this inspection</p>
              <p>• You will have access to edit and manage the inspection</p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to assign this inspection to yourself?</p>
          </div>
        </div>
      )
    },
    complete: {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      headerColor: 'green',
      title: 'Complete Inspection',
      confirmColor: 'green',
      confirmText: 'Complete',
      message: (
        <div className="space-y-4">
          {/* Inspection Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Inspection Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Code:</span>
                <span className="text-gray-900">{inspection?.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{establishmentNames}</span>
              </div>
            </div>
          </div>

          {/* Completion Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Completion Process</span>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <p>• This inspection will be marked as completed</p>
              <p>• All inspection data will be finalized</p>
              <p>• The case will move to the next stage in the workflow</p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to complete this inspection?</p>
          </div>
        </div>
      )
    }
  };

  // Default fallback for unknown actions
  const defaultConfig = {
    icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
    headerColor: 'sky',
    title: 'Confirm Action',
    confirmColor: 'sky',
    confirmText: 'Confirm',
    message: (
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800">Inspection Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Code:</span>
              <span className="text-gray-900">{inspection?.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{establishmentNames}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Action:</span>
              <span className="text-gray-900">{action?.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Are you sure you want to perform this action?</p>
        </div>
      </div>
    )
  };

  return actionConfig[action] || defaultConfig;
};

export default function InspectionsList({ onAdd, refreshTrigger, userLevel = 'Division Chief' }) {
  const notifications = useNotifications();
  const [currentUser, setCurrentUser] = useState(null);

  // 🎯 Search highlighting
  const location = useLocation();
  const [highlightedInspId, setHighlightedInspId] = useState(null);
  const highlightedRowRef = useRef(null);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [lawFilter, setLawFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showOnlyMyAssignments, setShowOnlyMyAssignments] = useState(false);
  
  // 🔄 Action loading state
  const [actionLoading, setActionLoading] = useState(false);
  
  // 🔄 Monitoring personnel selection state
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [pendingForwardAction, setPendingForwardAction] = useState(null);

  // 📑 Tab state for role-based tabs with localStorage persistence
  const { loadFromStorage: loadTabFromStorage, saveToStorage: saveTabToStorage } = useLocalStorageTab("inspections_list");
  const [activeTab, setActiveTab] = useState(() => {
    const availableTabs = roleTabs[userLevel] || ['all'];
    const savedTab = loadTabFromStorage();
    // Check if saved tab is still available for current user level
    if (savedTab && availableTabs.includes(savedTab)) {
      return savedTab;
    }
    return availableTabs[0];
  });

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("inspections_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // 🗑️ Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, inspection: null });

  // ✅ Bulk select
  const [selectedInspections, setSelectedInspections] = useState([]);

  // Handle tab change with localStorage persistence
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    saveTabToStorage(newTab);
    // Reset to page 1 when changing tabs
    setCurrentPage(1);
  };


  // Use optimized inspections hook
  const { 
    inspections, 
    tabCounts, 
    paginationMeta,
    loading, 
    error, 
    fetchInspections, 
    fetchTabCounts, 
    refreshData 
  } = useOptimizedInspections(userLevel, currentUser);

  const fetchAllInspections = useCallback(async () => {
    if (!currentUser) return;

    const params = {
      page: currentPage,
      page_size: pageSize,
      tab: activeTab,
    };

    // Add search parameter if provided
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }

    // Add law filter (server-side)
    if (lawFilter.length > 0) {
      params.law = lawFilter.join(",");
    }

    // Add date filters (server-side)
    if (dateFrom) {
      params.date_from = dateFrom;
    }
    if (dateTo) {
      params.date_to = dateTo;
    }

    // Add assignment filter (server-side)
    if (showOnlyMyAssignments) {
      params.assigned_to_me = 'true';
    }

    // Add sorting parameters (server-side)
    if (sortConfig.key) {
      params.order_by = sortConfig.key;
      params.order_direction = sortConfig.direction;
    }

    await fetchInspections(params);
  }, [
    currentPage, 
    pageSize, 
    debouncedSearchQuery, 
    lawFilter,
    dateFrom,
    dateTo,
    showOnlyMyAssignments,
    sortConfig.key,
    sortConfig.direction,
    activeTab, 
    currentUser, 
    fetchInspections
  ]);

  // All filtering and sorting is now done server-side
  // Use inspections directly from API
  const filteredInspections = inspections;

  // Get unique laws from current inspections
  const availableLaws = useMemo(() => {
    const lawSet = new Set();
    inspections.forEach(inspection => {
      if (inspection.law) {
        lawSet.add(inspection.law);
      }
    });
    return Array.from(lawSet).sort();
  }, [inspections]);

  // Tab counts are now handled by the optimized hook

  // Use the inspection actions hook
  const { handleAction, isActionLoading } = useInspectionActions(fetchAllInspections);

  // Action confirmation states
  const [actionConfirmation, setActionConfirmation] = useState({ 
    open: false, 
    inspection: null, 
    action: null 
  });


  // Handle action clicks with simple confirmation
  const handleActionClick = useCallback(async (action, inspectionId) => {
    console.log('handleActionClick called with:', { inspectionId, action });
    const inspection = inspections.find(i => i.id === inspectionId);
    if (!inspection) {
      console.error('Inspection not found:', inspectionId);
      return;
    }

    console.log('Found inspection:', inspection.code, 'for action:', action);
    
    // 5-Button Strategy Implementation
    
    // 1. "Inspect" button - Start new inspection (changes status to IN_PROGRESS)
    if (action === 'inspect') {
      // Show confirmation dialog for Section Chief, Unit Head, and Monitoring Personnel
      if (userLevel === 'Section Chief' || userLevel === 'Unit Head' || userLevel === 'Monitoring Personnel') {
      setActionConfirmation({ 
        open: true, 
        inspection, 
        action 
      });
      return;
      } else {
        // For other user levels, directly execute the action
        try {
          await handleAction(action, inspectionId);
          notifications.success(
            `Inspection ${inspection.code} assigned to you`, 
            { title: 'Inspection Assigned' }
          );
          // Navigate to inspection form page
          window.location.href = `/inspections/${inspectionId}/form`;
        } catch (error) {
          console.error('Error executing inspect action:', error);
          notifications.error(
            `Error assigning inspection: ${error.message}`, 
            { title: 'Error' }
          );
        }
        return;
      }
    }
    
    // 2. "Continue" button - Resume editing (no status change, just open form)
    if (action === 'continue') {
      // Navigate to inspection form page to resume
      window.location.href = `/inspections/${inspectionId}/form`;
      return;
    }
    
    // 3. "Review" button - View completed work (navigate to review page)
    if (action === 'review') {
      try {
        // First call the backend review action to verify access
        await handleAction(action, inspectionId);
        // Then navigate to inspection review page
        window.location.href = `/inspections/${inspectionId}/review`;
        return;
      } catch (error) {
        console.error('Error accessing review:', error);
        notifications.error(
          `Error accessing review: ${error.message}`, 
          { title: 'Access Denied' }
        );
        return;
      }
    }
    
    // 4. "Forward" button - Delegate/send up (show monitoring modal or confirmation dialog)
    if (action === 'forward') {
      // Check if this requires monitoring personnel selection
      const isCombinedSection = currentUser?.section === 'PD-1586,RA-8749,RA-9275';
      
      if (userLevel === 'Section Chief' && isCombinedSection) {
        // Combined section forwards to Unit - show confirmation directly
        setActionConfirmation({ 
          open: true, 
          inspection, 
          action 
        });
      } else if (userLevel === 'Section Chief' || userLevel === 'Unit Head') {
        // Individual sections and Unit Head - show monitoring modal first
        setPendingForwardAction({ inspection, action, forwardData: { target: 'monitoring' } });
        setShowMonitoringModal(true);
      }
      return;
    }
    
    // 5. "Send to Legal" / "Close" buttons - Final actions
    if (action === 'send_to_legal' || action === 'close') {
      // Special case: In "reviewed" tab with DIVISION_REVIEWED status, navigate to review page
      if (activeTab === 'reviewed' && inspection.current_status === 'DIVISION_REVIEWED' && userLevel === 'Division Chief') {
        window.location.href = `/inspections/${inspectionId}/review`;
        return;
      }
      
      // Default: show confirmation dialog
      setActionConfirmation({ 
        open: true, 
        inspection, 
        action 
      });
      return;
    }
    
    // Legacy actions for backward compatibility
    if (action === 'start') {
      try {
        await handleAction('start', inspectionId);
        notifications.success(
          `Inspection ${inspection.code} started successfully`, 
          { title: 'Inspection Started' }
        );
        window.location.href = `/inspections/${inspectionId}/form`;
        return;
      } catch (error) {
        console.error('Error starting inspection:', error);
        notifications.error(
          `Error starting inspection: ${error.message}`, 
          { title: 'Error' }
        );
        return;
      }
    }
    
    // For other actions, show simple confirmation
    setActionConfirmation({ 
      open: true, 
      inspection, 
      action 
    });
  }, [inspections, handleAction, notifications, userLevel]);


  // Execute confirmed action
  const executeAction = useCallback(async () => {
    const { inspection, action } = actionConfirmation;
    if (!inspection || !action) return;

    setActionLoading(true);

    try {
      // For inspect action by Section Chief, Unit Head, or Monitoring Personnel, execute the action and then open the form
      if (action === 'inspect' && (userLevel === 'Section Chief' || userLevel === 'Unit Head' || userLevel === 'Monitoring Personnel')) {
        await handleAction(action, inspection.id);
        notifications.success(
          `Inspection ${inspection.code} assigned to you`, 
          { title: 'Inspection Assigned' }
        );
        
        // Close confirmation dialog
        setActionConfirmation({ open: false, inspection: null, action: null });
        
        // Navigate to inspection form page
        window.location.href = `/inspections/${inspection.id}/form`;
        return;
      }
      
      // For forward action, determine target based on user level and section type
      if (action === 'forward') {
        let forwardData = {
          remarks: 'Forwarded to next level'
        };
        
        // Check if we already have monitoring personnel selected
        if (pendingForwardAction?.forwardData?.assigned_monitoring_id) {
          // Use the pre-selected monitoring personnel
          forwardData = pendingForwardAction.forwardData;
          
          await handleAction(action, inspection.id, forwardData);
          notifications.success(
            `Inspection ${inspection.code} forwarded to selected Monitoring Personnel`, 
            { title: 'Inspection Forwarded' }
          );
          
          // Reset states
          setPendingForwardAction(null);
          setActionConfirmation({ open: false, inspection: null, action: null });
          return;
        }
        
        // For combined sections that forward to Unit Head (no monitoring selection)
        if (userLevel === 'Section Chief') {
          const isCombinedSection = currentUser?.section === 'PD-1586,RA-8749,RA-9275';
          
          if (isCombinedSection) {
            forwardData.target = 'unit';
            await handleAction(action, inspection.id, forwardData);
            notifications.success(
              `Inspection ${inspection.code} forwarded to Unit Head`, 
              { title: 'Inspection Forwarded' }
            );
            setActionConfirmation({ open: false, inspection: null, action: null });
            return;
          }
        }
      }
      
      // For other actions, just execute normally
      await handleAction(action, inspection.id);
      setActionConfirmation({ open: false, inspection: null, action: null });
    } catch {
      // Error is already handled in the hook
    } finally {
      setActionLoading(false);
    }
  }, [actionConfirmation, handleAction, userLevel, notifications, currentUser]);

  // Handle monitoring personnel selection
  const handleMonitoringPersonnelSelect = useCallback(async (monitoringId, selectedPerson) => {
    if (!pendingForwardAction) return;

    // Get the selected personnel name
    const selectedPersonnelName = selectedPerson ? 
      `${selectedPerson.first_name} ${selectedPerson.last_name}` : 
      'Selected Personnel';

    // Close monitoring modal
    setShowMonitoringModal(false);
    
    // Add monitoring ID and personnel name to pending action
    setPendingForwardAction({
      ...pendingForwardAction,
      forwardData: {
        ...pendingForwardAction.forwardData,
        assigned_monitoring_id: monitoringId
      },
      selectedPersonnelName: selectedPersonnelName
    });
    
    // Show confirmation dialog
    setActionConfirmation({
      open: true,
      inspection: pendingForwardAction.inspection,
      action: 'forward'
    });
  }, [pendingForwardAction]);

  // Handle monitoring modal close
  const handleMonitoringModalClose = useCallback(() => {
    setShowMonitoringModal(false);
    setPendingForwardAction(null);
  }, []);

  // Delete inspection function
  const handleDeleteInspection = useCallback(async (inspection) => {
    try {
      await deleteInspection(inspection.id);
      notifications.success(`Inspection ${inspection.code} deleted successfully`, { title: 'Success' });
      fetchAllInspections();
      setDeleteConfirmation({ open: false, inspection: null });
    } catch (error) {
      console.error('Error deleting inspection:', error);
      notifications.error(`Error deleting inspection: ${error.message}`, { title: 'Error' });
    }
  }, [fetchAllInspections, notifications]);

  // Fetch user profile (only once on mount)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        console.log('User profile fetched:', profile);
        console.log('User level:', profile.userlevel);
        setCurrentUser(profile);
        
        // Set default tab based on user level
        const availableTabs = roleTabs[userLevel] || ['all'];
        const tabs = availableTabs.map(tab => ({
          id: tab,
          label: tabDisplayNames[tab] || tab,
          count: 0
        }));
        if (tabs.length > 0 && !activeTab) {
          setActiveTab(tabs[0].id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on mount, not on every tab change

  // Fetch inspections when dependencies change
  useEffect(() => {
    if (currentUser) {
      fetchAllInspections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage, 
    pageSize, 
    activeTab, 
    debouncedSearchQuery,
    lawFilter.join(','), // Convert array to string for proper comparison
    dateFrom,
    dateTo,
    showOnlyMyAssignments,
    sortConfig.key,
    sortConfig.direction,
    refreshTrigger,
    currentUser
    // Note: fetchAllInspections is intentionally excluded to prevent infinite loop
  ]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  // Add this useEffect to handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
        setFiltersOpen(false);
      }
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown")) {
        setSortDropdownOpen(false);
      }
    }

    if (filtersOpen || sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen, sortDropdownOpen]);

  // Handle highlighting from search navigation
  useEffect(() => {
    console.log('InspectionsList - Location state:', location.state);
    if (location.state?.highlightId && location.state?.entityType === 'inspection') {
      console.log('Highlighting inspection:', location.state.highlightId);
      setHighlightedInspId(location.state.highlightId);
      
      // Scroll to highlighted row after render
      setTimeout(() => {
        if (highlightedRowRef.current) {
          console.log('Scrolling to highlighted inspection');
          highlightedRowRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        } else {
          console.log('Highlighted row ref not found yet');
        }
      }, 500);
    }
  }, [location.state]);

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Sort options for dropdown
  const sortFields = [
    { key: "code", label: "Inspection Code" },
    { key: "created_at", label: "Created Date" },
  ];


  // ✅ Pagination (using server-side pagination)
  const totalPages = Math.ceil((paginationMeta?.count || filteredInspections.length) / pageSize);
  const totalInspections = paginationMeta?.count || filteredInspections.length;
  const filteredCount = totalInspections;

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInspections.length === inspections.length) {
      setSelectedInspections([]);
    } else {
      setSelectedInspections(inspections.map((i) => i.id));
    }
  };

  // Toggle filter checkboxes
  const toggleLaw = (law) =>
    setLawFilter((prev) =>
      prev.includes(law) ? prev.filter((l) => l !== law) : [...prev, law]
    );

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setSectionFilter([]);
    setLawFilter([]);
    setDateFrom("");
    setDateTo("");
    setShowOnlyMyAssignments(false);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasActiveFilters =
    searchQuery ||
    sectionFilter.length > 0 ||
    lawFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    showOnlyMyAssignments ||
    sortConfig.key;
  const activeFilterCount =
    sectionFilter.length +
    lawFilter.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (showOnlyMyAssignments ? 1 : 0);

  // Calculate display range (for server-side pagination)
  const startItem = totalInspections > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalInspections);

  // Removed handleRowClick to prevent navigation on row click

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-600">Inspections Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-10 pr-8 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* 🔽 Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowUpDown size={14} />
              Sort
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  {/* Header */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    Sort Options
                  </div>

                  {/* Sort Fields */}
                  <div className="mt-2 mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Sort by
                    </div>
                    {sortFields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() =>
                          handleSortFromDropdown(
                            field.key,
                            sortConfig.key === field.key
                              ? sortConfig.direction === "asc"
                                ? "desc"
                                : "asc"
                              : "asc"
                          )
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <span>{field.label}</span>
                        {sortConfig.key === field.key && (
                          <div className="flex items-center gap-1">
                            {sortConfig.direction === "asc" ? (
                              <ArrowUp size={14} className="text-sky-600" />
                            ) : (
                              <ArrowDown size={14} className="text-sky-600" />
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Clear Sort */}
                  {sortConfig.key && (
                    <>
                      <div className="my-1 border-t border-gray-200"></div>
                      <button
                        onClick={() => setSortConfig({ key: null, direction: null })}
                        className="w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-left"
                      >
                        Clear Sort
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 🎚 Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={14} />
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-sky-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  {/* Header with Clear All */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filters
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setSectionFilter([]);
                          setLawFilter([]);
                        }}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Assignment Filter */}
                  {(userLevel === 'Section Chief' || userLevel === 'Unit Head' || userLevel === 'Monitoring Personnel') && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Assignment
                      </div>
                      <button
                        onClick={() => setShowOnlyMyAssignments(!showOnlyMyAssignments)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          showOnlyMyAssignments ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">My Assignments Only</div>
                          <div className="text-xs text-gray-500">Show only inspections assigned to me</div>
                        </div>
                        {showOnlyMyAssignments && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Law Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Law
                    </div>
                    {availableLaws.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">
                        No laws available
                      </div>
                    ) : (
                      availableLaws.map((law) => (
                        <button
                          key={law}
                          onClick={() => toggleLaw(law)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                            lawFilter.includes(law) ? "bg-sky-50 font-medium" : ""
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div className="font-medium">{law}</div>
                          </div>
                          {lawFilter.includes(law) && (
                            <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DateRangeDropdown
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClear={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className=" absolute right-0 flex items-center text-sm"
          />

          <ExportDropdown
            title="Inspections Export Report"
            fileName="inspections_export"
            columns={["Code", "Establishments", "Law", "Status", "Inspected By", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.inspected_by_name || 'Not Inspected',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.inspected_by_name || 'Not Inspected',
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            disabled={inspections.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Inspections Report"
            fileName="inspections_report"
            columns={["Code", "Establishments", "Law", "Status", "Inspected By", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.inspected_by_name || 'Not Inspected',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.inspected_by_name || 'Not Inspected',
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            selectedCount={selectedInspections.length}
            disabled={inspections.length === 0}
            className="flex items-center px-3 py-1 text-sm"
          />

          {/* Only show Add Inspection button for Division Chief */}
          {userLevel === 'Division Chief' && (
            <button
              onClick={onAdd}
              className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Plus size={16} /> Add Inspection
            </button>
          )}
        </div>
      </div>

      {/* Role-based Tabs */}
      <InspectionTabs 
        userLevel={userLevel}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabCounts={tabCounts}
      />

      {/* Table Container with Scroll */}
      <div className="overflow-auto border border-gray-300 rounded-lg h-[calc(100vh-325px)] scroll-smooth custom-scrollbar">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
              <th className="w-6 p-1 text-center border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedInspections.length > 0 &&
                    selectedInspections.length === inspections.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-1 border-b border-gray-300 cursor-pointer" onClick={() => handleSort("code")}>
                <div className="flex items-center gap-1">Code {getSortIcon("code")}</div>
              </th>
              <th className="p-1 border-b border-gray-300">Establishments</th>
              <th className="p-1 border-b border-gray-300">Law</th>
              <th className="p-1 text-center border-b border-gray-300">Status</th>
              <th className="p-1 border-b border-gray-300">Inspected By</th>
              <th className="p-1 text-center border-b border-gray-300 cursor-pointer" onClick={() => handleSort("created_at")}>
                <div className="flex items-center justify-center gap-1">Created {getSortIcon("created_at")}</div>
              </th>
              <th className="p-1 text-center border-b border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-2 py-6 text-center text-gray-500 border-b border-gray-300"
                >
                  <div
                    className="flex flex-col items-center justify-center p-4"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Loading inspections...</p>
                  </div>
                </td>
              </tr>
            ) : filteredInspections.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-2 py-4 text-center text-gray-500 border-b border-gray-300"
                >
                  {hasActiveFilters ? (
                    <div>
                      No inspections found matching your criteria.
                      <br />
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 underline text-sky-600 hover:text-sky-700"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    getEmptyStateMessage(activeTab, userLevel)
                  )}
                </td>
              </tr>
            ) : (
              filteredInspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  ref={inspection.id === highlightedInspId ? highlightedRowRef : null}
                  className={`p-1 text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                    inspection.id === highlightedInspId ? 'search-highlight-persist' : ''
                  }`}
                  onClick={() => setHighlightedInspId(inspection.id)}
                >
                  <td className="p-1 text-center border-b border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedInspections.includes(inspection.id)}
                      onChange={() => toggleSelect(inspection.id)}
                    />
                  </td>
                  <td className="p-1 font-semibold border-b border-gray-300">
                    {inspection.code}
                  </td>
                  <td className="p-1 border-b border-gray-300">
                    {inspection.establishments_detail && inspection.establishments_detail.length > 0
                      ? inspection.establishments_detail.map(e => e.name).join(', ')
                      : 'No establishments'}
                  </td>
                  <td className="p-1 border-b border-gray-300">
                    {inspection.law}
                  </td>
                  <td className="p-1 text-center border-b border-gray-300">
                    <StatusBadge 
                      status={inspection.current_status}
                    />
                  </td>
                  <td className="p-1 border-b border-gray-300">
                    {inspection.inspected_by_name || 'Not Inspected'}
                  </td>
                  <td className="p-1 text-center border-b border-gray-300">
                    {formatFullDate(inspection.created_at)}
                  </td>
                  <td className="p-1 text-center border-b border-gray-300" onClick={(e) => e.stopPropagation()}>
                    {canUserPerformActions(userLevel) ? (
                      <InspectionActions 
                        inspection={inspection}
                        availableActions={inspection.available_actions || []}
                        onAction={handleActionClick}
                        loading={isActionLoading(inspection.id)}
                        userLevel={userLevel}
                      />
                    ) : (
                      <button
                        onClick={() => window.location.href = `/inspections/${inspection.id}/view`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded hover:bg-sky-700 transition-colors"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalInspections}
        filteredItems={filteredCount}
        hasActiveFilters={hasActiveFilters}
        onPageChange={goToPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        startItem={startItem}
        endItem={endItem}
        storageKey="inspections_list"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        title="Delete Inspection"
        message={`Are you sure you want to delete inspection ${deleteConfirmation.inspection?.code || deleteConfirmation.inspection?.id}? This action cannot be undone.${
          userLevel === 'Admin' 
            ? ' As an Admin, you can delete any inspection.' 
            : ' Only inspections in "Created" status can be deleted.'
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        size="md"
        onCancel={() => setDeleteConfirmation({ open: false, inspection: null })}
        onConfirm={() => handleDeleteInspection(deleteConfirmation.inspection)}
      />

      {/* Action Confirmation Dialog */}
      {actionConfirmation.open && (() => {
        const dialogContent = getActionDialogContent(
          actionConfirmation.action, 
          actionConfirmation.inspection, 
          userLevel,
          pendingForwardAction
        );
        
        return (
          <ConfirmationDialog
            open={actionConfirmation.open}
            title={dialogContent.title}
            icon={dialogContent.icon}
            headerColor={dialogContent.headerColor}
            message={dialogContent.message}
            confirmText={dialogContent.confirmText}
            cancelText="Cancel"
            confirmColor={dialogContent.confirmColor}
            size="md"
            loading={actionLoading}
            onCancel={() => setActionConfirmation({ open: false, inspection: null, action: null })}
            onConfirm={executeAction}
          />
        );
      })()}

      {/* Monitoring Personnel Selection Modal */}
      <MonitoringPersonnelModal
        open={showMonitoringModal}
        inspection={pendingForwardAction?.inspection}
        onClose={handleMonitoringModalClose}
        onSelect={handleMonitoringPersonnelSelect}
        loading={actionLoading}
      />

    </div>
  );
}