import React from 'react';
import { actionButtonConfig, getActionButtonColorClass } from '../../constants/inspectionConstants';

const InspectionActions = ({ 
  inspection, 
  availableActions, 
  onAction
}) => {
  if (!availableActions || availableActions.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No actions available
      </div>
    );
  }

  const handleAction = (action) => {
    // All actions now use simple confirmation
    onAction(action, inspection.id);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => {
        const config = actionButtonConfig[action];
        if (!config) return null;

        return (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className={`px-3 py-1 text-white rounded-md text-sm font-medium transition-colors ${getActionButtonColorClass(action)}`}
            title={config.label}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default InspectionActions;
