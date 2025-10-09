import React from "react";

/* ---------------------------
   Tab Navigation Component
   ---------------------------*/
export default function TabNavigation({ activeSection, onTabClick }) {
  const tabs = [
    { id: 'general', label: 'General Information' },
    { id: 'purpose', label: 'Purpose of Inspection' },
    { id: 'compliance-status', label: 'Compliance Status' },
    { id: 'summary-compliance', label: 'Summary of Compliance' },
    { id: 'findings', label: 'Summary of Findings and Observations' },
    { id: 'recommendations', label: 'Recommendations' }
  ];

  const handleTabClick = (sectionId) => {
    onTabClick(sectionId);
  };

  return (
    <div className="sticky top-[60px] z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200
                ${activeSection === tab.id
                  ? 'text-sky-700 border-b-2 border-sky-700 bg-sky-50'
                  : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {activeSection === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-700" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
