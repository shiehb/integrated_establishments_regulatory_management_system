import React from 'react';
import { statusDisplayMap, getStatusColorClass, getStatusBgColorClass } from '../../constants/inspectionConstants';

const StatusBadge = ({ status, className = '' }) => {
  const config = statusDisplayMap[status];
  
  // Use standardized label from statusDisplayMap
  const label = config?.label || status;
  
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