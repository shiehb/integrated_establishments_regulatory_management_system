import React, { useState, useEffect } from 'react';
import { Clock, FileText, Eye, Calendar, User, Building, ChevronDown, ChevronUp, ClipboardList, Loader2 } from 'lucide-react';
import { getInspections } from '../../../services/api';

// Status display mapping using standardized labels
const getInspectionStatusDisplay = (status) => {
  const statusMap = {
    // Creation Stage
    'CREATED': 'Draft',
    
    // Assignment Stage
    'SECTION_ASSIGNED': 'Assigned',
    'UNIT_ASSIGNED': 'Assigned',
    'MONITORING_ASSIGNED': 'Assigned',
    
    // In Progress Stage
    'SECTION_IN_PROGRESS': 'In Progress',
    'UNIT_IN_PROGRESS': 'In Progress',
    'MONITORING_IN_PROGRESS': 'In Progress',
    
    // Completed Stage
    'SECTION_COMPLETED_COMPLIANT': 'Inspection Complete',
    'SECTION_COMPLETED_NON_COMPLIANT': 'Inspection Complete',
    'UNIT_COMPLETED_COMPLIANT': 'Inspection Complete',
    'UNIT_COMPLETED_NON_COMPLIANT': 'Inspection Complete',
    'MONITORING_COMPLETED_COMPLIANT': 'Inspection Complete',
    'MONITORING_COMPLETED_NON_COMPLIANT': 'Inspection Complete',
    
    // Review Stage
    'UNIT_REVIEWED': 'Under Review',
    'SECTION_REVIEWED': 'Under Review',
    'DIVISION_REVIEWED': 'Under Review',
    
    // Legal Stage
    'LEGAL_REVIEW': 'Legal Review',
    'NOV_SENT': 'NOV Issued',
    'NOO_SENT': 'NOO Issued',
    
    // Final Stage
    'CLOSED_COMPLIANT': 'Compliant',
    'CLOSED_NON_COMPLIANT': 'Non-Compliant',
  };
  
  return statusMap[status] || status;
};

// Status badge with professional color scheme
const getInspectionStatusBadge = (status) => {
  const displayName = getInspectionStatusDisplay(status);
  
  // Color mapping based on workflow stages
  const getStatusStyle = (status) => {
    switch (status) {
      // Creation Stage (Gray)
      case 'CREATED':
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
      
      // Assignment Stage (Blue)
      case 'SECTION_ASSIGNED':
      case 'UNIT_ASSIGNED':
      case 'MONITORING_ASSIGNED':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
      
      // In Progress Stage (Amber)
      case 'SECTION_IN_PROGRESS':
      case 'UNIT_IN_PROGRESS':
      case 'MONITORING_IN_PROGRESS':
        return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      
      // Completed Stage (Sky)
      case 'SECTION_COMPLETED_COMPLIANT':
      case 'SECTION_COMPLETED_NON_COMPLIANT':
      case 'UNIT_COMPLETED_COMPLIANT':
      case 'UNIT_COMPLETED_NON_COMPLIANT':
      case 'MONITORING_COMPLETED_COMPLIANT':
      case 'MONITORING_COMPLETED_NON_COMPLIANT':
        return { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' };
      
      // Review Stage (Indigo)
      case 'UNIT_REVIEWED':
      case 'SECTION_REVIEWED':
      case 'DIVISION_REVIEWED':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' };
      
      // Legal Stage (Orange)
      case 'LEGAL_REVIEW':
      case 'NOV_SENT':
      case 'NOO_SENT':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
      
      // Final Stage (Green/Red)
      case 'CLOSED_COMPLIANT':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      case 'CLOSED_NON_COMPLIANT':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };
  
  const style = getStatusStyle(status);
  
  return (
    <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-semibold border rounded w-45 ${style.bg} ${style.text} ${style.border}`}>
      {displayName}
    </span>
  );
};

export default function InspectionReportsTable({ userLevel, userProfile }) {
  const [pendingReports, setPendingReports] = useState([]);
  const [receivedReports, setReceivedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [userLevel, userProfile]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch pending reports based on user level
      const pendingParams = getPendingParams(userLevel);
      const receivedParams = getReceivedParams(userLevel);

      const [pendingData, receivedData] = await Promise.all([
        getInspections(pendingParams),
        getInspections(receivedParams)
      ]);

      setPendingReports(pendingData.results || []);
      setReceivedReports(receivedData.results || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingParams = (userLevel) => {
    const baseParams = { page: 1, page_size: 20 };
    
    switch (userLevel) {
      case 'Section Chief':
      return { ...baseParams, tab: 'section_assigned' };
      case 'Unit Head':
      return { ...baseParams, tab: 'unit_assigned' };
      case 'Monitoring Personnel':
        return { ...baseParams, tab: 'assigned' };
      case 'Legal Unit':
        return { ...baseParams, tab: 'legal_review' };
      default:
        return baseParams;
    }
  };

  const getReceivedParams = (userLevel) => {
    const baseParams = { page: 1, page_size: 20 };
    
    switch (userLevel) {
      case 'Section Chief':
      return { ...baseParams, tab: 'section_in_progress' };
      case 'Unit Head':
      return { ...baseParams, tab: 'unit_in_progress' };
      case 'Monitoring Personnel':
        return { ...baseParams, tab: 'in_progress' };
      case 'Legal Unit':
        return { ...baseParams, tab: 'nov_sent' };
      default:
        return baseParams;
    }
  };


  const renderTable = (reports, type) => {
    if (loading) {
      return (
        <div className="overflow-auto h-[calc(100vh-400px)] border border-gray-300 rounded-lg scroll-smooth relative custom-scrollbar">
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading {type} reports...</span>
            </div>
          </div>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="overflow-auto h-[calc(100vh-400px)] border border-gray-300 rounded-lg scroll-smooth relative custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
                <th className="px-3 py-2 border-b border-gray-300">Date & Time</th>
                <th className="px-3 py-2 border-b border-gray-300">Establishment</th>
                <th className="px-3 py-2 border-b border-gray-300">Inspector</th>
                <th className="px-3 py-2 border-b border-gray-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="px-2 py-4 text-center text-gray-500 border-b border-gray-300">
                  <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No {type} reports found</p>
                  <p className="text-sm text-gray-400 mt-1">Reports will appear here when available</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-auto max-h-[calc(100vh-400px)] border border-gray-300 rounded-lg scroll-smooth relative custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
              <th className="px-3 py-2 border-b border-gray-300">Date & Time</th>
              <th className="px-3 py-2 border-b border-gray-300">Establishment</th>
              <th className="px-3 py-2 border-b border-gray-300">Inspector</th>
              <th className="px-3 py-2 border-b border-gray-300 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr
                key={report.id || index}
                className="text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 border-b border-gray-300">
                  <div className="flex items-center">
                    <ClipboardList size={14} className="text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-gray-300">
                  <div className="font-medium text-gray-900">
                    {report.establishments_detail?.[0]?.name || 'N/A'}
                  </div>
                  {report.establishments_detail?.length > 1 && (
                    <div className="text-xs text-gray-500">
                      +{report.establishments_detail.length - 1} more
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-gray-300">
                  <div className="font-medium text-gray-900">
                    {report.assigned_to_name || 'Unassigned'}
                  </div>
                </td>
                <td className="px-3 py-2 text-center border-b border-gray-300">
                  {getInspectionStatusBadge(report.current_status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get tab labels based on user level
  const getTabLabels = () => {
    switch (userLevel) {
      case 'Legal Unit':
        return {
          pending: 'Legal Review',
          received: 'NOV Sent'
        };
      default:
        return {
          pending: 'Pending',
          received: 'Received'
        };
    }
  };

  const tabLabels = getTabLabels();

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            {tabLabels.pending} ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {tabLabels.received} ({receivedReports.length})
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'pending' 
          ? renderTable(pendingReports, 'pending')
          : renderTable(receivedReports, 'received')
        }
      </div>
    </div>
  );
}
