export default function ViewInspection({ inspection, onClose, onOpenForm }) {
  const establishment = inspection.establishments[0];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg ">
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
          <tr className="text-xs text-center">
            <td className="p-2 border border-gray-300">{establishment.name}</td>
            <td className="p-2 border border-gray-300">
              {establishment.natureOfBusiness}
            </td>
            <td className="p-2 border border-gray-300">
              {`${establishment.address.street}, ${establishment.address.barangay}, ${establishment.address.city}, ${establishment.address.province}, ${establishment.address.postalCode}`}
            </td>
            <td className="p-2 border border-gray-300">
              {establishment.coordinates.latitude},{" "}
              {establishment.coordinates.longitude}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4">
        <strong>Section:</strong> {inspection.section}
      </p>
      <p>
        <strong>Status:</strong> {inspection.status}
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
