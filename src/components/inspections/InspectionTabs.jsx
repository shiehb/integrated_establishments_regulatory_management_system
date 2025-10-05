import React from 'react';
import { roleTabs, tabDisplayNames } from '../../constants/inspectionConstants';

const InspectionTabs = ({ userLevel, activeTab, onTabChange, tabCounts = {} }) => {
  // Get tabs for current user level
  const availableTabs = roleTabs[userLevel] || [];
  
  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="flex space-x-8">
        {availableTabs.map((tab) => {
          const count = tabCounts[tab] || 0;
          const hasCount = count > 0;
          
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-sky-500 text-sky-600 bg-sky-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tabDisplayNames[tab] || tab}</span>
                {hasCount && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full ${
                    activeTab === tab 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default InspectionTabs;
