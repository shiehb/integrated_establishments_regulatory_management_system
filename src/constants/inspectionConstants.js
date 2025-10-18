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

// Status display mapping with TailwindCSS colors - Simplified for 5-Button Strategy
export const statusDisplayMap = {
  CREATED: { label: 'Created', color: 'gray' },
  
  SECTION_ASSIGNED: { label: 'New Assignment', color: 'gray' },
  SECTION_IN_PROGRESS: { label: 'In Progress', color: 'gray' },
  SECTION_COMPLETED_COMPLIANT: { label: 'Inspection Complete ✓', color: 'gray' },
  SECTION_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete ✗', color: 'gray' },
  
  UNIT_ASSIGNED: { label: 'New Assignment', color: 'gray' },
  UNIT_IN_PROGRESS: { label: 'In Progress', color: 'gray' },
  UNIT_COMPLETED_COMPLIANT: { label: 'Inspection Complete ✓', color: 'gray' },
  UNIT_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete ✗', color: 'gray' },
  
  MONITORING_ASSIGNED: { label: 'New Assignment', color: 'gray' },
  MONITORING_IN_PROGRESS: { label: 'In Progress', color: 'gray' },
  MONITORING_COMPLETED_COMPLIANT: { label: 'Inspection Complete ✓', color: 'gray' },
  MONITORING_COMPLETED_NON_COMPLIANT: { label: 'Inspection Complete ✗', color: 'gray' },
  
  UNIT_REVIEWED: { label: 'Under Review', color: 'gray' },
  SECTION_REVIEWED: { label: 'Under Review', color: 'gray' },
  DIVISION_REVIEWED: { label: 'Under Review', color: 'gray' },
  
  LEGAL_REVIEW: { label: 'Legal Review', color: 'gray' },
  NOV_SENT: { label: 'NOV Sent', color: 'gray' },
  NOO_SENT: { label: 'NOO Sent', color: 'gray' },
  
  CLOSED_COMPLIANT: { label: 'Closed ✅', color: 'green' },
  CLOSED_NON_COMPLIANT: { label: 'Closed ❌', color: 'red' }
};

// Role-based tabs configuration
export const roleTabs = {
  'Admin': ['all_inspections'], // Admin can see all inspections in read-only mode
  'Division Chief': ['all_inspections', 'review'],
  'Section Chief': ['received', 'my_inspections', 'forwarded', 'review', 'compliance'],
  'Unit Head': ['received', 'my_inspections', 'forwarded', 'review', 'compliance'],
  'Monitoring Personnel': ['assigned', 'in_progress', 'completed'],
  'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent']
};

// Tab display names
export const tabDisplayNames = {
  all_inspections: 'All Inspections',
  review: 'Review',
  received: 'Received',
  my_inspections: 'My Inspections',
  forwarded: 'Forwarded',
  compliance: 'Compliance',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed & Reviewed',
  legal_review: 'Legal Review',
  nov_sent: 'NOV Sent',
  noo_sent: 'NOO Sent'
};

// Action button configurations with Lucide icons - 5 Button Strategy
export const actionButtonConfig = {
  assign_to_me: {
    label: 'Assign to Me',
    color: 'sky',
    icon: User
  },
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
    color: 'orange',
    icon: Scale
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
    red: 'bg-red-600 hover:bg-red-700'
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

// Get role-based status label
export const getRoleBasedStatusLabel = (status, userLevel, inspection, currentUserId) => {
  const isAssignedToMe = inspection?.assigned_to?.id === currentUserId;
  
  // If assigned to me, show detailed status
  if (isAssignedToMe) {
    const myWorkLabels = {
      'Section Chief': {
        SECTION_ASSIGNED: 'New Assignment',
        SECTION_IN_PROGRESS: 'In Progress',
        SECTION_COMPLETED_COMPLIANT: 'Completed',
        SECTION_COMPLETED_NON_COMPLIANT: 'Completed',
        UNIT_COMPLETED_COMPLIANT: 'Ready for Review',
        UNIT_COMPLETED_NON_COMPLIANT: 'Ready for Review',
        MONITORING_COMPLETED_COMPLIANT: 'Ready for Review',
        MONITORING_COMPLETED_NON_COMPLIANT: 'Ready for Review',
        UNIT_REVIEWED: 'Pending Review',
        SECTION_REVIEWED: 'Sent to Division'
      },
      'Unit Head': {
        UNIT_ASSIGNED: 'New Assignment',
        UNIT_IN_PROGRESS: 'In Progress',
        UNIT_COMPLETED_COMPLIANT: 'Completed',
        UNIT_COMPLETED_NON_COMPLIANT: 'Completed',
        MONITORING_COMPLETED_COMPLIANT: 'Ready for Review',
        MONITORING_COMPLETED_NON_COMPLIANT: 'Ready for Review',
        UNIT_REVIEWED: 'Sent to Section'
      },
      'Monitoring Personnel': {
        MONITORING_ASSIGNED: 'New Assignment',
        MONITORING_IN_PROGRESS: 'In Progress',
        MONITORING_COMPLETED_COMPLIANT: 'Completed',
        MONITORING_COMPLETED_NON_COMPLIANT: 'Completed'
      },
      'Division Chief': {
        CREATED: 'Created',
        SECTION_COMPLETED_COMPLIANT: 'Ready for Review',
        SECTION_COMPLETED_NON_COMPLIANT: 'Ready for Review',
        SECTION_REVIEWED: 'Pending Review',
        DIVISION_REVIEWED: 'Under Review'
      },
      'Legal Unit': {
        LEGAL_REVIEW: 'New Assignment',
        NOV_SENT: 'NOV Sent',
        NOO_SENT: 'NOO Sent'
      }
    };
    
    return myWorkLabels[userLevel]?.[status] || getGenericStatusLabel(status, userLevel);
  }
  
  // Not assigned to me, show generic status
  return getGenericStatusLabel(status, userLevel);
};

// Generic status for non-assigned users
const getGenericStatusLabel = (status, userLevel) => {
  // Role-specific generic labels
  const roleGenericLabels = {
    'Section Chief': {
      UNIT_ASSIGNED: 'Forwarded',
      UNIT_IN_PROGRESS: 'Forwarded',
      MONITORING_ASSIGNED: 'Forwarded',
      MONITORING_IN_PROGRESS: 'Forwarded',
      MONITORING_COMPLETED_COMPLIANT: 'Completed',
      MONITORING_COMPLETED_NON_COMPLIANT: 'Completed'
    },
    'Unit Head': {
      MONITORING_ASSIGNED: 'Forwarded',
      MONITORING_IN_PROGRESS: 'Forwarded'
    }
  };
  
  if (roleGenericLabels[userLevel]?.[status]) {
    return roleGenericLabels[userLevel][status];
  }
  
  // Default generic labels
  const genericLabels = {
    CREATED: 'Created',
    SECTION_ASSIGNED: 'Assigned to Section',
    SECTION_IN_PROGRESS: 'Assigned to Section',
    SECTION_COMPLETED_COMPLIANT: 'Completed',
    SECTION_COMPLETED_NON_COMPLIANT: 'Completed',
    UNIT_ASSIGNED: 'Assigned to Unit',
    UNIT_IN_PROGRESS: 'Assigned to Unit',
    UNIT_COMPLETED_COMPLIANT: 'Completed',
    UNIT_COMPLETED_NON_COMPLIANT: 'Completed',
    MONITORING_ASSIGNED: 'Assigned to Monitoring',
    MONITORING_IN_PROGRESS: 'Assigned to Monitoring',
    MONITORING_COMPLETED_COMPLIANT: 'Completed',
    MONITORING_COMPLETED_NON_COMPLIANT: 'Completed',
    UNIT_REVIEWED: 'Under Review',
    SECTION_REVIEWED: 'Under Review',
    DIVISION_REVIEWED: 'Under Review',
    LEGAL_REVIEW: 'With Legal',
    NOV_SENT: 'NOV Sent',
    NOO_SENT: 'NOO Sent',
    CLOSED_COMPLIANT: 'Compliant',
    CLOSED_NON_COMPLIANT: 'Non-Compliant'
  };
  
  return genericLabels[status] || status;
};

// Tab-Status Mapping: Defines which statuses appear in which tabs for each role
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
    review: [
      'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
      'SECTION_REVIEWED', 'DIVISION_REVIEWED'
    ]
  },
  'Section Chief': {
    received: ['SECTION_ASSIGNED'],
    my_inspections: ['SECTION_IN_PROGRESS'],
    forwarded: [
      'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
      'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'
    ],
    review: [
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED'
    ],
    compliance: [
      'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
      'SECTION_REVIEWED', 'DIVISION_REVIEWED', 'LEGAL_REVIEW',
      'NOV_SENT', 'NOO_SENT', 'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ]
  },
  'Unit Head': {
    received: ['UNIT_ASSIGNED'],
    my_inspections: ['UNIT_IN_PROGRESS'],
    forwarded: ['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'],
    review: [
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
    ],
    compliance: [
      'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ]
  },
  'Monitoring Personnel': {
    assigned: ['MONITORING_ASSIGNED'],
    in_progress: ['MONITORING_IN_PROGRESS'],
    completed: [
      'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
      'UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED',
      'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ]
  },
  'Legal Unit': {
    legal_review: ['LEGAL_REVIEW'],
    nov_sent: ['NOV_SENT'],
    noo_sent: ['NOO_SENT', 'CLOSED_NON_COMPLIANT']
  }
};

// Helper function to check if status should appear in tab
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
  return userLevel !== 'Admin';
};
