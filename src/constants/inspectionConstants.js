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

// Status display mapping with TailwindCSS colors
export const statusDisplayMap = {
  CREATED: { label: 'Created', color: 'gray' },
  SECTION_ASSIGNED: { label: 'Waiting for Section', color: 'blue' },
  SECTION_IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  SECTION_COMPLETED: { label: 'Section Completed', color: 'green' },
  UNIT_ASSIGNED: { label: 'Assigned to Unit', color: 'blue' },
  UNIT_IN_PROGRESS: { label: 'Unit In Progress', color: 'yellow' },
  UNIT_COMPLETED: { label: 'Unit Completed', color: 'green' },
  MONITORING_ASSIGNED: { label: 'Assigned for Monitoring', color: 'indigo' },
  MONITORING_IN_PROGRESS: { label: 'Monitoring Ongoing', color: 'amber' },
  MONITORING_COMPLETED_COMPLIANT: { label: 'Compliant ✅', color: 'green' },
  MONITORING_COMPLETED_NON_COMPLIANT: { label: 'Non-Compliant ❌', color: 'red' },
  UNIT_REVIEWED: { label: 'Unit Reviewed', color: 'purple' },
  SECTION_REVIEWED: { label: 'Section Reviewed', color: 'purple' },
  DIVISION_REVIEWED: { label: 'Division Reviewed', color: 'purple' },
  LEGAL_REVIEW: { label: 'For Legal Review', color: 'orange' },
  NOV_SENT: { label: 'Notice of Violation Sent', color: 'purple' },
  NOO_SENT: { label: 'Notice of Order Sent', color: 'pink' },
  CLOSED_COMPLIANT: { label: 'Closed ✅', color: 'green' },
  CLOSED_NON_COMPLIANT: { label: 'Closed ❌', color: 'rose' }
};

// Role-based tabs configuration
export const roleTabs = {
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
  completed: 'Completed',
  legal_review: 'Legal Review',
  nov_sent: 'NOV Sent',
  noo_sent: 'NOO Sent'
};

// Action button configurations with Lucide icons
export const actionButtonConfig = {
  assign_to_me: {
    label: 'Assign to Me',
    color: 'blue',
    icon: User
  },
  inspect: {
    label: 'Inspect',
    color: 'indigo',
    icon: Eye
  },
  start: {
    label: 'Start Inspection',
    color: 'green',
    icon: Play
  },
  complete: {
    label: 'Complete',
    color: 'emerald',
    icon: CheckCircle
  },
  forward: {
    label: 'Forward',
    color: 'blue',
    icon: ArrowRight
  },
  review: {
    label: 'Review',
    color: 'purple',
    icon: Eye
  },
  forward_to_legal: {
    label: 'Forward to Legal',
    color: 'orange',
    icon: Scale
  },
  send_nov: {
    label: 'Send NOV',
    color: 'red',
    icon: FileText
  },
  send_noo: {
    label: 'Send NOO',
    color: 'pink',
    icon: FileCheck
  },
  close: {
    label: 'Close',
    color: 'gray',
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
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    pink: 'text-pink-600',
    rose: 'text-rose-600'
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
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    indigo: 'bg-indigo-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    pink: 'bg-pink-100',
    rose: 'bg-rose-100'
  };
  
  return colorMap[config.color] || 'bg-gray-100';
};

// Helper function to get action button color class
export const getActionButtonColorClass = (action) => {
  const config = actionButtonConfig[action];
  if (!config) return 'bg-gray-500 hover:bg-gray-600';
  
  const colorMap = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red: 'bg-red-500 hover:bg-red-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    gray: 'bg-gray-500 hover:bg-gray-600'
  };
  
  return colorMap[config.color] || 'bg-gray-500 hover:bg-gray-600';
};
