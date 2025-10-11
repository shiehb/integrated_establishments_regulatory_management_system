import { useState, useEffect, useCallback, useMemo } from "react";
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
import { roleTabs, tabDisplayNames } from "../../constants/inspectionConstants";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";
import PaginationControls, { useLocalStoragePagination, useLocalStorageTab } from "../PaginationControls";
import { useInspectionActions } from "../../hooks/useInspectionActions";

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

// Helper function to create action-specific dialog content
const getActionDialogContent = (action, inspection, userLevel, currentUser) => {
  const establishmentNames = inspection?.establishments_detail?.length > 0 
    ? inspection.establishments_detail.map(est => est.name).join(', ')
    : 'No establishments';

  const actionConfig = {
    inspect: {
      icon: <Play className="w-5 h-5 text-blue-600" />,
      headerColor: 'blue',
      title: 'Confirm Inspection Assignment',
      confirmColor: 'blue',
      confirmText: 'Assign & Open Form',
      message: (
        <div className="space-y-4">
          {/* Inspection Details Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Inspection Details</span>
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

          {/* Action Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">What will happen?</span>
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              {userLevel === 'Section Chief' ? (
                <>
                  <p>• This inspection will be assigned to you as the Section Chief</p>
                  <p>• You will have full access to edit and complete the inspection form</p>
                  <p>• The status will change to "Section In Progress"</p>
                  <p>• The inspection form will open automatically</p>
                </>
              ) : userLevel === 'Unit Head' ? (
                <>
                  <p>• This inspection will be assigned to you as the Unit Head</p>
                  <p>• You will have full access to edit and complete the inspection form</p>
                  <p>• The status will change to "Unit In Progress"</p>
                  <p>• The inspection form will open automatically</p>
                </>
              ) : (
                <>
                  <p>• This inspection will be assigned to you</p>
                  <p>• You will have access to the inspection form</p>
                  <p>• The inspection form will open automatically</p>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to proceed with this assignment?</p>
          </div>
        </div>
      )
    },
    forward: {
      icon: <ArrowRight className="w-5 h-5 text-sky-600" />,
      headerColor: 'sky',
      title: 'Confirm Forward Action',
      confirmColor: 'sky',
      confirmText: 'Forward Inspection',
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

          {/* Forwarding Rules */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-4 h-4 text-sky-600" />
              <span className="font-medium text-sky-800">Forwarding Rules</span>
            </div>
            <div className="space-y-2 text-sm text-sky-700">
              {userLevel === 'Section Chief' ? (
                <>
                  {currentUser?.section === 'PD-1586,RA-8749,RA-9275' ? (
                    <>
                      <p>• <strong>Combined Section:</strong> Will forward to Unit Head</p>
                      <p>• If no Unit Head is assigned, you will be notified</p>
                      <p>• Unit Head will then assign to Monitoring Personnel</p>
                    </>
                  ) : (
                    <>
                      <p>• <strong>Individual Section:</strong> Will forward directly to Monitoring Personnel</p>
                      <p>• Monitoring Personnel will conduct the actual inspection</p>
                    </>
                  )}
                </>
              ) : userLevel === 'Unit Head' ? (
                <>
                  <p>• Will forward the inspection to Monitoring Personnel</p>
                  <p>• Monitoring Personnel will conduct the actual inspection</p>
                </>
              ) : (
                <>
                  <p>• Will forward the inspection to the next level in the workflow</p>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Are you sure you want to forward this inspection?</p>
          </div>
        </div>
      )
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
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tabCounts, setTabCounts] = useState({});


  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [lawFilter, setLawFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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


  const fetchAllInspections = useCallback(async () => {
    setLoading(true);
    try {
      // Don't fetch if currentUser is not loaded yet
      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log('Fetching inspections for tab:', activeTab, 'userLevel:', userLevel);

      // Use the new getInspections API function with exact tab mapping
      const params = {
        page: currentPage,
        page_size: pageSize,
        tab: activeTab, // Exact tab mapping as specified
      };

      // Add search parameter if provided
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      // Add section filter if selected
      if (sectionFilter.length > 0) {
        params.section = sectionFilter.join(",");
      }
      const response = await getInspections(params);

      if (response.results) {
        // Server-side paginated response
        setInspections(response.results);
      } else {
        // Fallback for non-paginated response
        setInspections(response);
      }
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, sectionFilter, activeTab, userLevel, currentUser]);

  // Client-side filtering and sorting
  const filteredInspections = useMemo(() => {
    let list = inspections.filter((inspection) => {
    // Law filter - use partial matching
    const matchesLaw = lawFilter.length === 0 || 
      lawFilter.some(law => {
        // Extract just the code part (e.g., "PD-1586" from "PD-1586 (Philippine Environment Code)")
        const lawCode = law.split(' ')[0];
        return inspection.law?.includes(lawCode);
      });
      
      // Date range filter
      const matchesDateFrom = !dateFrom || 
        new Date(inspection.created_at) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || 
        new Date(inspection.created_at) <= new Date(dateTo);
      
      return matchesLaw && matchesDateFrom && matchesDateTo;
    });

    // Client-side sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle date fields
        if (sortConfig.key === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        // Handle string fields
        if (sortConfig.key === 'code') {
          aVal = aVal ? aVal.toLowerCase() : '';
          bVal = bVal ? bVal.toLowerCase() : '';
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [inspections, lawFilter, dateFrom, dateTo, sortConfig]);

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

  // Calculate tab counts for all tabs
  const calculateTabCounts = useCallback(async () => {
    if (!currentUser) return;

    try {
      const availableTabs = roleTabs[userLevel] || [];
      const counts = {};

      // Fetch count for each tab
      for (const tab of availableTabs) {
        try {
          const params = {
            page: 1,
            page_size: 1, // Just get count
            tab: tab,
          };

          const response = await getInspections(params);
          counts[tab] = response.count || 0;
        } catch (error) {
          console.error(`Error fetching count for tab ${tab}:`, error);
          counts[tab] = 0;
        }
      }

      setTabCounts(counts);
    } catch (error) {
      console.error('Error calculating tab counts:', error);
    }
  }, [currentUser, userLevel]);

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
    
    // For start action, change status to MONITORING_IN_PROGRESS and open form
    if (action === 'start') {
      try {
        // Always change status to MONITORING_IN_PROGRESS when starting inspection
        console.log('Starting inspection, changing status to MONITORING_IN_PROGRESS');
          await handleAction('start', inspectionId);
          
          // Show success message
          notifications.success(
          `Inspection ${inspection.code} started successfully`, 
          { title: 'Inspection Started' }
          );
        
        // Navigate to inspection form page
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
    
    // For continue action, open the inspection form page (resume inspection)
    if (action === 'continue') {
      // Navigate to inspection form page to resume
      window.location.href = `/inspections/${inspectionId}/form`;
      return;
    }
    
    // For inspect action, show confirmation dialog for section chiefs and unit heads
    if (action === 'inspect') {
      // Check if user is Section Chief or Unit Head
      if (userLevel === 'Section Chief' || userLevel === 'Unit Head') {
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
    
    // For forward action, show confirmation dialog
    if (action === 'forward') {
      setActionConfirmation({ 
        open: true, 
        inspection, 
        action 
      });
      return;
    }
    
    // For review action, execute the action and then open the form
    if (action === 'review') {
      try {
        await handleAction(action, inspectionId);
        notifications.success(
          `Inspection ${inspection.code} status updated for review`, 
          { title: 'Review Started' }
        );
        
        // Navigate to inspection form page
        window.location.href = `/inspections/${inspectionId}/form`;
        return;
      } catch (error) {
        console.error('Error executing review action:', error);
        notifications.error(
          `Error starting review: ${error.message}`, 
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

    try {
      // For inspect action by Section Chief or Unit Head, execute the action and then open the form
      if (action === 'inspect' && (userLevel === 'Section Chief' || userLevel === 'Unit Head')) {
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
        
        if (userLevel === 'Section Chief') {
          // Section Chief forward logic
          const isCombinedSection = currentUser?.section === 'PD-1586,RA-8749,RA-9275';
          
          if (isCombinedSection) {
            // Combined section forwards to Unit (if Unit Head exists)
            forwardData.target = 'unit';
          } else {
            // Individual sections (Toxic, Solid) forward to Monitoring
            forwardData.target = 'monitoring';
          }
        } else if (userLevel === 'Unit Head') {
          // Unit Head always forwards to Monitoring Personnel
          forwardData.target = 'monitoring';
        }
        
        try {
          await handleAction(action, inspection.id, forwardData);
          
          // Show success message based on user level and section type
          if (userLevel === 'Section Chief') {
            const isCombinedSection = currentUser?.section === 'PD-1586,RA-8749,RA-9275';
            if (isCombinedSection) {
              notifications.success(
                `Inspection ${inspection.code} forwarded to Unit Head`, 
                { title: 'Inspection Forwarded' }
              );
            } else {
              notifications.success(
                `Inspection ${inspection.code} forwarded to Monitoring Personnel`, 
                { title: 'Inspection Forwarded' }
              );
            }
          } else if (userLevel === 'Unit Head') {
            notifications.success(
              `Inspection ${inspection.code} forwarded to Monitoring Personnel`, 
              { title: 'Inspection Forwarded' }
            );
          }
          
          setActionConfirmation({ open: false, inspection: null, action: null });
        } catch {
          // Error handling is done in the useInspectionActions hook
          // The error message will be displayed automatically
        }
        return;
      }
      
      // For other actions, just execute normally
      await handleAction(action, inspection.id);
      setActionConfirmation({ open: false, inspection: null, action: null });
    } catch {
      // Error is already handled in the hook
    }
  }, [actionConfirmation, handleAction, userLevel, notifications, currentUser]);


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

  // Fetch user profile
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
  }, [userLevel, activeTab]);

  // Calculate tab counts when user changes
  useEffect(() => {
    if (currentUser) {
      calculateTabCounts();
    }
  }, [currentUser, calculateTabCounts]);

  useEffect(() => {
    fetchAllInspections();
  }, [refreshTrigger, fetchAllInspections, currentUser]);

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

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  // Note: Filtering and sorting are now handled client-side

  // ✅ Pagination (using client-side pagination)
  const totalPages = Math.ceil(filteredInspections.length / pageSize);

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

  const totalInspections = inspections.length;
  const filteredCount = filteredInspections.length;
  const hasActiveFilters =
    searchQuery ||
    sectionFilter.length > 0 ||
    lawFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    sortConfig.key;
  const activeFilterCount =
    sectionFilter.length +
    lawFilter.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredInspections.length);

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
            columns={["Code", "Establishments", "Law", "Status", "Assigned To", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            disabled={inspections.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Inspections Report"
            fileName="inspections_report"
            columns={["Code", "Establishments", "Law", "Status", "Assigned To", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishments_detail && inspection.establishments_detail.length > 0 
                  ? inspection.establishments_detail.map(est => est.name).join(', ')
                  : 'No establishments',
                inspection.law,
                inspection.simplified_status || inspection.current_status,
                inspection.assigned_to_name || 'Unassigned',
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
      <div className="overflow-auto border border-gray-300 rounded-lg h-[calc(100vh-270px)] scroll-smooth custom-scrollbar">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-xs text-left text-white bg-sky-700 sticky top-0 z-10">
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
              <th className="p-1 border-b border-gray-300">Status</th>
              <th className="p-1 border-b border-gray-300">Assigned To</th>
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
                    "No inspections found."
                  )}
                </td>
              </tr>
            ) : (
              filteredInspections
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((inspection) => (
                <tr
                  key={inspection.id}
                  className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
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
                  <td className="p-1 border-b border-gray-300">
                    <StatusBadge 
                      status={inspection.current_status} 
                    />
                  </td>
                  <td className="p-1 border-b border-gray-300">
                    {inspection.assigned_to_name || 'Unassigned'}
                  </td>
                  <td className="p-1 text-center border-b border-gray-300">
                    {formatFullDate(inspection.created_at)}
                  </td>
                  <td className="p-1 text-center border-b border-gray-300" onClick={(e) => e.stopPropagation()}>
                    <InspectionActions 
                      inspection={inspection}
                      availableActions={inspection.available_actions || []}
                      onAction={handleActionClick}
                      loading={isActionLoading(inspection.id)}
                      userLevel={userLevel}
                    />
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
          currentUser
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
            size="xl"
            onCancel={() => setActionConfirmation({ open: false, inspection: null, action: null })}
            onConfirm={executeAction}
          />
        );
      })()}


    </div>
  );
}