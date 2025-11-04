import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { getInspections } from '../../services/api';
import { statusDisplayMap } from '../../constants/inspectionConstants';

const EstablishmentInspectionsContent = ({ establishment }) => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspections({
        establishment: establishment.id,
        page_size: 1000
      });
      
      // Filter to only show closed inspections
      const closedInspections = (data.results || data).filter(inspection => 
        inspection.current_status === 'CLOSED_COMPLIANT' || 
        inspection.current_status === 'CLOSED_NON_COMPLIANT'
      );
      
      setInspections(closedInspections);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setError('Failed to load inspection records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [establishment]);

  useEffect(() => {
    if (establishment) {
      fetchInspections();
    }
  }, [establishment, fetchInspections]);


  const getStatusIcon = (status) => {
    if (status?.includes('COMPLETED_COMPLIANT') || status?.includes('CLOSED_COMPLIANT')) {
      return <CheckCircle size={16} className="text-green-600" />;
    } else if (status?.includes('COMPLETED_NON_COMPLIANT') || status?.includes('CLOSED_NON_COMPLIANT')) {
      return <AlertCircle size={16} className="text-red-600" />;
    }
    return <FileText size={16} className="text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const statusConfig = statusDisplayMap[status];
    if (statusConfig?.color) {
      return statusConfig.color;
    }
    
    if (status?.includes('COMPLETED_COMPLIANT') || status?.includes('CLOSED_COMPLIANT')) {
      return 'bg-green-100 text-green-800';
    } else if (status?.includes('COMPLETED_NON_COMPLIANT') || status?.includes('CLOSED_NON_COMPLIANT')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (!establishment) return null;

  return (
    <div>
      {/* Establishment Info */}
      <div className=" pb-2 rounded">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-lg font-semibold text-gray-900">{establishment.name}</span>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-600">
            {establishment.street_building}, {establishment.barangay}, {establishment.city}, {establishment.province}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-xs text-gray-500">
            Business Type: <span className="font-medium text-gray-700">{establishment.nature_of_business}</span>
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-xs text-gray-500">
            Established: <span className="font-medium text-gray-700">{establishment.year_established}</span>
          </span>
        </div>
      </div>

      {/* Inspection Records Table */}
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading inspection records...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInspections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No closed inspection records found</p>
          <p>This establishment has no completed inspections yet.</p>
        </div>
      ) : (
        <div className="overflow-auto h-[calc(100vh-325px)] border border-gray-300 rounded scroll-smooth custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
                <th className="px-3 py-2 border-b border-gray-300">Inspection Code</th>
                <th className="px-3 py-2 border-b border-gray-300">Law</th>
                <th className="px-3 py-2 border-b border-gray-300">Status</th>
                <th className="px-3 py-2 border-b border-gray-300">Created Date</th>
                <th className="px-3 py-2 border-b border-gray-300">Inspected By</th>
                <th className="px-3 py-2 text-center border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  className="text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2 font-semibold border-b border-gray-300">
                    <div className="flex items-center">
                      {getStatusIcon(inspection.current_status)}
                      <span className="ml-2">{inspection.code}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-300">
                    {inspection.law}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-300">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.current_status)}`}>
                      {statusDisplayMap[inspection.current_status]?.label || inspection.current_status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-300">
                    {new Date(inspection.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-300">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {inspection.form?.inspector_info?.name || 
                         inspection.form?.inspected_by_name || 
                         inspection.inspected_by_name || 
                         'Not specified'}
                      </span>
                      {inspection.form?.inspector_info?.level && (
                        <span className="text-xs text-gray-500">
                          {inspection.form.inspector_info.level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="relative w-20 px-3 py-2 text-center border-b border-gray-300">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/inspections/${inspection.id}/report-view`, {
                          state: { establishmentId: establishment.id, returnToInspections: true }
                        })}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white bg-sky-600 rounded hover:bg-sky-700"
                        title="View inspection details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {inspections.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {inspections.length} closed inspection record{inspections.length !== 1 ? 's' : ''} for this establishment
        </div>
      )}
    </div>
  );
};

export default EstablishmentInspectionsContent;
