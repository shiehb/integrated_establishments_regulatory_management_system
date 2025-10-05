import { useState } from 'react';
import { useNotifications } from '../components/NotificationManager';
import {
  assignToMe,
  inspectInspection,
  startInspection,
  completeInspection,
  forwardInspection,
  reviewInspection,
  forwardToLegal,
  sendNOV,
  sendNOO,
  closeInspection
} from '../services/api';

export const useInspectionActions = (refreshInspections) => {
  const notifications = useNotifications();
  const [loadingActions, setLoadingActions] = useState({});

  const handleAction = async (action, inspectionId, data = {}) => {
    setLoadingActions(prev => ({ ...prev, [inspectionId]: action }));
    
    try {
      let result;
      
      switch (action) {
        case 'assign_to_me':
          result = await assignToMe(inspectionId);
          break;
        case 'inspect':
          result = await inspectInspection(inspectionId, data);
          break;
        case 'start':
          result = await startInspection(inspectionId, data);
          break;
        case 'complete':
          result = await completeInspection(inspectionId, data);
          break;
        case 'forward':
          result = await forwardInspection(inspectionId, data);
          break;
        case 'review':
          result = await reviewInspection(inspectionId, data);
          break;
        case 'forward_to_legal':
          result = await forwardToLegal(inspectionId, data);
          break;
        case 'send_nov':
          result = await sendNOV(inspectionId, data);
          break;
        case 'send_noo':
          result = await sendNOO(inspectionId, data);
          break;
        case 'close':
          result = await closeInspection(inspectionId, data);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      notifications.success(`Action completed successfully!`, { title: 'Success' });
      refreshInspections();
      return result;
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      notifications.error(
        error.message || `Failed to perform action. Please try again.`,
        { title: 'Error' }
      );
      throw error;
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[inspectionId];
        return newState;
      });
    }
  };

  const isActionLoading = (inspectionId) => {
    return loadingActions[inspectionId] || false;
  };

  return {
    handleAction,
    isActionLoading,
    loadingActions
  };
};
