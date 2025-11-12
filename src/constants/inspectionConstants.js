// Import Lucide icons
import { 
  Play, 
  ArrowRight, 
  Eye, 
  Scale, 
  FileText, 
  Lock,
  RotateCcw
} from 'lucide-react';

// Inspection workflow constants and mappings

// Status display mapping with TailwindCSS colors - Professional color-coded system
export const statusDisplayMap = {
  // Creation Stage (Gray)
  CREATED: { label: 'Draft', color: 'gray' },
  SECTION_ASSIGNED: { label: 'Assigned', color: 'gray' },
  UNIT_ASSIGNED: { label: 'Assigned', color: 'gray' },
  MONITORING_ASSIGNED: { label: 'Assigned', color: 'gray' },
  
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
  'Admin': ['all_inspections', 'compliant', 'non_compliant'], // Admin sees all inspections in read-only mode
  'Division Chief': ['all_inspections', 'review', 'reviewed', 'compliant', 'non_compliant'],
  'Section Chief': ['section_assigned', 'section_in_progress', 'forwarded', 'inspection_complete', 'review', 'under_review', 'compliant', 'non_compliant'],
  'Unit Head': ['unit_assigned', 'unit_in_progress', 'forwarded', 'inspection_complete', 'review', 'under_review', 'compliant', 'non_compliant'],
  'Monitoring Personnel': ['assigned', 'in_progress', 'inspection_complete', 'under_review', 'compliant', 'non_compliant'],
  'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent', 'compliant', 'non_compliant']
};

// Tab display names (organized and complete)
export const tabDisplayNames = {
  // General
  all_inspections: 'All Inspections',
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant',

  // Division Chief Review Workflow
  review: 'Review',
  reviewed: 'Reviewed',

  // Shared Workflow (Section / Unit / Monitoring)
  under_review: 'Under Review',
  forwarded: 'Forwarded',
  inspection_complete: 'Inspection Complete',

  // Section-Level Workflow
  section_assigned: 'Assigned',
  section_in_progress: 'In Progress',

  // Unit-Level Workflow
  unit_assigned: 'Assigned',
  unit_in_progress: 'In Progress',

  // Monitoring Workflow
  assigned: 'Assigned',
  in_progress: 'In Progress',

  // Legal Process
  legal_review: 'Legal Review',
  nov_sent: 'NOV Sent',
  noo_sent: 'NOO Sent',
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
    color: 'green',
    icon: Scale
  },
  return_to_previous: {
    label: 'Return',
    color: 'gray',
    icon: RotateCcw
  },
  return_to_monitoring: {
    label: 'Return to Monitoring',
    color: 'gray',
    icon: RotateCcw
  },
  return_to_unit: {
    label: 'Return to Unit',
    color: 'gray',
    icon: RotateCcw
  },
  return_to_section: {
    label: 'Return to Section',
    color: 'gray',
    icon: RotateCcw
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
    orange: 'bg-orange-600 hover:bg-orange-700',
    gray: 'bg-gray-500 hover:bg-gray-600'
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

// Get standardized status label (same for all roles)
export const getRoleBasedStatusLabel = (status) => {
  // Return standardized label from statusDisplayMap for all users
  return statusDisplayMap[status]?.label || status;
};

// Tab-Status Mapping: Defines which statuses appear in which tabs for each role
// NOTE: This mapping is for reference only. The backend (server/inspections/views.py) 
// is the source of truth for tab filtering. All tab filtering is done server-side.
export const tabStatusMapping = {
  'Division Chief': {
    all_inspections: [
      'CREATED',
      'SECTION_ASSIGNED',
      'SECTION_IN_PROGRESS',
      'SECTION_COMPLETED_COMPLIANT',
      'SECTION_COMPLETED_NON_COMPLIANT',
      'UNIT_ASSIGNED',
      'UNIT_IN_PROGRESS',
      'UNIT_COMPLETED_COMPLIANT',
      'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_ASSIGNED',
      'MONITORING_IN_PROGRESS',
      'MONITORING_COMPLETED_COMPLIANT',
      'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED',
      'SECTION_REVIEWED',
      'DIVISION_REVIEWED',
      'LEGAL_REVIEW',
      'NOV_SENT',
      'NOO_SENT',
      'CLOSED_COMPLIANT',
      'CLOSED_NON_COMPLIANT'
    ],
    review: [
      'SECTION_REVIEWED',
      'SECTION_COMPLETED_COMPLIANT',
      'SECTION_COMPLETED_NON_COMPLIANT'
    ],
    reviewed: ['DIVISION_REVIEWED'],
    compliant: ['CLOSED_COMPLIANT'],
    non_compliant: ['CLOSED_NON_COMPLIANT'],
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
    review: [
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    legal_action: ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'],
    compliant: ['CLOSED_COMPLIANT'],
    non_compliant: ['CLOSED_NON_COMPLIANT']
  },
  'Unit Head': {
    unit_assigned: ['UNIT_ASSIGNED'],
    unit_in_progress: ['UNIT_IN_PROGRESS'],
    forwarded: ['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'],
    inspection_complete: [
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    review: [
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    compliant: ['CLOSED_COMPLIANT'],
    non_compliant: ['CLOSED_NON_COMPLIANT']
  },
  'Monitoring Personnel': {
    assigned: ['MONITORING_ASSIGNED'],
    in_progress: ['MONITORING_IN_PROGRESS'],
    inspection_complete: [
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    under_review: ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'],
    compliant: ['CLOSED_COMPLIANT'],
    non_compliant: ['CLOSED_NON_COMPLIANT']
  },
  'Legal Unit': {
    legal_review: ['LEGAL_REVIEW'],
    nov_sent: ['NOV_SENT'],
    noo_sent: ['NOO_SENT', 'CLOSED_NON_COMPLIANT'],
    compliant: ['CLOSED_COMPLIANT'],
    non_compliant: ['CLOSED_NON_COMPLIANT']
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

export const tabStatusFilters = {
  draft: ['CREATED', 'DRAFT'],
  section_assigned: ['SECTION_ASSIGNED'],
  section_in_progress: ['SECTION_IN_PROGRESS'],
  review: [
    'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
    'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
    'UNIT_REVIEWED', 'SECTION_COMPLETED_COMPLIANT',
    'SECTION_COMPLETED_NON_COMPLIANT', 'SECTION_REVIEWED'
  ],
  forwarded: ['FORWARDED', 'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS'],
  inspection_complete: ['INSPECTION_COMPLETE'],
  under_review: ['UNDER_REVIEW'],
  reviewed: ['DIVISION_REVIEWED'],
  legal_action: ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'],
  assigned: ['MONITORING_ASSIGNED', 'UNIT_ASSIGNED'],
  in_progress: ['MONITORING_IN_PROGRESS', 'UNIT_IN_PROGRESS'],
  unit_assigned: ['UNIT_ASSIGNED'],
  unit_in_progress: ['UNIT_IN_PROGRESS'],
  legal_review: ['LEGAL_REVIEW'],
  nov_sent: ['NOV_SENT'],
  noo_sent: ['NOO_SENT', 'CLOSED_NON_COMPLIANT']
};
