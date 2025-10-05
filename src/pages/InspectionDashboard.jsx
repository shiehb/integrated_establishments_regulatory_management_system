import React, { useState, useEffect, useCallback } from 'react';
import { notificationManager, NOTIFICATION_TYPES } from '../components/NotificationManager';
import { 
  getInspections, 
  assignToMe, 
  startInspection, 
  completeInspection, 
  forwardInspection, 
  reviewInspection, 
  forwardToLegal, 
  sendNOV, 
  sendNOO,
  getProfile
} from '../services/api';
import InspectionTable from '../components/inspections/InspectionTable';
import CreateInspectionWizard from '../components/inspections/CreateInspectionWizard';
import CompleteModal from '../components/inspections/CompleteModal';
import ForwardModal from '../components/inspections/ForwardModal';
import NOVModal from '../components/inspections/NOVModal';
import NOOModal from '../components/inspections/NOOModal';

const InspectionDashboard = () => {
  const [userLevel, setUserLevel] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile();
      const level = profile.userlevel;
      setUserLevel(level);
      
      // Set default tab based on role
      const defaultTabs = {
        'Division Chief': 'created',
        'Section Chief': 'received',
        'Unit Head': 'received',
        'Monitoring Personnel': 'assigned',
        'Legal Unit': 'non_compliant',
      };
      setActiveTab(defaultTabs[level] || 'all');
    } catch (error) {
      setError('Failed to fetch user profile');
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching inspections for tab:', activeTab, 'userLevel:', userLevel);
      const response = await getInspections({ tab: activeTab });
      console.log('Inspections response:', response);
      console.log('First inspection data:', response.results?.[0] || response[0]);
      setInspections(response.results || response);
    } catch (error) {
      setError('Failed to fetch inspections');
      console.error('Error fetching inspections:', error);
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: 'Failed to fetch inspections'
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, userLevel]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userLevel && activeTab) {
      fetchInspections();
    }
  }, [userLevel, activeTab, fetchInspections]);

  const handleActionClick = async (inspectionId, action) => {
    const inspection = inspections.find((i) => i.id === inspectionId);
    setSelectedInspection(inspection);

    // Actions that require modals
    if (action === 'complete') {
      setActiveModal('complete');
    } else if (action === 'forward') {
      setActiveModal('forward');
    } else if (action === 'send_nov') {
      setActiveModal('nov');
    } else if (action === 'send_noo') {
      setActiveModal('noo');
    } else {
      // Direct actions without modals
      await handleDirectAction(inspectionId, action);
    }
  };

  const handleDirectAction = async (inspectionId, action) => {
    try {
      setError('');
      
      // Map action names to API functions
      switch (action) {
        case 'assign_to_me':
          await assignToMe(inspectionId);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection assigned to you'
          });
          break;
        case 'start':
          await startInspection(inspectionId);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection started'
          });
          break;
        case 'review':
          await reviewInspection(inspectionId, { remarks: 'Reviewed' });
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection reviewed'
          });
          break;
        case 'forward_to_legal':
          await forwardToLegal(inspectionId, { remarks: 'Forwarded to Legal Unit' });
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection forwarded to Legal Unit'
          });
          break;
        default:
          notificationManager.add({
            type: NOTIFICATION_TYPES.ERROR,
            title: 'Error',
            message: `Unknown action: ${action}`
          });
          return;
      }
      
      fetchInspections();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || `Failed to ${action}`;
      setError(errorMessage);
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const handleModalAction = async (action, data) => {
    try {
      setError('');
      
      // Map modal actions to API functions
      switch (action) {
        case 'complete':
          await completeInspection(selectedInspection.id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection completed'
          });
          break;
        case 'forward':
          await forwardInspection(selectedInspection.id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection forwarded'
          });
          break;
        case 'send_nov':
          await sendNOV(selectedInspection.id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Notice of Violation sent'
          });
          break;
        case 'send_noo':
          await sendNOO(selectedInspection.id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Notice of Order sent'
          });
          break;
        default:
          notificationManager.add({
            type: NOTIFICATION_TYPES.ERROR,
            title: 'Error',
            message: `Unknown modal action: ${action}`
          });
          return;
      }
      
      setActiveModal(null);
      setSelectedInspection(null);
      fetchInspections();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || `Failed to ${action}`;
      setError(errorMessage);
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const getTabs = () => {
    const tabs = {
      'Division Chief': [
        { key: 'created', label: 'Created Inspections' },
        { key: 'tracking', label: 'Tracking' },
      ],
      'Section Chief': [
        { key: 'received', label: 'Received Inspections' },
        { key: 'my_inspections', label: 'My Inspections' },
        { key: 'forwarded', label: 'Forwarded List' },
        { key: 'review', label: 'Review List' },
      ],
      'Unit Head': [
        { key: 'received', label: 'Received Inspections' },
        { key: 'my_inspections', label: 'My Inspections' },
        { key: 'forwarded', label: 'Forwarded List' },
        { key: 'review', label: 'Review List' },
      ],
      'Monitoring Personnel': [
        { key: 'assigned', label: 'Assigned Inspections' },
      ],
      'Legal Unit': [
        { key: 'non_compliant', label: 'Non-Compliant Cases' },
      ],
    };

    return tabs[userLevel] || [{ key: 'all', label: 'All Inspections' }];
  };

  const renderTabContent = () => {
    // Division Chief - Create tab
    if (activeTab === 'created' && userLevel === 'Division Chief') {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Created Inspections</h2>
            <button
              onClick={() => setShowCreateWizard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Create New Inspection
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <InspectionTable
              inspections={inspections}
              onActionClick={handleActionClick}
              userLevel={userLevel}
              activeTab={activeTab}
            />
          )}
        </div>
      );
    }

    // All other tabs
    return (
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <InspectionTable
            inspections={inspections}
            onActionClick={handleActionClick}
            userLevel={userLevel}
            activeTab={activeTab}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inspection Management</h1>
        <p className="text-gray-600 mt-1">Role: {userLevel}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {getTabs().map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Create Inspection Wizard */}
      {showCreateWizard && (
        <CreateInspectionWizard
          onClose={() => setShowCreateWizard(false)}
          onSuccess={() => {
            setShowCreateWizard(false);
            fetchInspections();
          }}
        />
      )}

      {/* Modals */}
      {activeModal === 'complete' && selectedInspection && (
        <CompleteModal
          inspection={selectedInspection}
          userLevel={userLevel}
          onClose={() => {
            setActiveModal(null);
            setSelectedInspection(null);
          }}
          onSubmit={(data) => handleModalAction('complete', data)}
        />
      )}
      {activeModal === 'forward' && selectedInspection && (
        <ForwardModal
          inspection={selectedInspection}
          onClose={() => {
            setActiveModal(null);
            setSelectedInspection(null);
          }}
          onSubmit={(data) => handleModalAction('forward', data)}
        />
      )}
      {activeModal === 'nov' && selectedInspection && (
        <NOVModal
          inspection={selectedInspection}
          onClose={() => {
            setActiveModal(null);
            setSelectedInspection(null);
          }}
          onSubmit={(data) => handleModalAction('send_nov', data)}
        />
      )}
      {activeModal === 'noo' && selectedInspection && (
        <NOOModal
          inspection={selectedInspection}
          onClose={() => {
            setActiveModal(null);
            setSelectedInspection(null);
          }}
          onSubmit={(data) => handleModalAction('send_noo', data)}
        />
      )}
    </div>
  );
};

export default InspectionDashboard;

