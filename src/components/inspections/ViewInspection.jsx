export default function ViewInspection({ inspection, onClose, onOpenForm }) {
  // Safely access establishment with fallbacks
  const establishment = inspection?.establishments?.[0] || {};
  const hasEstablishment = inspection?.establishments?.length > 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-sky-600">
        Inspection {inspection?.id || "N/A"}
      </h2>

      {hasEstablishment ? (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-center text-white bg-sky-700">
              <th className="p-1 border">Name</th>
              <th className="p-1 border">Nature</th>
              <th className="p-1 border">Address</th>
              <th className="p-1 border">Coordinates</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-xs text-center">
              <td className="p-2 border border-gray-300">
                {establishment.name || "N/A"}
              </td>
              <td className="p-2 border border-gray-300">
                {establishment.natureOfBusiness || "N/A"}
              </td>
              <td className="p-2 border border-gray-300">
                {establishment.address
                  ? `${establishment.address.street || ""}, ${
                      establishment.address.barangay || ""
                    }, ${establishment.address.city || ""}, ${
                      establishment.address.province || ""
                    }, ${establishment.address.postalCode || ""}`
                  : "N/A"}
              </td>
              <td className="p-2 border border-gray-300">
                {establishment.coordinates
                  ? `${establishment.coordinates.latitude || "N/A"}, ${
                      establishment.coordinates.longitude || "N/A"
                    }`
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No establishment data available
        </div>
      )}

      <p className="mt-4">
        <strong>Section:</strong> {inspection?.section || "N/A"}
      </p>
      <p>
        <strong>Status:</strong> {inspection?.status || "N/A"}
      </p>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => onOpenForm(inspection)}
          className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          Open Inspection Form
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
