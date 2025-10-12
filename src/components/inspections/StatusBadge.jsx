import React from 'react';
import { statusDisplayMap, getStatusColorClass, getStatusBgColorClass, getRoleBasedStatusLabel } from '../../constants/inspectionConstants';

const StatusBadge = ({ status, inspection, userLevel, currentUser, className = '' }) => {
  const config = statusDisplayMap[status];
  
  // Get role-based label if inspection and user data provided
  const label = (inspection && userLevel && currentUser) 
    ? getRoleBasedStatusLabel(status, userLevel, inspection, currentUser.id)
    : config?.label || status;
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColorClass(status)} ${getStatusColorClass(status)} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;