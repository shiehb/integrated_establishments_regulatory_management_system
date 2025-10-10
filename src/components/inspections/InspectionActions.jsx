import React from 'react';
import { actionButtonConfig, getActionButtonColorClass } from '../../constants/inspectionConstants';

const InspectionActions = ({ 
  inspection, 
  availableActions, 
  onAction,
  loading = false,
  userLevel = null
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

  // Helper function to get the appropriate label for an action
  const getActionLabel = (action, config) => {
    // Change "Close" to "Mark as Compliant" for Legal Unit and Division Chief
    if (action === 'close' && (userLevel === 'Legal Unit' || userLevel === 'Division Chief')) {
      return 'Mark as Compliant';
    }
    return config.label;
  };

  // Helper function to get the appropriate color class for an action
  const getActionColorClass = (action) => {
    // Change color to green for "Mark as Compliant" (close action for Legal Unit and Division Chief)
    if (action === 'close' && (userLevel === 'Legal Unit' || userLevel === 'Division Chief')) {
      return 'bg-green-600 hover:bg-green-700';
    }
    return getActionButtonColorClass(action);
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
        const buttonLabel = getActionLabel(action, config);

        return (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            disabled={isDisabled}
            className={`flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded ${
              getActionColorClass(action)
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={buttonLabel}
          >
            <IconComponent size={12} />
            <span>{buttonLabel}</span>
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
