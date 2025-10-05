import React, { useState, useEffect } from 'react';
import { getInspections, getProfile } from '../../services/api';

const DebugActions = () => {
  const [inspections, setInspections] = useState([]);
  const [userLevel, setUserLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching inspections and profile...');
      const [inspectionsData, profileData] = await Promise.all([
        getInspections({ page: 1, page_size: 5 }),
        getProfile()
      ]);
      
      console.log('Inspections data:', inspectionsData);
      console.log('Profile data:', profileData);
      
      setInspections(inspectionsData.results || inspectionsData);
      setUserLevel(profileData.userlevel);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Debug Actions</h2>
      <p className="mb-4">User Level: <strong>{userLevel}</strong></p>
      
      <div className="space-y-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{inspection.code}</h3>
            <p>Status: <strong>{inspection.current_status}</strong></p>
            <p>Assigned to: <strong>{inspection.assigned_to_name || 'Unassigned'}</strong></p>
            <p>Available Actions: <strong>{inspection.available_actions?.length || 0}</strong></p>
            <p>Available Actions Array: <code>{JSON.stringify(inspection.available_actions)}</code></p>
            <p>Can User Act: <strong>{inspection.can_user_act ? 'Yes' : 'No'}</strong></p>
            
            <div className="mt-2">
              <h4 className="font-medium">Full Inspection Object:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(inspection, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugActions;
