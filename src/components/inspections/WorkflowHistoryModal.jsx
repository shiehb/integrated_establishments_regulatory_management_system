import { useState, useEffect } from 'react';
import { 
  X, 
  Clock,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { getInspectionWorkflowHistory } from '../../services/api';

export default function WorkflowHistoryModal({
  inspection,
  isOpen,
  onClose
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && inspection?.id) {
      fetchHistory();
    }
  }, [isOpen, inspection?.id]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const historyData = await getInspectionWorkflowHistory(inspection.id);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch workflow history:', error);
      setError('Failed to load workflow history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'INSPECT':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'FORWARD':
        return <ArrowRight className="w-4 h-4 text-green-600" />;
      case 'FORWARD_TO_MONITORING':
        return <ArrowRight className="w-4 h-4 text-orange-600" />;
      case 'COMPLETE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  if (!isOpen || !inspection) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Workflow History</h2>
              <p className="text-sm text-gray-600">
                Inspection: {inspection.code || `#${inspection.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Loading workflow history...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No workflow history
              </h3>
              <p className="text-gray-500">
                This inspection doesn't have any workflow history yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                const { date, time } = formatTimestamp(item.timestamp);
                
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-sky-100 rounded-full">
                        {getActionIcon(item.action)}
                      </div>
                      {index < history.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {item.action}
                        </span>
                        <span className="text-sm text-gray-500">by</span>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            {item.performed_by.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {item.performed_by.userlevel}
                          </span>
                        </div>
                      </div>

                      {item.comments && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-2">
                          <p className="text-sm text-gray-700">{item.comments}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{date} at {time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
