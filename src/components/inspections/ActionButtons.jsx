import React from 'react';

const ActionButtons = ({ inspection, onActionClick, userLevel, activeTab }) => {
  const actions = inspection.available_actions || [];

  const getButtonConfig = (action) => {
    const configs = {
      'assign_to_me': {
        label: 'Assign to Me',
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
        show: activeTab === 'received' && (userLevel === 'Section Chief' || userLevel === 'Unit Head')
      },
      'start': {
        label: 'Start Inspection',
        className: 'bg-green-600 hover:bg-green-700 text-white',
        show: ['my_inspections', 'assigned'].includes(activeTab)
      },
      'complete': {
        label: userLevel === 'Monitoring Personnel' ? 'Complete' : 'Complete',
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
        show: ['my_inspections', 'assigned'].includes(activeTab)
      },
      'forward': {
        label: 'Forward',
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        show: ['received', 'my_inspections'].includes(activeTab)
      },
      'review': {
        label: 'Review',
        className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        show: ['review', 'tracking'].includes(activeTab)
      },
      'forward_to_legal': {
        label: 'Forward to Legal',
        className: 'bg-red-600 hover:bg-red-700 text-white',
        show: activeTab === 'tracking' && userLevel === 'Division Chief'
      },
      'send_nov': {
        label: 'Send NOV',
        className: 'bg-orange-600 hover:bg-orange-700 text-white',
        show: activeTab === 'non_compliant' && userLevel === 'Legal Unit'
      },
      'send_noo': {
        label: 'Send NOO',
        className: 'bg-red-700 hover:bg-red-800 text-white',
        show: activeTab === 'non_compliant' && userLevel === 'Legal Unit'
      },
      'close': {
        label: 'Close ❌',
        className: 'bg-gray-600 hover:bg-gray-700 text-white',
        show: activeTab === 'non_compliant' && userLevel === 'Legal Unit'
      }
    };

    return configs[action] || { label: action, className: 'bg-gray-600 hover:bg-gray-700 text-white', show: true };
  };

  // If no available_actions from API, show fallback actions based on role and tab
  if (!actions || actions.length === 0) {
    const fallbackActions = [];
    
    // Always show View
    fallbackActions.push('view');
    
    // Role-based fallback actions
    switch (userLevel) {
      case 'Division Chief':
        if (activeTab === 'created') {
          // Created: [View]
        } else if (activeTab === 'tracking') {
          // Tracking: [View], [Review], [Forward to Legal]
          fallbackActions.push('review', 'forward_to_legal');
        }
        break;
        
      case 'Section Chief':
        if (activeTab === 'received') {
          // Received: [Assign to Me], [Forward]
          fallbackActions.push('assign_to_me', 'forward');
        } else if (activeTab === 'my_inspections') {
          // My: [Start Inspection], [Complete]
          fallbackActions.push('start', 'complete');
        } else if (activeTab === 'forwarded') {
          // Forwarded: [View only]
        } else if (activeTab === 'review') {
          // Review: [Review]
          fallbackActions.push('review');
        }
        break;
        
      case 'Unit Head':
        if (activeTab === 'received') {
          // Received: [Assign to Me], [Forward]
          fallbackActions.push('assign_to_me', 'forward');
        } else if (activeTab === 'my_inspections') {
          // My: [Start Inspection], [Complete]
          fallbackActions.push('start', 'complete');
        } else if (activeTab === 'forwarded') {
          // Forwarded: [View only]
        } else if (activeTab === 'review') {
          // Review: [Review]
          fallbackActions.push('review');
        }
        break;
        
      case 'Monitoring Personnel':
        if (activeTab === 'assigned') {
          // Assigned: [Start Inspection], [Complete (Compliant)], [Complete (Non-Compliant)]
          fallbackActions.push('start', 'complete');
        }
        break;
        
      case 'Legal Unit':
        if (activeTab === 'non_compliant') {
          // Non-Compliant: [Send NOV], [Send NOO], [Close ❌]
          fallbackActions.push('send_nov', 'send_noo', 'close');
        }
        break;
    }
    
    return (
      <div className="flex gap-2 flex-wrap">
        {fallbackActions.map((action) => {
          const config = getButtonConfig(action);
          
          if (!config.show) return null;

          return (
            <button
              key={action}
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(inspection.id, action);
              }}
              className={`px-3 py-1 text-sm rounded font-medium transition-colors ${config.className}`}
              title={`${config.label} - ${inspection.code}`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => {
        const config = getButtonConfig(action);
        
        if (!config.show) return null;

        return (
          <button
            key={action}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(inspection.id, action);
            }}
            className={`px-3 py-1 text-sm rounded font-medium transition-colors ${config.className}`}
            title={`${config.label} - ${inspection.code}`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;