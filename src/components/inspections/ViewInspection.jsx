export default function ViewInspection({ inspection, onClose }) {
  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-sky-600">
        Inspection {inspection.id}
      </h2>

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
          {inspection.establishments.map((e) => (
            <tr key={e.id} className="text-xs text-center">
              <td className="p-2 border border-gray-300">{e.name}</td>
              <td className="p-2 border border-gray-300">
                {e.natureOfBusiness}
              </td>
              <td className="p-2 border border-gray-300">
                {`${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`}
              </td>
              <td className="p-2 border border-gray-300">
                {e.coordinates.latitude}, {e.coordinates.longitude}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4">
        <strong>Section:</strong> {inspection.section}
      </p>
      <p>
        <strong>Status:</strong> {inspection.status}
      </p>

      <div className="flex justify-end mt-6">
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
