// src/components/reports/OfficialInspectionTable.jsx
export default function OfficialInspectionTable({ 
  inspections = [], 
  loading = false
}) {
  // Helper functions
  const getComplianceStatus = (inspection) => {
    if (inspection.form?.compliance_decision === 'COMPLIANT') {
      return { status: 'COMPLIANT', color: 'text-green-600 bg-green-50' };
    } else if (inspection.form?.compliance_decision === 'NON_COMPLIANT') {
      return { status: 'NON_COMPLIANT', color: 'text-red-600 bg-red-50' };
    }
    return { status: 'PENDING', color: 'text-gray-600 bg-gray-50' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-auto border border-gray-300 rounded-lg h-[calc(100vh-400px)] scroll-smooth custom-scrollbar">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
            <th className="p-1 border-b border-gray-300">Code</th>
            <th className="p-1 border-b border-gray-300">Establishment</th>
            <th className="p-1 border-b text-center border-gray-300">Law</th>
            <th className="p-1 border-b text-center border-gray-300">Compliance</th>
            <th className="p-1 border-b text-center border-gray-300">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-b-2 border-sky-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-600">Loading inspections...</p>
                </div>
              </td>
            </tr>
          ) : inspections.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">
                No inspections found
              </td>
            </tr>
          ) : (
            inspections.map((inspection) => {
              const compliance = getComplianceStatus(inspection);
              return (
                <tr 
                  key={inspection.id} 
                  className=" text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-1 px-2 font-semibold border-b border-gray-300">
                    {inspection.code || 'N/A'}
                  </td>
                  <td className="p-1 px-2 border-b border-gray-300">
                    {inspection.establishments_detail?.map(est => est.name).join(', ') || 'N/A'}
                  </td>
                  <td className="p-1 px-2 text-center border-b border-gray-300">
                    {inspection.law || 'N/A'}
                  </td>

                  <td className="p-1 px-2 text-center border-b border-gray-300">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${compliance.color}`}>
                      {compliance.status}
                    </span>
                  </td>
                  <td className="p-1 px-2 text-center border-b border-gray-300">
                    {formatDate(inspection.updated_at)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}