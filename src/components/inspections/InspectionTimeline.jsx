import { useState } from 'react';
import { 
  CheckCircle, 
  ArrowRight, 
  User, 
  Calendar, 
  FileText,
  AlertCircle,
  Clock,
  Building,
  Scale
} from 'lucide-react';
import { statusDisplayMap, getStatusColorClass, getStatusBgColorClass } from '../../constants/inspectionConstants';

export default function InspectionTimeline({ history = [] }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  // Show only last 5 items initially, or all if showAll is true
  const displayHistory = showAll ? history : history.slice(0, 5);

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status) => {
    // Use status-based icons with new color scheme
    if (status?.includes('CREATED')) return <FileText className="h-4 w-4 text-gray-600" />;
    if (status?.includes('ASSIGNED')) return <ArrowRight className="h-4 w-4 text-blue-600" />;
    if (status?.includes('IN_PROGRESS')) return <Clock className="h-4 w-4 text-amber-600" />;
    if (status?.includes('COMPLETED')) return <CheckCircle className="h-4 w-4 text-sky-600" />;
    if (status?.includes('REVIEWED')) return <Scale className="h-4 w-4 text-indigo-600" />;
    if (status?.includes('LEGAL') || status?.includes('NOV') || status?.includes('NOO')) return <AlertCircle className="h-4 w-4 text-orange-600" />;
    if (status?.includes('CLOSED_COMPLIANT')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status?.includes('CLOSED_NON_COMPLIANT')) return <AlertCircle className="h-4 w-4 text-red-600" />;
    
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status) => {
    // Use standardized color scheme from statusDisplayMap
    const config = statusDisplayMap[status];
    if (!config) return 'bg-gray-100 border-gray-300';
    
    const colorMap = {
      gray: 'bg-gray-100 border-gray-300',
      blue: 'bg-blue-100 border-blue-300',
      amber: 'bg-amber-100 border-amber-300',
      sky: 'bg-sky-100 border-sky-300',
      indigo: 'bg-indigo-100 border-indigo-300',
      orange: 'bg-orange-100 border-orange-300',
      green: 'bg-green-100 border-green-300',
      red: 'bg-red-100 border-red-300'
    };
    
    return colorMap[config.color] || 'bg-gray-100 border-gray-300';
  };

  const getStatusLabel = (status) => {
    return statusDisplayMap[status]?.label || status?.replace(/_/g, ' ');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No tracking history available for this inspection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900">Inspection Timeline</h4>
        {history.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            {showAll ? 'Show Less' : `Show All (${history.length})`}
          </button>
        )}
      </div>

      {/* Timeline Items */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {displayHistory.map((entry, index) => {
          const { date, time } = formatDateTime(entry.created_at);
          const timeSince = getTimeSince(entry.created_at);
          const isExpanded = expandedItems.has(index);
          const isLast = index === displayHistory.length - 1;

          return (
            <div key={entry.id} className="relative flex items-start pb-6">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(entry.new_status)}`}>
                {getStatusIcon(entry.new_status)}
              </div>

              {/* Timeline content */}
              <div className="ml-6 flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {entry.changed_by_name || 'Unknown User'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({entry.changed_by_level || 'Unknown Role'})
                        </span>
                      </div>

                      {/* Status change */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">
                          {entry.previous_status && (
                            <>
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {getStatusLabel(entry.previous_status)}
                              </span>
                              <ArrowRight className="h-3 w-3 text-gray-400 mx-1" />
                            </>
                          )}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColorClass(entry.new_status)} ${getStatusColorClass(entry.new_status)}`}>
                          {getStatusLabel(entry.new_status)}
                        </span>
                      </div>

                      {/* Remarks */}
                      {entry.remarks && (
                        <p className="text-sm text-gray-700 mb-2">{entry.remarks}</p>
                      )}

                      {/* Assignment info */}
                      {entry.assigned_to_name && (
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowRight className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            Assigned to: <span className="font-medium">{entry.assigned_to_name}</span>
                            {entry.assigned_to_level && (
                              <span className="text-gray-500"> ({entry.assigned_to_level})</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Law and Section info */}
                      {(entry.law || entry.section) && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {entry.law && (
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>Law: {entry.law}</span>
                            </div>
                          )}
                          {entry.section && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>Section: {entry.section}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date and time */}
                    <div className="text-right text-xs text-gray-500 ml-4">
                      <div className="flex items-center space-x-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                      <div>{time}</div>
                      <div className="text-gray-400 mt-1">{timeSince}</div>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {entry.previous_status && entry.previous_status !== entry.new_status && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleExpanded(index)}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">Previous Status:</span>
                              <div className="text-gray-600">{getStatusLabel(entry.previous_status)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">New Status:</span>
                              <div className="text-gray-600">{getStatusLabel(entry.new_status)}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline line connector */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Footer */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
        Timeline shows complete inspection workflow history
      </div>
    </div>
  );
}
