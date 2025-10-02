import { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle, 
  Clock,
  User,
  FileText,
  MapPin
} from 'lucide-react';
import { makeInspectionDecision } from '../../services/api';

export default function WorkflowDecisionModal({
  inspection,
  isOpen,
  onClose,
  onDecisionMade,
  currentUser
}) {
  const [selectedAction, setSelectedAction] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableActions = inspection?.available_actions || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAction) {
      setError('Please select an action');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await makeInspectionDecision(inspection.id, {
        action: selectedAction,
        comments: comments.trim() || undefined
      });

      onDecisionMade(response.inspection);
      handleClose();
    } catch (error) {
      console.error('Failed to make decision:', error);
      setError(error.response?.data?.error || 'Failed to make decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAction('');
    setComments('');
    setError('');
    onClose();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'INSPECT':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'FORWARD':
        return <ArrowRight className="w-5 h-5 text-green-600" />;
      case 'FORWARD_TO_MONITORING':
        return <ArrowRight className="w-5 h-5 text-orange-600" />;
      case 'COMPLETE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'INSPECT':
        return 'I will conduct the inspection myself';
      case 'FORWARD':
        return 'Forward to the next level in the workflow';
      case 'FORWARD_TO_MONITORING':
        return 'Forward directly to monitoring personnel (bypasses unit level)';
      case 'COMPLETE':
        return 'Mark this inspection as completed';
      default:
        return action;
    }
  };

  const getNextAssigneeInfo = () => {
    if (selectedAction === 'FORWARD') {
      const currentStatus = inspection.status;
      const routingInfo = inspection.routing_info;
      
      if (currentStatus === 'SECTION_REVIEW') {
        return {
          title: 'Unit Head',
          description: 'Will be assigned based on law and section',
          personnel: routingInfo?.assigned_personnel?.unit_head
        };
      } else if (currentStatus === 'UNIT_REVIEW') {
        return {
          title: 'Monitoring Personnel',
          description: 'Will be assigned based on district and law',
          personnel: routingInfo?.assigned_personnel?.monitoring_personnel
        };
      }
    } else if (selectedAction === 'FORWARD_TO_MONITORING') {
      const routingInfo = inspection.routing_info;
      return {
        title: 'Monitoring Personnel',
        description: 'Will be assigned directly based on district and law (bypasses unit level)',
        personnel: routingInfo?.assigned_personnel?.monitoring_personnel
      };
    }
    return null;
  };

  if (!isOpen || !inspection) return null;

  const nextAssignee = getNextAssigneeInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Workflow Decision</h2>
              <p className="text-sm text-gray-600">
                Inspection: {inspection.code || `#${inspection.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Inspection Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Inspection Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Establishment:</span>
                <div className="text-gray-900">{inspection.establishment_detail?.name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Law/Section:</span>
                <div className="text-gray-900">{inspection.section}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">District:</span>
                <div className="text-gray-900">{inspection.district || 'Auto-assigned'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Status:</span>
                <div className="text-gray-900">{inspection.status}</div>
              </div>
            </div>
          </div>

          {/* Available Actions */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Available Actions</h3>
            <div className="space-y-3">
              {availableActions.map((action) => (
                <label
                  key={action}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAction === action
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="action"
                    value={action}
                    checked={selectedAction === action}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-start gap-3">
                    {getActionIcon(action)}
                    <div>
                      <div className="font-medium text-gray-900">{action}</div>
                      <div className="text-sm text-gray-600">
                        {getActionDescription(action)}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Next Assignee Information */}
          {nextAssignee && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Forwarding to {nextAssignee.title}</span>
              </div>
              <p className="text-sm text-green-700 mb-2">{nextAssignee.description}</p>
              {nextAssignee.personnel && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      {nextAssignee.personnel.name || 'To be assigned'}
                    </span>
                  </div>
                  {nextAssignee.personnel.email && (
                    <div className="text-sm text-green-700">
                      {nextAssignee.personnel.email}
                    </div>
                  )}
                  {nextAssignee.personnel.district && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      {nextAssignee.personnel.district}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes or comments about your decision..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction || isSubmitting}
            className="px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {getActionIcon(selectedAction)}
                {selectedAction}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
