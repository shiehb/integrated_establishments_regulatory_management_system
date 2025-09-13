import { Eye, Pencil } from "lucide-react";

export default function InspectionList({ inspections, onAdd, onEdit, onView }) {
  // Flatten the inspections to show each establishment in a separate row
  const flattenedInspections = inspections.flatMap((inspection) =>
    inspection.establishments.map((establishment) => ({
      id: inspection.id,
      establishment,
      section: inspection.section,
      status: inspection.status,
    }))
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-sky-600">Inspections</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-2 py-2 text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          + New Inspection
        </button>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-center text-white bg-sky-700">
            <th className="p-1 border">ID</th>
            <th className="p-1 border">Name</th>
            <th className="p-1 border">Nature of Business</th>
            <th className="p-1 border">Address</th>
            <th className="p-1 border">Coordinates</th>
            <th className="p-1 border">Section</th>
            <th className="p-1 border">Status</th>
            <th className="p-1 border"></th>
          </tr>
        </thead>
        <tbody>
          {flattenedInspections.map(
            ({ id, establishment, section, status }) => (
              <tr
                key={`${id}-${establishment.id}`}
                className="text-xs text-center hover:bg-gray-50"
              >
                <td className="px-2 border border-gray-300">{id}</td>
                <td className="px-2 border border-gray-300">
                  {establishment.name}
                </td>
                <td className="px-2 border border-gray-300">
                  {establishment.natureOfBusiness}
                </td>
                <td className="px-2 border border-gray-300">
                  {`${establishment.address.street}, ${establishment.address.barangay}, ${establishment.address.city}, ${establishment.address.province}, ${establishment.address.postalCode}`}
                </td>
                <td className="px-2 border border-gray-300">
                  {`${establishment.coordinates.latitude}, ${establishment.coordinates.longitude}`}
                </td>
                <td className="px-2 border border-gray-300">{section}</td>
                <td className="px-2 border border-gray-300">{status}</td>
                <td className="relative p-1 text-center border border-gray-300 w-35">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        onView({
                          id,
                          establishments: [establishment],
                          section,
                          status,
                        })
                      }
                      className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() =>
                        onEdit({
                          id,
                          establishments: [establishment],
                          section,
                          status,
                        })
                      }
                      className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
