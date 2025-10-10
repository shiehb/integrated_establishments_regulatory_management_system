import React from 'react';
import { statusDisplayMap, getStatusColorClass, getStatusBgColorClass } from '../../constants/inspectionConstants';

const StatusBadge = ({ status, className = '' }) => {
  const config = statusDisplayMap[status];
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColorClass(status)} ${getStatusColorClass(status)} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;