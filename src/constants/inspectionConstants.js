// Import Lucide icons
import { 
  User, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Eye, 
  Scale, 
  FileText, 
  FileCheck, 
  Lock 
} from 'lucide-react';

// Inspection workflow constants and mappings

// Status display mapping with TailwindCSS colors - Professional color-coded system
export const statusDisplayMap = {
  // Creation Stage (Gray)
  CREATED: { label: 'Draft', color: 'gray' },
  
  // Assignment Stage (Blue)
  SECTION_ASSIGNED: { label: 'Assigned', color: 'blue' },
  UNIT_ASSIGNED: { label: 'Assigned', color: 'blue' },
  MONITORING_ASSIGNED: { label: 'Assigned', color: 'blue' },
  
  // In Progress Stage (Amber)
  SECTION_IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  UNIT_IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  MONITORING_IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  
  // Completed/Pending Review Stage (Sky)
  SECTION_COMPLETED_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  SECTION_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  UNIT_COMPLETED_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  UNIT_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  MONITORING_COMPLETED_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  MONITORING_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete', color: 'sky' },
  
  // Review Stage (Indigo)
  UNIT_REVIEWED: { label: 'Under Review', color: 'indigo' },
  SECTION_REVIEWED: { label: 'Under Review', color: 'indigo' },
  DIVISION_REVIEWED: { label: 'Under Review', color: 'indigo' },
  
  // Legal Stage (Orange)
  LEGAL_REVIEW: { label: 'Legal Review', color: 'orange' },
  NOV_SENT: { label: 'NOV Issued', color: 'orange' },
  NOO_SENT: { label: 'NOO Issued', color: 'orange' },
  
  // Final Stage (Green/Red)
  CLOSED_COMPLIANT: { label: 'Compliant', color: 'green' },
  CLOSED_NON_COMPLIANT: { label: 'Non-Compliant', color: 'red' }
};

// Role-based tabs configuration
export const roleTabs = {
  'Admin': ['all_inspections', 'inspection_complete', 'compliant', 'non_compliant'], // Admin sees all inspections in read-only mode
  'Division Chief': ['all_inspections', 'draft', 'section_assigned', 'section_in_progress', 'inspection_complete', 'under_review', 'legal_action', 'compliant', 'non_compliant'],
  'Section Chief': ['section_assigned', 'section_in_progress', 'forwarded', 'inspection_complete', 'under_review', 'legal_action', 'compliant', 'non_compliant'],
  'Unit Head': ['unit_assigned', 'unit_in_progress', 'forwarded', 'inspection_complete', 'under_review', 'compliant', 'non_compliant'],
  'Monitoring Personnel': ['assigned', 'in_progress', 'inspection_complete', 'under_review', 'compliant', 'non_compliant'],
  'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent', 'compliant', 'non_compliant']
};

// Tab display names
export const tabDisplayNames = {
  all_inspections: 'All Inspections',
  draft: 'Draft',
  section_assigned: 'Assigned',
  section_in_progress: 'In Progress',
  forwarded: 'Forwarded',
  inspection_complete: 'Inspection Complete',
  under_review: 'Under Review',
  legal_action: 'Legal Action',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  unit_assigned: 'Assigned',
  unit_in_progress: 'In Progress',
  legal_review: 'Legal Review',
  nov_sent: 'NOV Sent',
  noo_sent: 'NOO Sent',
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant'
};

// Action button configurations with Lucide icons - 5 Button Strategy
export const actionButtonConfig = {
  inspect: {
    label: 'Inspect',
    color: 'green',
    icon: Play
  },
  continue: {
    label: 'Continue',
    color: 'sky',
    icon: FileText
  },
  review: {
    label: 'Review',
    color: 'sky',
    icon: Eye
  },
  forward: {
    label: 'Forward',
    color: 'sky',
    icon: ArrowRight
  },
  send_to_legal: {
    label: 'Send to Legal',
    color: 'sky',
    icon: Scale
  },
  send_noo: {
    label: 'Send NOO',
    color: 'sky',
    icon: FileText
  },
  close: {
    label: 'Close',
    color: 'green',
    icon: Lock
  }
};

// Helper function to get status color class
export const getStatusColorClass = (status) => {
  const config = statusDisplayMap[status];
  if (!config) return 'text-gray-600';
  
  const colorMap = {
    gray: 'text-gray-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    sky: 'text-sky-600',
    indigo: 'text-indigo-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };
  
  return colorMap[config.color] || 'text-gray-600';
};

// Helper function to get status background color class
export const getStatusBgColorClass = (status) => {
  const config = statusDisplayMap[status];
  if (!config) return 'bg-gray-100';
  
  const colorMap = {
    gray: 'bg-gray-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
    sky: 'bg-sky-100',
    indigo: 'bg-indigo-100',
    orange: 'bg-orange-100',
    green: 'bg-green-100',
    red: 'bg-red-100'
  };
  
  return colorMap[config.color] || 'bg-gray-100';
};

// Helper function to get action button color class
export const getActionButtonColorClass = (action) => {
  const config = actionButtonConfig[action];
  if (!config) return 'bg-gray-500 hover:bg-gray-600';
  
  const colorMap = {
    sky: 'bg-sky-600 hover:bg-sky-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };
  
  return colorMap[config.color] || 'bg-gray-500 hover:bg-gray-600';
};

// Check if user can see this inspection based on status
export const canUserSeeInspection = (status, userLevel) => {
  // Admin can see all inspections (read-only)
  if (userLevel === 'Admin') {
    return true;
  }
  
  const visibilityMap = {
    'Section Chief': [
      'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED_COMPLIANT', 
      'SECTION_COMPLETED_NON_COMPLIANT', 'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED', 'SECTION_REVIEWED',
      'DIVISION_REVIEWED', 'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ],
    'Unit Head': [
      'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED_COMPLIANT',
      'UNIT_COMPLETED_NON_COMPLIANT', 'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED', 'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ],
    'Monitoring Personnel': [
      'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT', 'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ],
    'Division Chief': [
      'CREATED', 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED_COMPLIANT',
      'SECTION_COMPLETED_NON_COMPLIANT', 'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED', 'SECTION_REVIEWED',
      'DIVISION_REVIEWED', 'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ],
    'Legal Unit': [
      'DIVISION_REVIEWED', 'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ]
  };
  
  return visibilityMap[userLevel]?.includes(status) || false;
};

// Check if inspection is assigned to current user's role
const isInspectionAssignedToRole = (status, userLevel, inspection, currentUserId) => {
  // Direct assignment check
  const isDirectlyAssigned = inspection?.assigned_to?.id === currentUserId;
  
  // Status-based role assignment check
  const statusRoleMap = {
    'Monitoring Personnel': ['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'],
    'Unit Head': ['UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT'],
    'Section Chief': ['SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT'],
    'Division Chief': ['SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    'Legal Unit': ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
  };
  
  const relevantStatuses = statusRoleMap[userLevel] || [];
  const isStatusMatch = relevantStatuses.includes(status);
  
  // For Monitoring Personnel, also check if assigned_monitoring matches current user
  if (userLevel === 'Monitoring Personnel' && inspection?.assigned_monitoring?.id === currentUserId) {
    return true;
  }
  
  // Return true if either directly assigned OR status matches role
  return isDirectlyAssigned || isStatusMatch;
};

// Get standardized status label (same for all roles)
export const getRoleBasedStatusLabel = (status) => {
  // Return standardized label from statusDisplayMap for all users
  return statusDisplayMap[status]?.label || status;
};

// Generic status for non-assigned users
const getGenericStatusLabel = (status, userLevel) => {
  // Role-specific generic labels for forwarded work
  const roleGenericLabels = {
    'Section Chief': {
      UNIT_ASSIGNED: 'Forwarded to Unit',
      UNIT_IN_PROGRESS: 'Forwarded to Unit',
      MONITORING_ASSIGNED: 'Forwarded to Monitoring',
      MONITORING_IN_PROGRESS: 'Forwarded to Monitoring',
      MONITORING_COMPLETED_COMPLIANT: 'Completed by Monitoring',
      MONITORING_COMPLETED_NON_COMPLIANT: 'Completed by Monitoring'
    },
    'Unit Head': {
      MONITORING_ASSIGNED: 'Forwarded to Monitoring',
      MONITORING_IN_PROGRESS: 'Forwarded to Monitoring'
    }
  };
  
  if (roleGenericLabels[userLevel]?.[status]) {
    return roleGenericLabels[userLevel][status];
  }
  
  // Default professional business labels
  const genericLabels = {
    CREATED: 'Created',
    SECTION_ASSIGNED: 'With Section Chief',
    SECTION_IN_PROGRESS: 'In Process - Section',
    SECTION_COMPLETED_COMPLIANT: 'Completed - Section',
    SECTION_COMPLETED_NON_COMPLIANT: 'Completed - Section',
    UNIT_ASSIGNED: 'With Unit Head',
    UNIT_IN_PROGRESS: 'In Process - Unit',
    UNIT_COMPLETED_COMPLIANT: 'Completed - Unit',
    UNIT_COMPLETED_NON_COMPLIANT: 'Completed - Unit',
    MONITORING_ASSIGNED: 'With Monitoring Personnel',
    MONITORING_IN_PROGRESS: 'In Process - Monitoring',
    MONITORING_COMPLETED_COMPLIANT: 'Completed - Monitoring',
    MONITORING_COMPLETED_NON_COMPLIANT: 'Completed - Monitoring',
    UNIT_REVIEWED: 'Under Review',
    SECTION_REVIEWED: 'Under Review',
    DIVISION_REVIEWED: 'Under Review',
    LEGAL_REVIEW: 'Legal Review',
    NOV_SENT: 'NOV Issued',
    NOO_SENT: 'NOO Issued',
    CLOSED_COMPLIANT: 'Closed - Compliant',
    CLOSED_NON_COMPLIANT: 'Closed - Non-Compliant'
  };
  
  return genericLabels[status] || status;
};

// Tab-Status Mapping: Defines which statuses appear in which tabs for each role
// NOTE: This mapping is for reference only. The backend (server/inspections/views.py) 
// is the source of truth for tab filtering. All tab filtering is done server-side.
export const tabStatusMapping = {
  'Division Chief': {
    all_inspections: [
      'CREATED', 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 
      'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED_COMPLIANT', 
      'UNIT_COMPLETED_NON_COMPLIANT', 'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED',
      'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ],
    draft: ['CREATED'],
    section_assigned: ['SECTION_ASSIGNED'],
    section_in_progress: ['SECTION_IN_PROGRESS'],
    inspection_complete: [
      'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    legal_action: ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'],
    compliant: [
      'SECTION_COMPLETED_COMPLIANT',
      'UNIT_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT',
      'SECTION_REVIEWED',
      'UNIT_REVIEWED',
      'DIVISION_REVIEWED',
      'LEGAL_REVIEW',
      'NOV_SENT',
      'NOO_SENT',
      'CLOSED_COMPLIANT'
    ],
    non_compliant: [
      'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT',
      'SECTION_REVIEWED',
      'UNIT_REVIEWED',
      'DIVISION_REVIEWED',
      'LEGAL_REVIEW',
      'NOV_SENT',
      'NOO_SENT',
      'CLOSED_NON_COMPLIANT'
    ]
  },
  'Section Chief': {
    section_assigned: ['SECTION_ASSIGNED'],
    section_in_progress: ['SECTION_IN_PROGRESS'],
    forwarded: [
      'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
      'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'
    ],
    inspection_complete: [
      'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    legal_action: ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'],
    compliant: [
      'SECTION_COMPLETED_COMPLIANT',
      'UNIT_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT',
      'SECTION_REVIEWED',
      'UNIT_REVIEWED',
      'DIVISION_REVIEWED',
      'LEGAL_REVIEW',
      'NOV_SENT',
      'NOO_SENT',
      'CLOSED_COMPLIANT'
    ],
    non_compliant: [
      'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT',
      'SECTION_REVIEWED',
      'UNIT_REVIEWED',
      'DIVISION_REVIEWED',
      'LEGAL_REVIEW',
      'NOV_SENT',
      'NOO_SENT',
      'CLOSED_NON_COMPLIANT'
    ]
  },
  'Unit Head': {
    unit_assigned: ['UNIT_ASSIGNED'],
    unit_in_progress: ['UNIT_IN_PROGRESS'],
    forwarded: ['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'],
    inspection_complete: [
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    compliant: [
      'UNIT_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT',
      'UNIT_REVIEWED',
      'SECTION_REVIEWED',
      'DIVISION_REVIEWED',
      'CLOSED_COMPLIANT'
    ],
    non_compliant: [
      'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED',
      'SECTION_REVIEWED',
      'DIVISION_REVIEWED',
      'CLOSED_NON_COMPLIANT'
    ]
  },
  'Monitoring Personnel': {
    assigned: ['MONITORING_ASSIGNED'],
    in_progress: ['MONITORING_IN_PROGRESS'],
    inspection_complete: [
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    compliant: [
      'MONITORING_COMPLETED_COMPLIANT',
      'UNIT_REVIEWED',
      'SECTION_REVIEWED',
      'DIVISION_REVIEWED',
      'CLOSED_COMPLIANT'
    ],
    non_compliant: [
      'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED',
      'SECTION_REVIEWED',
      'DIVISION_REVIEWED',
      'CLOSED_NON_COMPLIANT'
    ]
  },
  'Legal Unit': {
    legal_review: ['LEGAL_REVIEW'],
    nov_sent: ['NOV_SENT'],
    noo_sent: ['NOO_SENT', 'CLOSED_NON_COMPLIANT']
  }
};

// Helper function to check if status should appear in tab
// NOTE: This is for UI reference only. Actual filtering is done server-side.
export const shouldShowInTab = (status, userLevel, tab) => {
  // Admin can see all inspections in all tabs
  if (userLevel === 'Admin') {
    return true;
  }
  
  const mapping = tabStatusMapping[userLevel];
  if (!mapping) return false;
  
  const allowedStatuses = mapping[tab];
  if (!allowedStatuses) return false;
  
  return allowedStatuses.includes(status);
};

// Check if user can perform actions on inspections
export const canUserPerformActions = (userLevel) => {
  // Admin users can view all inspections but cannot perform any actions
  // Division Chief users can view all inspections but cannot perform any actions
  return userLevel !== 'Admin' && userLevel !== 'Division Chief';
};
