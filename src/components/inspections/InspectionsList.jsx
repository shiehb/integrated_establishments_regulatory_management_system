import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  Play,
  ArrowRight,
  CheckCircle,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Search,
  X,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  MapPin,
  Users,
  Clock,
  Building,
  Trash2
} from "lucide-react";
import api, { deleteInspection, getProfile } from "../../services/api";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";
import SectionLawTab from "./SectionLawTab";

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

// Status display mapping
const getStatusDisplay = (status) => {
  const statusMap = {
    'DIVISION_CREATED': { label: 'Division Created', color: 'bg-blue-100 text-blue-800' },
    'SECTION_ASSIGNED': { label: 'Section Assigned', color: 'bg-yellow-100 text-yellow-800' },
    'SECTION_IN_PROGRESS': { label: 'Section In Progress', color: 'bg-orange-100 text-orange-800' },
    'SECTION_COMPLETED': { label: 'Section Completed', color: 'bg-orange-200 text-orange-900' },
    'UNIT_ASSIGNED': { label: 'Unit Assigned', color: 'bg-purple-100 text-purple-800' },
    'UNIT_IN_PROGRESS': { label: 'Unit In Progress', color: 'bg-indigo-100 text-indigo-800' },
    'UNIT_COMPLETED': { label: 'Unit Completed', color: 'bg-indigo-200 text-indigo-900' },
    'MONITORING_ASSIGN': { label: 'Monitoring Assigned', color: 'bg-pink-100 text-pink-800' },
    'MONITORING_IN_PROGRESS': { label: 'Monitoring In Progress', color: 'bg-cyan-100 text-cyan-800' },
    'MONITORING_COMPLETED_COMPLIANT': { label: 'Monitoring Completed - Compliant', color: 'bg-green-100 text-green-800' },
    'NON_COMPLIANT_RETURN': { label: 'Non-Compliant Return', color: 'bg-red-100 text-red-800' },
    'UNIT_REVIEWED': { label: 'Unit Reviewed', color: 'bg-purple-200 text-purple-900' },
    'SECTION_REVIEWED': { label: 'Section Reviewed', color: 'bg-yellow-200 text-yellow-900' },
    'DIVISION_REVIEWED': { label: 'Division Reviewed', color: 'bg-blue-200 text-blue-900' },
    'LEGAL_REVIEW': { label: 'Legal Review', color: 'bg-red-100 text-red-800' },
    'NOV_SENT': { label: 'Notice of Violation Sent', color: 'bg-red-200 text-red-900' },
    'NOO_SENT': { label: 'Notice of Order Sent', color: 'bg-red-300 text-red-1000' },
    'CLOSED': { label: 'Closed', color: 'bg-green-200 text-green-900' },
    'REJECTED': { label: 'Rejected', color: 'bg-gray-100 text-gray-800' }
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

// Section display mapping
const getSectionDisplay = (section) => {
  const sectionMap = {
    'PD-1586': 'EIA Monitoring',
    'RA-8749': 'Air Quality Monitoring',
    'RA-9275': 'Water Quality Monitoring',
    'RA-6969': 'Toxic Chemicals Monitoring',
    'RA-9003': 'Solid Waste Management'
  };
  return sectionMap[section] || section;
};

// Priority display mapping
const getPriorityDisplay = (priority) => {
  const priorityMap = {
    'LOW': { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    'MEDIUM': { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    'HIGH': { label: 'High', color: 'bg-orange-100 text-orange-800' },
    'URGENT': { label: 'Urgent', color: 'bg-red-100 text-red-800' }
  };
  return priorityMap[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
};

// Auto-assignment logic based on workflow diagram
const applyAutoAssignment = (inspections, userLevel) => {
  return inspections.map(inspection => {
    // Mock personnel data for auto-assignment
    const mockPersonnel = [
      { id: 1, name: 'John Doe', userlevel: 'Section Chief', section: 'PD-1586,RA-8749,RA-9275', district: 'La Union - 1st District' },
      { id: 2, name: 'Jane Smith', userlevel: 'Unit Head', section: 'PD-1586', district: 'La Union - 1st District' },
      { id: 3, name: 'Mike Johnson', userlevel: 'Monitoring Personnel', section: 'PD-1586', district: 'La Union - 1st District' },
      { id: 4, name: 'Sarah Wilson', userlevel: 'Monitoring Personnel', section: 'RA-8749', district: 'La Union - 2nd District' },
      { id: 5, name: 'Legal Unit', userlevel: 'Legal Unit', section: 'ALL', district: 'ALL' }
    ];

    let assignedPersonnel = null;

    // Auto-assignment rules from workflow diagram
    switch (inspection.status) {
      case 'DIVISION_CREATED':
        // Auto-assign to Section Chief based on section
        assignedPersonnel = mockPersonnel.find(p => 
          p.userlevel === 'Section Chief' && 
          p.section.includes(inspection.section)
        );
        break;

      case 'SECTION_REVIEW':
        // Section Chief is already assigned
        assignedPersonnel = mockPersonnel.find(p => 
          p.userlevel === 'Section Chief' && 
          p.section.includes(inspection.section)
        );
        break;

      case 'UNIT_REVIEW':
        // Auto-assign to Unit Head if exists for section (PD-1586, RA-8749, RA-9275)
        if (['PD-1586', 'RA-8749', 'RA-9275'].includes(inspection.section)) {
          assignedPersonnel = mockPersonnel.find(p => 
            p.userlevel === 'Unit Head' && 
            p.section === inspection.section &&
            p.district === inspection.establishment_detail?.district
          );
        }
        break;

      case 'MONITORING_ASSIGN':
        // Auto-assign to Monitoring Personnel based on district + law matching
        assignedPersonnel = mockPersonnel.find(p => 
          p.userlevel === 'Monitoring Personnel' && 
          p.section === inspection.section &&
          p.district === inspection.establishment_detail?.district
        );
        break;

      case 'MONITORING_INSPECTION':
        // Monitoring Personnel is already assigned
        assignedPersonnel = mockPersonnel.find(p => 
          p.userlevel === 'Monitoring Personnel' && 
          p.section === inspection.section &&
          p.district === inspection.establishment_detail?.district
        );
        break;

      case 'LEGAL_REVIEW':
        // Auto-assign to Legal Unit
        assignedPersonnel = mockPersonnel.find(p => p.userlevel === 'Legal Unit');
        break;
    }

    return {
      ...inspection,
      assigned_to: assignedPersonnel?.name || 'Unassigned',
      current_assignee_name: assignedPersonnel?.name || 'Unassigned',
      assigned_personnel_id: assignedPersonnel?.id || null,
      can_act: assignedPersonnel?.userlevel === userLevel
    };
  });
};

export default function InspectionsList({ onAdd, onView, onWorkflow, onCompliance, onLegalUnit, refreshTrigger, userLevel = 'Division Chief' }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  

  // 📑 Tab state for role-based tabs
  const [activeTab, setActiveTab] = useState('all');

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

  // Get role-based tabs following workflow diagram
  const getRoleBasedTabs = () => {
    switch (userLevel) {
      case 'Division Chief':
        return [
          { id: 'create_inspection', label: 'Create Inspection', count: 0 },
          { id: 'review_list', label: 'Review List', count: 0 }
        ];
      case 'Section Chief':
        return [
          { id: 'created_inspections', label: 'Created Inspections', count: 0 },
          { id: 'my_inspections', label: 'My Inspections', count: 0 },
          { id: 'forwarded', label: 'Forwarded List', count: 0 },
          { id: 'review_list', label: 'Review List', count: 0 }
        ];
      case 'Unit Head':
        return [
          { id: 'received_inspections', label: 'Received Inspections', count: 0 },
          { id: 'my_inspections', label: 'My Inspections', count: 0 },
          { id: 'forwarded', label: 'Forwarded List', count: 0 },
          { id: 'review_list', label: 'Review List', count: 0 }
        ];
      case 'Monitoring Personnel':
        return [
          { id: 'assigned_inspections', label: 'My Assigned Inspections', count: 0 }
        ];
      case 'Legal Unit':
        return [
          { id: 'legal_review', label: 'Non-Compliant Cases', count: 0 }
        ];
      default:
        return [{ id: 'all', label: 'All Inspections', count: 0 }];
    }
  };

  const fetchAllInspections = useCallback(async () => {
    setLoading(true);
    try {
      // Don't fetch if currentUser is not loaded yet
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        tab: activeTab, // Add tab parameter for role-based filtering
      });

      // Add search parameter if provided
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }

      // Add status filter if selected
      if (statusFilter.length > 0) {
        params.append("status", statusFilter.join(","));
      }

      // Add section filter if selected
      if (sectionFilter.length > 0) {
        params.append("section", sectionFilter.join(","));
      }

      // Add priority filter if selected
      if (priorityFilter.length > 0) {
        params.append("priority", priorityFilter.join(","));
      }

      const res = await api.get(`inspections/?${params.toString()}`);

      if (res.data.results) {
        // Server-side paginated response
        setInspections(res.data.results);
        setTotalCount(res.data.count || 0);
      } else {
        // Fallback for non-paginated response
        setInspections(res.data);
        setTotalCount(res.data.length);
      }
    } catch (err) {
      console.error("Error fetching inspections:", err);
      // Use mock data for demonstration with role-based filtering
      const allMockInspections = [
        {
          id: 1,
          code: 'EIA-2025-0001',
          establishment_name: 'ABC Manufacturing Corp.',
          establishment_detail: {
            name: 'ABC Manufacturing Corp.',
            city: 'San Fernando',
            province: 'La Union',
            district: 'La Union - 1st District'
          },
          section: 'PD-1586',
          status: 'DIVISION_CREATED',
          priority: 'MEDIUM',
          assigned_to: 'John Doe',
          current_assignee_name: 'John Doe',
          created_at: '2025-01-15T08:00:00Z',
          updated_at: '2025-01-15T10:30:00Z',
          can_act: true,
          created_by: 'Division Chief'
        },
        {
          id: 2,
          code: 'AIR-2025-0002',
          establishment_name: 'XYZ Industries Inc.',
          establishment_detail: {
            name: 'XYZ Industries Inc.',
            city: 'Bauang',
            province: 'La Union',
            district: 'La Union - 2nd District'
          },
          section: 'RA-8749',
          status: 'SECTION_REVIEW',
          priority: 'HIGH',
          assigned_to: 'Jane Smith',
          current_assignee_name: 'Jane Smith',
          created_at: '2025-01-14T09:15:00Z',
          updated_at: '2025-01-14T14:20:00Z',
          can_act: true,
          created_by: 'Division Chief'
        },
        {
          id: 3,
          code: 'WATER-2025-0003',
          establishment_name: 'DEF Processing Plant',
          establishment_detail: {
            name: 'DEF Processing Plant',
            city: 'San Juan',
            province: 'La Union',
            district: 'La Union - 1st District'
          },
          section: 'RA-9275',
          status: 'MONITORING_INSPECTION',
          priority: 'LOW',
          assigned_to: 'Mike Johnson',
          current_assignee_name: 'Mike Johnson',
          created_at: '2025-01-13T11:30:00Z',
          updated_at: '2025-01-13T16:45:00Z',
          can_act: true,
          created_by: 'Division Chief'
        },
        {
          id: 4,
          code: 'TOX-2025-0004',
          establishment_name: 'GHI Chemical Plant',
          establishment_detail: {
            name: 'GHI Chemical Plant',
            city: 'Agoo',
            province: 'La Union',
            district: 'La Union - 2nd District'
          },
          section: 'RA-6969',
          status: 'LEGAL_REVIEW',
          priority: 'URGENT',
          assigned_to: 'Legal Unit',
          current_assignee_name: 'Legal Unit',
          created_at: '2025-01-12T14:20:00Z',
          updated_at: '2025-01-12T16:30:00Z',
          can_act: true,
          created_by: 'Division Chief'
        },
        {
          id: 5,
          code: 'EIA-2025-0005',
          establishment_name: 'JKL Construction Ltd.',
          establishment_detail: {
            name: 'JKL Construction Ltd.',
            city: 'San Fernando',
            province: 'La Union',
            district: 'La Union - 1st District'
          },
          section: 'PD-1586',
          status: 'UNIT_REVIEW',
          priority: 'MEDIUM',
          assigned_to: 'Jane Smith',
          current_assignee_name: 'Jane Smith',
          created_at: '2025-01-13T10:15:00Z',
          updated_at: '2025-01-13T11:45:00Z',
          can_act: true,
          created_by: 'Division Chief'
        },
        {
          id: 6,
          code: 'AIR-2025-0006',
          establishment_name: 'MNO Manufacturing Inc.',
          establishment_detail: {
            name: 'MNO Manufacturing Inc.',
            city: 'Bauang',
            province: 'La Union',
            district: 'La Union - 2nd District'
          },
          section: 'RA-8749',
          status: 'UNIT_REVIEW',
          priority: 'HIGH',
          assigned_to: 'Jane Smith',
          current_assignee_name: 'Jane Smith',
          created_at: '2025-01-14T08:30:00Z',
          updated_at: '2025-01-14T09:15:00Z',
          can_act: true,
          created_by: 'Division Chief'
        }
      ];

      // Apply auto-assignment logic based on workflow diagram
      const autoAssignedInspections = applyAutoAssignment(allMockInspections, userLevel);

      // Filter based on active tab and user level following workflow diagram
      let filteredInspections = autoAssignedInspections;
      
      switch (userLevel) {
        case 'Division Chief':
          // Division Chief: Filter by active tab (section)
          if (activeTab === 'all') {
            filteredInspections = autoAssignedInspections;
          } else {
            // Filter by specific section
            filteredInspections = autoAssignedInspections.filter(i => i.section === activeTab);
          }
          break;
        case 'Section Chief':
          if (activeTab === 'created_inspections') {
            // Tab 1: Created Inspections (from Division Chief) - show both DIVISION_CREATED and SECTION_ASSIGNED
            filteredInspections = autoAssignedInspections.filter(i => 
              ['DIVISION_CREATED', 'SECTION_ASSIGNED'].includes(i.status) && 
              i.current_assigned_to === currentUser?.id
            );
          } else if (activeTab === 'my_inspections') {
            // Tab 2: My Inspections (after Inspect button)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.status === 'SECTION_IN_PROGRESS' && i.current_assigned_to === currentUser?.id
            );
          } else if (activeTab === 'forwarded') {
            // Tab 3: Forwarded List (only show inspections that were actually forwarded by this Section Chief)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.assigned_section_chief === currentUser?.id && 
              ['UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED', 'MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'NON_COMPLIANT_RETURN', 'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'].includes(i.status)
            );
          } else if (activeTab === 'review_list') {
            // Tab 4: Review List (from Unit Head)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.status === 'SECTION_REVIEWED' && i.current_assigned_to === currentUser?.id
            );
          }
          break;
        case 'Unit Head':
          if (activeTab === 'received_inspections') {
            // Tab 1: Received from Section
            filteredInspections = autoAssignedInspections.filter(i => 
              i.status === 'UNIT_ASSIGNED' && i.current_assigned_to === currentUser?.id
            );
          } else if (activeTab === 'my_inspections') {
            // Tab 2: My Inspections (after Inspect button)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.status === 'UNIT_IN_PROGRESS' && i.current_assigned_to === currentUser?.id
            );
          } else if (activeTab === 'forwarded') {
            // Tab 3: Forwarded List (only show inspections that were actually forwarded by this Unit Head)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.assigned_unit_head === currentUser?.id && 
              ['MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'NON_COMPLIANT_RETURN'].includes(i.status)
            );
          } else if (activeTab === 'review_list') {
            // Tab 4: Review List (from Monitoring)
            filteredInspections = autoAssignedInspections.filter(i => 
              i.status === 'UNIT_REVIEWED' && i.current_assigned_to === currentUser?.id
            );
          }
          break;
        case 'Monitoring Personnel':
          if (activeTab === 'assigned_inspections') {
            // Assigned Inspections (auto-assigned)
            filteredInspections = autoAssignedInspections.filter(i => 
              ['MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS'].includes(i.status) && 
              i.current_assigned_to === currentUser?.id
            );
          }
          break;
        case 'Legal Unit':
          if (activeTab === 'legal_review') {
            // Legal Review (non-compliant cases)
            filteredInspections = autoAssignedInspections.filter(i => 
              ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'].includes(i.status) && 
              i.current_assigned_to === currentUser?.id
            );
          }
          break;
      }

      setInspections(filteredInspections);
      setTotalCount(filteredInspections.length);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, sectionFilter, priorityFilter, activeTab, userLevel, currentUser]);

  // Delete inspection function
  const handleDeleteInspection = useCallback(async (inspection) => {
    try {
      await deleteInspection(inspection.id);
      // Refresh the inspections list
      fetchAllInspections();
      // Close confirmation dialog
      setDeleteConfirmation({ open: false, inspection: null });
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(`Error deleting inspection: ${error.message}`);
    }
  }, [fetchAllInspections]);

  // Fetch all inspections on component mount and when pagination/filters change
  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setCurrentUser(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

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
    { key: "establishment_name", label: "Establishment" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "created_at", label: "Created Date" },
    { key: "updated_at", label: "Updated Date" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  // ✅ Filter + Sort with LOCAL search (client-side only)
  const filteredInspections = useMemo(() => {
    let list = inspections.filter((inspection) => {
      // Apply local search filter
      const query = debouncedSearchQuery.toLowerCase();
      const establishmentName = inspection.establishment_name || inspection.establishment_detail?.name || "";
      const code = inspection.code || "";
      const section = getSectionDisplay(inspection.section) || "";

      const matchesSearch = debouncedSearchQuery
        ? establishmentName.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query) ||
          section.toLowerCase().includes(query)
        : true;

      // Apply status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(inspection.status);

      // Apply section filter
      const matchesSection =
        sectionFilter.length === 0 || sectionFilter.includes(inspection.section);

      // Apply priority filter
      const matchesPriority =
        priorityFilter.length === 0 || priorityFilter.includes(inspection.priority);

      // Apply date filter
      const matchesDateFrom = dateFrom
        ? new Date(inspection.created_at) >= new Date(dateFrom)
        : true;
      const matchesDateTo = dateTo
        ? new Date(inspection.created_at) <= new Date(dateTo)
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSection &&
        matchesPriority &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "establishment_name") {
          aVal = a.establishment_name || a.establishment_detail?.name || "";
          bVal = b.establishment_name || b.establishment_detail?.name || "";
        } else {
          aVal = a[sortConfig.key] || "";
          bVal = b[sortConfig.key] || "";
        }

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    inspections,
    debouncedSearchQuery,
    statusFilter,
    sectionFilter,
    priorityFilter,
    dateFrom,
    dateTo,
    sortConfig,
  ]);

  // ✅ Pagination (using server-side pagination, so no need for paginatedInspections)

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
  const toggleStatus = (status) =>
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );


  const togglePriority = (priority) =>
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSectionFilter([]);
    setPriorityFilter([]);
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

  const totalInspections = totalCount;
  const filteredCount = totalCount; // Server-side filtering
  const hasActiveFilters =
    searchQuery ||
    statusFilter.length > 0 ||
    sectionFilter.length > 0 ||
    priorityFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    sortConfig.key;
  const activeFilterCount =
    statusFilter.length +
    sectionFilter.length +
    priorityFilter.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCount);

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Inspections Management</h1>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute -translate-y-1/2 right-3 top-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>


          {/* 🔽 Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUpDown size={14} />
              Sort by
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sort Options
                  </div>
                  
                  {/* Sort by Field Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Sort by Field
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
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{field.label}</div>
                        </div>
                        {sortConfig.key === field.key && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Order Section - Shown if a field is selected */}
                  {sortConfig.key && (
                    <>
                      <div className="my-1 border-t border-gray-200"></div>
                      <div>
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Sort Order
                        </div>
                        {sortDirections.map((dir) => (
                          <button
                            key={dir.key}
                            onClick={() =>
                              handleSortFromDropdown(sortConfig.key, dir.key)
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              sortConfig.direction === dir.key ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{dir.label}</div>
                            </div>
                            {sortConfig.direction === dir.key && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
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
               className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
             >
               <ArrowUpDown size={14} />
               Filters
               <ChevronDown size={14} />
               {activeFilterCount > 0 && ` (${activeFilterCount})`}
             </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded shadow">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2 mb-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filter Options
                    </div>
                    {(statusFilter.length > 0 || sectionFilter.length > 0 || priorityFilter.length > 0) && (
                      <button
                        onClick={() => {
                          setStatusFilter([]);
                          setSectionFilter([]);
                          setPriorityFilter([]);
                        }}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Status Section */}
                  <div className="mb-3">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Status
                    </div>
                    {[
                      "DIVISION_CREATED",
                      "SECTION_REVIEW",
                      "SECTION_INSPECTING",
                      "UNIT_REVIEW",
                      "UNIT_INSPECTING",
                      "MONITORING_ASSIGN",
                      "MONITORING_INSPECTION",
                      "COMPLETED",
                      "LEGAL_REVIEW"
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          statusFilter.includes(status) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{getStatusDisplay(status).label}</div>
                        </div>
                        {statusFilter.includes(status) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>


                  {/* Priority Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Priority
                    </div>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          priorityFilter.includes(priority) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{getPriorityDisplay(priority).label}</div>
                        </div>
                        {priorityFilter.includes(priority) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
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
            columns={["Code", "Establishment", "Section", "Status", "Priority", "Assigned To", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishment_name || inspection.establishment_detail?.name,
                getSectionDisplay(inspection.section),
                getStatusDisplay(inspection.status).label,
                getPriorityDisplay(inspection.priority).label,
                inspection.current_assignee_name || inspection.assigned_to,
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishment_name || inspection.establishment_detail?.name,
                getSectionDisplay(inspection.section),
                getStatusDisplay(inspection.status).label,
                getPriorityDisplay(inspection.priority).label,
                inspection.current_assignee_name || inspection.assigned_to,
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            disabled={inspections.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Inspections Report"
            fileName="inspections_report"
            columns={["Code", "Establishment", "Section", "Status", "Priority", "Assigned To", "Created Date"]}
            rows={selectedInspections.length > 0 ? 
              selectedInspections.map(inspection => [
                inspection.code,
                inspection.establishment_name || inspection.establishment_detail?.name,
                getSectionDisplay(inspection.section),
                getStatusDisplay(inspection.status).label,
                getPriorityDisplay(inspection.priority).label,
                inspection.current_assignee_name || inspection.assigned_to,
                new Date(inspection.created_at).toLocaleDateString()
              ]) : 
              inspections.map(inspection => [
                inspection.code,
                inspection.establishment_name || inspection.establishment_detail?.name,
                getSectionDisplay(inspection.section),
                getStatusDisplay(inspection.status).label,
                getPriorityDisplay(inspection.priority).label,
                inspection.current_assignee_name || inspection.assigned_to,
                new Date(inspection.created_at).toLocaleDateString()
              ])
            }
            selectedCount={selectedInspections.length}
            disabled={inspections.length === 0}
            className="flex items-center px-3 py-1 text-sm"
          />

          <button
            onClick={onAdd}
            className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            <Plus size={16} /> Add Inspection
          </button>
        </div>
      </div>

      {/* Role-based Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {getRoleBasedTabs().map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600 bg-sky-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={userLevel === 'Division Chief' ? (tab.id === 'all' ? 'Show all inspections' : `Filter by ${tab.label}`) : undefined}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Table Content */}
      <>
          {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalInspections || (userLevel === 'Division Chief' && activeTab !== 'all')) && (
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <div>
            {userLevel === 'Division Chief' && activeTab !== 'all' ? (
              <span>
                Showing {filteredCount} inspection(s) for <span className="font-medium text-sky-600">{getSectionDisplay(activeTab)}</span>
              </span>
            ) : filteredCount === totalInspections ? (
              `Showing all ${totalInspections} inspection(s)`
            ) : (
              `Showing ${filteredCount} of ${totalInspections} inspection(s)`
            )}
          </div>
          <div className="flex gap-2">
            {userLevel === 'Division Chief' && activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="underline text-sky-600 hover:text-sky-700"
              >
                Show All Sections
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="underline text-sky-600 hover:text-sky-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

       {/* Table */}
       <table className="w-full border border-gray-300 rounded-lg">
         <thead>
           <tr className="text-sm text-left text-white bg-sky-700">
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
             {[
               { key: "code", label: "Inspection Code", sortable: true },
               { key: "establishment_name", label: "Establishment", sortable: true },
               { key: "section", label: "Section", sortable: false },
               { key: "status", label: "Status", sortable: true },
               { key: "priority", label: "Priority", sortable: true },
               { key: "assigned_to", label: "Assigned To", sortable: false },
               { key: "created_at", label: "Created Date", sortable: true },
             ].map((col) => (
               <th
                 key={col.key}
                 className={`p-1 border-b border-gray-300 ${
                   col.sortable ? "cursor-pointer" : ""
                 }`}
                 onClick={col.sortable ? () => handleSort(col.key) : undefined}
               >
                 <div className="flex items-center gap-1">
                   {col.label} {col.sortable && getSortIcon(col.key)}
                 </div>
               </th>
             ))}

             <th className="p-1 text-center border-b border-gray-300 w-35">
               Actions
             </th>
           </tr>
         </thead>
         <tbody>
           {loading ? (
             <tr>
               <td
                 colSpan="9"
                 className="px-2 py-8 text-center border-b border-gray-300"
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
           ) : inspections.length === 0 ? (
             <tr>
               <td
                 colSpan="9"
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
             inspections.map((inspection) => (
               <tr
                 key={inspection.id}
                 className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
               >
                 <td className="text-center border-b border-gray-300">
                   <input
                     type="checkbox"
                     checked={selectedInspections.includes(inspection.id)}
                     onChange={() => toggleSelect(inspection.id)}
                   />
                 </td>
                 <td className="px-2 font-semibold border-b border-gray-300">
                   <div className="flex items-center">
                     <FileText className="h-4 w-4 text-gray-400 mr-2" />
                     {inspection.code}
                   </div>
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   <div className="flex items-center">
                     <Building className="h-4 w-4 text-gray-400 mr-2" />
                     <div>
                       <div className="font-medium">{inspection.establishment_name || inspection.establishment_detail?.name}</div>
                       <div className="text-xs text-gray-500">
                         {inspection.establishment_detail?.city}, {inspection.establishment_detail?.province}
                       </div>
                     </div>
                   </div>
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   {getSectionDisplay(inspection.section)}
                 </td>
                 <td className="px-2 text-center border-b border-gray-300">
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusDisplay(inspection.status).color}`}>
                     {getStatusDisplay(inspection.status).label}
                   </span>
                 </td>
                 <td className="px-2 text-center border-b border-gray-300">
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityDisplay(inspection.priority).color}`}>
                     {getPriorityDisplay(inspection.priority).label}
                   </span>
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   <div className="flex items-center">
                     <Users className="h-4 w-4 text-gray-400 mr-2" />
                     {inspection.current_assignee_name || inspection.assigned_to || 'Unassigned'}
                   </div>
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   <div className="flex items-center">
                     <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                     {formatFullDate(inspection.created_at)}
                   </div>
                 </td>
                 <td className="p-1 text-center border-b border-gray-300">
                      <ActionButtons
                        inspection={inspection}
                        onView={onView}
                        onWorkflow={onWorkflow}
                        onCompliance={onCompliance}
                        onLegalUnit={onLegalUnit}
                        onDelete={(inspection) => setDeleteConfirmation({ open: true, inspection })}
                        userLevel={userLevel}
                        activeTab={activeTab}
                      />
                 </td>
               </tr>
             ))
           )}
         </tbody>
      </table>

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
            : ' Only inspections in "Division Created" status can be deleted.'
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        size="md"
        onCancel={() => setDeleteConfirmation({ open: false, inspection: null })}
        onConfirm={() => handleDeleteInspection(deleteConfirmation.inspection)}
      />

      </>

    </div>
  );
}

/* Action Buttons Component - Following Workflow Diagram */
function ActionButtons({ inspection, onView, onWorkflow, onCompliance, onLegalUnit, onDelete, userLevel, activeTab }) {
  const getAvailableActions = () => {
    const actions = [];

    // Review button - available for all user levels
    actions.push({
      icon: Eye,
      label: 'View',
      action: () => onView(inspection),
      color: 'bg-sky-600 hover:bg-sky-700'
    });

    // Section Chief specific actions for Created Inspections tab
    if (userLevel === 'Section Chief' && activeTab === 'created_inspections' && ['DIVISION_CREATED', 'SECTION_ASSIGNED'].includes(inspection.status)) {
      // Inspect button - moves to SECTION_IN_PROGRESS status and moves to My Inspections tab
      actions.push({
        icon: Play,
        label: 'Inspect',
        action: () => onWorkflow(inspection, 'inspect'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
      
      // Forward button - check if Unit Head exists for this section
      const hasUnitHead = ['PD-1586', 'RA-8749', 'RA-9275'].includes(inspection.section);
      if (hasUnitHead) {
        actions.push({
          icon: ArrowRight,
          label: 'Forward',
          action: () => onWorkflow(inspection, 'forward_to_unit'),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      } else {
        actions.push({
          icon: ArrowRight,
          label: 'Forward',
          action: () => onWorkflow(inspection, 'forward_to_monitoring'),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      }
    }

    // Section Chief specific actions for My Inspections tab
    if (userLevel === 'Section Chief' && activeTab === 'my_inspections' && inspection.status === 'SECTION_IN_PROGRESS') {
      // Complete Inspection button
      actions.push({
        icon: CheckCircle,
        label: 'Complete',
        action: () => onWorkflow(inspection, 'complete_inspection'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Section Chief specific actions for Review List tab
    if (userLevel === 'Section Chief' && activeTab === 'review_list' && inspection.status === 'SECTION_REVIEWED') {
      // Review button - forward to Division
        actions.push({
          icon: ArrowRight,
        label: 'Review',
        action: () => onWorkflow(inspection, 'review'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Unit Head specific actions for Received Inspections tab
    if (userLevel === 'Unit Head' && activeTab === 'received_inspections' && inspection.status === 'UNIT_ASSIGNED') {
      // Inspect button - moves to UNIT_IN_PROGRESS status and moves to My Inspections tab
      actions.push({
        icon: Play,
        label: 'Inspect',
        action: () => onWorkflow(inspection, 'inspect'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
      
      // Forward button - send directly to Monitoring
        actions.push({
          icon: ArrowRight,
        label: 'Forward',
          action: () => onWorkflow(inspection, 'forward_to_monitoring'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Unit Head specific actions for My Inspections tab
    if (userLevel === 'Unit Head' && activeTab === 'my_inspections' && inspection.status === 'UNIT_IN_PROGRESS') {
      // Complete Inspection button
      actions.push({
        icon: CheckCircle,
        label: 'Complete',
        action: () => onWorkflow(inspection, 'complete_inspection'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Unit Head specific actions for Review List tab
    if (userLevel === 'Unit Head' && activeTab === 'review_list' && inspection.status === 'UNIT_REVIEWED') {
      // Review button - forward to Section
      actions.push({
        icon: ArrowRight,
        label: 'Review',
        action: () => onWorkflow(inspection, 'review'),
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Monitoring Personnel specific actions
    if (userLevel === 'Monitoring Personnel' && activeTab === 'assigned_inspections') {
      if (inspection.status === 'MONITORING_ASSIGN') {
        // Start Inspection button
        actions.push({
          icon: Play,
          label: 'Start Inspection',
          action: () => onWorkflow(inspection, 'start_inspection'),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      } else if (inspection.status === 'MONITORING_IN_PROGRESS') {
        // Complete Compliant button
        actions.push({
          icon: CheckCircle,
          label: 'Complete',
          action: () => onWorkflow(inspection, 'complete_compliant'),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
        
        // Complete Non-Compliant button
        actions.push({
          icon: XCircle,
          label: 'Complete',
          action: () => onWorkflow(inspection, 'complete_non_compliant'),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
        
        // Update Compliance button
        actions.push({
          icon: FileText,
          label: 'Update',
          action: () => onCompliance && onCompliance(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      }
    }

    // Legal Unit specific actions
    if (userLevel === 'Legal Unit' && activeTab === 'legal_review') {
      if (inspection.status === 'LEGAL_REVIEW') {
        // Send Notice of Violation button
        actions.push({
          icon: FileText,
          label: 'Send NOV',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
        
        // Send Notice of Order button
        actions.push({
          icon: FileText,
          label: 'Send NOO',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
        
        // Close Case button
        actions.push({
          icon: CheckCircle,
          label: 'Close',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      } else if (inspection.status === 'NOV_SENT') {
        // Send Notice of Order button
        actions.push({
          icon: FileText,
          label: 'Send NOO',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
        
        // Close Case button
        actions.push({
          icon: CheckCircle,
          label: 'Close',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      } else if (inspection.status === 'NOO_SENT') {
        // Close Case button
        actions.push({
          icon: CheckCircle,
          label: 'Close',
          action: () => onLegalUnit(inspection),
          color: 'bg-sky-600 hover:bg-sky-700'
        });
      }
    }

    // Compliance tracking actions for Monitoring Personnel
    if (userLevel === 'Monitoring Personnel' && activeTab === 'assigned_inspections' && inspection.status === 'MONITORING_INSPECTION') {
      // Update Compliance button
      actions.push({
        icon: FileText,
        label: 'Update Compliance',
        action: () => onCompliance && onCompliance(inspection),
        color: 'bg-blue-600 hover:bg-blue-700'
      });
    }

    // Delete button - available for Division Chief and Admin
    // Division Chief: only for DIVISION_CREATED status
    // Admin: can delete any inspection
    if (userLevel === 'Division Chief' && inspection.status === 'DIVISION_CREATED') {
      actions.push({
        icon: Trash2,
        label: 'Delete',
        action: () => onDelete(inspection),
        color: 'bg-red-600 hover:bg-red-700'
      });
    } else if (userLevel === 'Admin') {
      actions.push({
        icon: Trash2,
        label: 'Delete',
        action: () => onDelete(inspection),
        color: 'bg-red-600 hover:bg-red-700'
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="flex justify-center gap-1">
      {availableActions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <button
            key={index}
            onClick={action.action}
            className={`flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded ${action.color}`}
            title={action.label}
          >
            <IconComponent size={12} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
