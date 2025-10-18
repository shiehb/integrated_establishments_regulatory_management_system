import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Building, CheckCircle } from 'lucide-react';
import { getInspectionAvailableMonitoringPersonnel } from '../../../services/api';

const MonitoringPersonnelModal = ({ 
  open, 
  inspection, 
  onClose, 
  onSelect, 
  loading = false 
}) => {
  const [personnel, setPersonnel] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && inspection) {
      fetchAvailablePersonnel();
    }
  }, [open, inspection]);

  const fetchAvailablePersonnel = async () => {
    setLoadingPersonnel(true);
    setError(null);
    try {
      const response = await getInspectionAvailableMonitoringPersonnel(inspection.id);
      setPersonnel(response);
    } catch (err) {
      setError('Failed to load monitoring personnel');
      console.error('Error fetching monitoring personnel:', err);
    } finally {
      setLoadingPersonnel(false);
    }
  };

  const handleSelect = () => {
    if (selectedId) {
      // Find the selected personnel to get their name
      const selectedPerson = [...(personnel.district_personnel || []), ...(personnel.other_personnel || [])]
        .find(person => person.id === selectedId);
      
      if (selectedPerson) {
        onSelect(selectedId, selectedPerson);
      }
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setPersonnel([]);
    setError(null);
    onClose();
  };

  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-6 w-6 text-sky-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select Monitoring Personnel
              </h3>
              <p className="text-sm text-gray-600">
                Choose monitoring personnel for inspection {inspection.code}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loadingPersonnel ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              <span className="ml-3 text-gray-600">Loading monitoring personnel...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchAvailablePersonnel}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* District-based personnel */}
              {personnel.district_personnel && personnel.district_personnel.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="text-lg font-medium text-gray-900">
                      Recommended (Same District)
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {personnel.district_personnel.length} available
                    </span>
                  </div>
                  <div className="overflow-auto border border-gray-300 rounded-lg">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="text-xs text-left text-white bg-sky-700 sticky top-0 z-10">
                          <th className="w-6 p-1 text-center border-b border-gray-300">
                            Select
                          </th>
                          <th className="p-1 border-b border-gray-300">Name</th>
                          <th className="p-1 border-b border-gray-300">Email</th>
                          <th className="p-1 border-b border-gray-300">District</th>
                          <th className="p-1 border-b border-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personnel.district_personnel.map((person) => (
                          <tr
                            key={person.id}
                            className={`p-1 text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${
                              selectedId === person.id ? 'bg-sky-100' : ''
                            }`}
                            onClick={() => setSelectedId(person.id)}
                          >
                            <td className="p-1 text-center border-b border-gray-300">
                              <input
                                type="radio"
                                checked={selectedId === person.id}
                                onChange={() => setSelectedId(person.id)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                              />
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">
                                  {person.first_name} {person.last_name}
                                </span>
                                {selectedId === person.id && (
                                  <CheckCircle className="h-4 w-4 text-sky-600 ml-2" />
                                )}
                              </div>
                            </td>
                            <td className="p-1 border-b border-gray-300 text-gray-600">
                              {person.email}
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <div className="flex items-center text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {person.district}
                              </div>
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                District Match
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other personnel */}
              {personnel.other_personnel && personnel.other_personnel.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="text-lg font-medium text-gray-900">
                      Other Available Personnel
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {personnel.other_personnel.length} available
                    </span>
                  </div>
                  <div className="overflow-auto border border-gray-300 rounded-lg">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="text-xs text-left text-white bg-sky-700 sticky top-0 z-10">
                          <th className="w-6 p-1 text-center border-b border-gray-300">
                            Select
                          </th>
                          <th className="p-1 border-b border-gray-300">Name</th>
                          <th className="p-1 border-b border-gray-300">Email</th>
                          <th className="p-1 border-b border-gray-300">District</th>
                          <th className="p-1 border-b border-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personnel.other_personnel.map((person) => (
                          <tr
                            key={person.id}
                            className={`p-1 text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${
                              selectedId === person.id ? 'bg-sky-100' : ''
                            }`}
                            onClick={() => setSelectedId(person.id)}
                          >
                            <td className="p-1 text-center border-b border-gray-300">
                              <input
                                type="radio"
                                checked={selectedId === person.id}
                                onChange={() => setSelectedId(person.id)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                              />
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">
                                  {person.first_name} {person.last_name}
                                </span>
                                {selectedId === person.id && (
                                  <CheckCircle className="h-4 w-4 text-sky-600 ml-2" />
                                )}
                              </div>
                            </td>
                            <td className="p-1 border-b border-gray-300 text-gray-600">
                              {person.email}
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <div className="flex items-center text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {person.district}
                              </div>
                            </td>
                            <td className="p-1 border-b border-gray-300">
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                Available
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(!personnel.district_personnel || personnel.district_personnel.length === 0) &&
               (!personnel.other_personnel || personnel.other_personnel.length === 0) && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No monitoring personnel available for this inspection.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId || loading}
            className={`px-6 py-2 text-white rounded transition-colors flex items-center ${
              selectedId && !loading
                ? 'bg-sky-600 hover:bg-sky-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              'Assign & Forward'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPersonnelModal;
