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
    <div className="flex justify-center gap-1">
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
            className={`flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded ${
              getActionButtonColorClass(action)
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            title={config.label}
          >
            <IconComponent size={12} />
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
