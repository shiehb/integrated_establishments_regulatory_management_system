import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getInspection, 
  getProfile, 
  assignToMe, 
  startInspection, 
  completeInspection, 
  forwardInspection, 
  reviewInspection, 
  forwardToLegal, 
  sendNOV, 
  sendNOO 
} from '../../services/api';
import StatusStepper from './StatusStepper';
import CompleteModal from './CompleteModal';
import ForwardModal from './ForwardModal';
import NOVModal from './NOVModal';
import NOOModal from './NOOModal';
import { notificationManager, NOTIFICATION_TYPES } from '../NotificationManager';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [userLevel, setUserLevel] = useState('');

  useEffect(() => {
    fetchInspection();
    fetchUserProfile();
  }, [id]);

  const fetchInspection = async () => {
    try {
      const inspectionData = await getInspection(id);
      setInspection(inspectionData);
    } catch (err) {
      setError('Failed to fetch inspection details');
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: 'Failed to fetch inspection details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile();
      setUserLevel(profile.userlevel);
    } catch (err) {
      console.error('Failed to fetch user profile');
    }
  };

  const handleAction = async (action, data = {}) => {
    try {
      setError('');
      let updatedInspection;

      switch (action) {
        case 'assign_to_me':
          await assignToMe(id);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection assigned to you'
          });
          break;
        case 'start':
          await startInspection(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection started'
          });
          break;
        case 'complete':
          await completeInspection(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection completed'
          });
          break;
        case 'forward':
          await forwardInspection(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection forwarded'
          });
          break;
        case 'review':
          await reviewInspection(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection reviewed'
          });
          break;
        case 'forward_to_legal':
          await forwardToLegal(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Inspection forwarded to Legal Unit'
          });
          break;
        case 'send_nov':
          await sendNOV(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Notice of Violation sent'
          });
          break;
        case 'send_noo':
          await sendNOO(id, data);
          notificationManager.add({
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Success',
            message: 'Notice of Order sent'
          });
          break;
        default:
          throw new Error('Unknown action');
      }

      // Refresh inspection data
      await fetchInspection();
      setActiveModal(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || `Failed to ${action}`;
      setError(errorMessage);
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Inspection not found</p>
        <button
          onClick={() => navigate('/inspections')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Inspections
        </button>
      </div>
    );
  }

  const isCompliant = inspection.form?.compliance_decision === 'COMPLIANT';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Inspection {inspection.code}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Status Stepper */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Workflow Progress</h2>
        <StatusStepper currentStatus={inspection.current_status} isCompliant={isCompliant} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Establishments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Establishments</h2>
            <div className="space-y-3">
              {inspection.establishments_detail?.map((est) => (
                <div key={est.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium">{est.name}</div>
                  <div className="text-sm text-gray-600">{est.nature_of_business}</div>
                  <div className="text-sm text-gray-500">
                    {est.street_building}, {est.barangay}, {est.city}, {est.province}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Form */}
          {inspection.form && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Inspection Details</h2>
              <div className="space-y-3">
                {inspection.form.scheduled_at && (
                  <div>
                    <span className="font-medium">Scheduled:</span>{' '}
                    {new Date(inspection.form.scheduled_at).toLocaleString()}
                  </div>
                )}
                {inspection.form.inspection_notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-gray-700 mt-1">{inspection.form.inspection_notes}</p>
                  </div>
                )}
                {inspection.form.findings_summary && (
                  <div>
                    <span className="font-medium">Findings:</span>
                    <p className="text-gray-700 mt-1">{inspection.form.findings_summary}</p>
                  </div>
                )}
                {inspection.form.compliance_decision !== 'PENDING' && (
                  <div>
                    <span className="font-medium">Compliance:</span>{' '}
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        inspection.form.compliance_decision === 'COMPLIANT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inspection.form.compliance_decision}
                    </span>
                  </div>
                )}
                {inspection.form.violations_found && (
                  <div>
                    <span className="font-medium text-red-600">Violations:</span>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {inspection.form.violations_found}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">History</h2>
            <div className="space-y-3">
              {inspection.history?.length > 0 ? (
                inspection.history.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-gray-300 pl-4 pb-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">
                        {entry.previous_status} → {entry.new_status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      by {entry.changed_by_name} ({entry.changed_by_level})
                    </div>
                    {entry.remarks && (
                      <div className="text-sm text-gray-700 mt-1">{entry.remarks}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No history yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Law:</span> {inspection.law}
              </div>
              <div>
                <span className="font-medium">District:</span> {inspection.district || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className="font-semibold">{inspection.simplified_status}</span>
              </div>
              <div>
                <span className="font-medium">Created by:</span> {inspection.created_by_name}
              </div>
              <div>
                <span className="font-medium">Assigned to:</span>{' '}
                {inspection.assigned_to_name || '-'}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(inspection.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          {inspection.can_user_act && inspection.available_actions?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                {inspection.available_actions.includes('assign_to_me') && (
                  <button
                    onClick={() => handleAction('assign_to_me')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Assign to Me
                  </button>
                )}
                {inspection.available_actions.includes('start') && (
                  <button
                    onClick={() => handleAction('start', { remarks: 'Started inspection' })}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start Inspection
                  </button>
                )}
                {inspection.available_actions.includes('complete') && (
                  <button
                    onClick={() => setActiveModal('complete')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Complete Inspection
                  </button>
                )}
                {inspection.available_actions.includes('forward') && (
                  <button
                    onClick={() => setActiveModal('forward')}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Forward
                  </button>
                )}
                {inspection.available_actions.includes('review') && (
                  <button
                    onClick={() =>
                      handleAction('review', { remarks: 'Reviewed and forwarded' })
                    }
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Review & Forward
                  </button>
                )}
                {inspection.available_actions.includes('forward_to_legal') && (
                  <button
                    onClick={() =>
                      handleAction('forward_to_legal', {
                        remarks: 'Forwarded non-compliant case to Legal Unit',
                      })
                    }
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Forward to Legal
                  </button>
                )}
                {inspection.available_actions.includes('send_nov') && (
                  <button
                    onClick={() => setActiveModal('nov')}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Send NOV
                  </button>
                )}
                {inspection.available_actions.includes('send_noo') && (
                  <button
                    onClick={() => setActiveModal('noo')}
                    className="w-full px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                  >
                    Send NOO
                  </button>
                )}
                {inspection.available_actions.includes('close') && (
                  <button
                    onClick={() => handleAction('close', { remarks: 'Case closed' })}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close Case
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'complete' && (
        <CompleteModal
          inspection={inspection}
          userLevel={userLevel}
          onClose={handleModalClose}
          onSubmit={(data) => handleAction('complete', data)}
        />
      )}
      {activeModal === 'forward' && (
        <ForwardModal
          inspection={inspection}
          onClose={handleModalClose}
          onSubmit={(data) => handleAction('forward', data)}
        />
      )}
      {activeModal === 'nov' && (
        <NOVModal
          inspection={inspection}
          onClose={handleModalClose}
          onSubmit={(data) => handleAction('send_nov', data)}
        />
      )}
      {activeModal === 'noo' && (
        <NOOModal
          inspection={inspection}
          onClose={handleModalClose}
          onSubmit={(data) => handleAction('send_noo', data)}
        />
      )}
    </div>
  );
};

export default InspectionDetail;

