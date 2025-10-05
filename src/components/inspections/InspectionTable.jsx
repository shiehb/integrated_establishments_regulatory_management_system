import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

const InspectionTable = ({ inspections, onActionClick, userLevel, activeTab }) => {
  const navigate = useNavigate();

  // Debug logging
  console.log('InspectionTable received inspections:', inspections);
  console.log('First inspection in table:', inspections[0]);

  const handleRowClick = (inspection) => {
    navigate(`/inspections/${inspection.id}`);
  };



  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Establishments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Law
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inspections.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                No inspections found
              </td>
            </tr>
          ) : (
            inspections.map((inspection) => (
              <tr
                key={inspection.id}
                onClick={() => handleRowClick(inspection)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inspection.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {inspection.establishments_detail && inspection.establishments_detail.length > 0 ? (
                    inspection.establishments_detail.map((est, idx) => (
                      <div key={idx} className="mb-1">
                        <div className="font-medium">{est.name}</div>
                        <div className="text-xs text-gray-500">{est.nature_of_business}</div>
                        <div className="text-xs text-gray-400">{est.city}, {est.province}</div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No establishments</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inspection.law}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={inspection.current_status} 
                    simplifiedStatus={inspection.simplified_status} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inspection.assigned_to_name ? (
                    <div>
                      <div className="font-medium">{inspection.assigned_to_name}</div>
                      {inspection.assigned_to_level && (
                        <div className="text-xs text-gray-500">{inspection.assigned_to_level}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inspection.created_by_name ? (
                    <div>
                      <div className="font-medium">{inspection.created_by_name}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(inspection.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <ActionButtons 
                    inspection={inspection}
                    onActionClick={onActionClick}
                    userLevel={userLevel}
                    activeTab={activeTab}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InspectionTable;

