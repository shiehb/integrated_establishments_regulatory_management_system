import React from 'react';
import { actionButtonConfig, getActionButtonColorClass } from '../../constants/inspectionConstants';

const InspectionActions = ({ 
  inspection, 
  availableActions, 
  onAction,
  loading = false
}) => {
  if (!availableActions || availableActions.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No actions available
      </div>
    );
  }

  const handleActionClick = (action) => {
    console.log('Action clicked:', action, 'for inspection:', inspection.id);
    onAction(action, inspection.id);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => {
        const config = actionButtonConfig[action];
        if (!config) {
          console.warn(`No config found for action: ${action}`);
          return null;
        }

        const IconComponent = config.icon;
        const isDisabled = loading;

        return (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            disabled={isDisabled}
            className={`px-3 py-2 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              getActionButtonColorClass(action)
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            title={config.label}
          >
            <IconComponent className="h-4 w-4" />
            <span>{config.label}</span>
            {loading && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default InspectionActions;
