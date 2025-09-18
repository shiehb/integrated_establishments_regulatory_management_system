export default function ViewInspection({ inspection, onClose }) {
  const est = inspection.establishments[0] || {};
  // inspection might carry lawHistory, additional_laws, next_inspection_date
  const lawHistory = est.law_history || inspection.law_history || [];
  const nextInspection = inspection.next_inspection_date || "-";

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
          <tr className="text-xs text-center">
            <td className="p-2 border border-gray-300">{est.name}</td>
            <td className="p-2 border border-gray-300">
              {est.natureOfBusiness}
            </td>
            <td className="p-2 border border-gray-300">{`${
              est.address?.street || ""
            }, ${est.address?.barangay || ""}, ${est.address?.city || ""}, ${
              est.address?.province || ""
            }`}</td>
            <td className="p-2 border border-gray-300">{`${
              est.coordinates?.latitude || "-"
            }, ${est.coordinates?.longitude || "-"}`}</td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p>
            <strong>Primary Section:</strong> {inspection.section}
          </p>
          <p>
            <strong>Status:</strong> {inspection.status}
          </p>
          <p>
            <strong>Next Inspection Date:</strong> {nextInspection}
          </p>
        </div>

        <div>
          <p>
            <strong>Law History</strong>
          </p>
          {lawHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No law history recorded.</p>
          ) : (
            <ul className="text-sm list-disc list-inside">
              {lawHistory.map((h, i) => (
                <li key={i}>
                  {h.law} — last inspected: {h.last_inspected_date || "-"} —
                  next: {h.next_inspection_date || "-"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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
