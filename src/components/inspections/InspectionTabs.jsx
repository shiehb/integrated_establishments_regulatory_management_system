import React from 'react';
import { roleTabs, tabDisplayNames } from '../../constants/inspectionConstants';

const InspectionTabs = ({ userLevel, activeTab, onTabChange }) => {
  // Get tabs for current user level
  const availableTabs = roleTabs[userLevel] || [];
  
  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tabDisplayNames[tab] || tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default InspectionTabs;
