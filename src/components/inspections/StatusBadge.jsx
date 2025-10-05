import React from 'react';

const StatusBadge = ({ status, simplifiedStatus }) => {
  // Use simplified_status if available, otherwise map the technical status
  const displayStatus = simplifiedStatus || mapTechnicalStatus(status);

  const statusColors = {
    'Created': 'bg-gray-100 text-gray-800',
    'New – Waiting for Action': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'Forwarded': 'bg-indigo-100 text-indigo-800',
    'Completed – Compliant': 'bg-green-200 text-green-900',
    'Completed – Non-Compliant': 'bg-red-200 text-red-900',
    'Reviewed': 'bg-purple-100 text-purple-800',
    'Reviewed (Compliant)': 'bg-purple-200 text-purple-900',
    'Reviewed (Non-Compliant)': 'bg-red-300 text-red-900',
    'For Legal Review': 'bg-orange-100 text-orange-800',
    'NOV Sent': 'bg-orange-200 text-orange-900',
    'NOO Sent': 'bg-red-300 text-red-900',
    'Closed ✅': 'bg-green-300 text-green-900 font-semibold',
    'Closed ❌': 'bg-red-400 text-red-950 font-semibold',
  };

  const colorClass = statusColors[displayStatus] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {displayStatus}
    </span>
  );
};

// Helper function to map technical status to display status
const mapTechnicalStatus = (status) => {
  const statusMap = {
    'CREATED': 'Created',
    'SECTION_ASSIGNED': 'New – Waiting for Action',
    'SECTION_IN_PROGRESS': 'In Progress',
    'SECTION_COMPLETED': 'Completed',
    'UNIT_ASSIGNED': 'New – Waiting for Action',
    'UNIT_IN_PROGRESS': 'In Progress',
    'UNIT_COMPLETED': 'Completed',
    'MONITORING_ASSIGNED': 'New – Waiting for Action',
    'MONITORING_IN_PROGRESS': 'In Progress',
    'MONITORING_COMPLETED_COMPLIANT': 'Completed – Compliant',
    'MONITORING_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
    'UNIT_REVIEWED': 'Reviewed',
    'SECTION_REVIEWED': 'Reviewed',
    'DIVISION_REVIEWED': 'Reviewed',
    'LEGAL_REVIEW': 'For Legal Review',
    'NOV_SENT': 'NOV Sent',
    'NOO_SENT': 'NOO Sent',
    'CLOSED_COMPLIANT': 'Closed ✅',
    'CLOSED_NON_COMPLIANT': 'Closed ❌',
  };

  return statusMap[status] || status;
};

export default StatusBadge;
