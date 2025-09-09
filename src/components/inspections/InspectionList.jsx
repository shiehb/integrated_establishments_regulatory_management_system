import { Eye, Pencil } from "lucide-react";

export default function InspectionList({ inspections, onAdd, onEdit, onView }) {
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
            <th className="p-1 border">Nature</th>
            <th className="p-1 border">Address</th>
            <th className="p-1 border">Coordinates</th>
            <th className="p-1 border">Section</th>
            <th className="p-1 border">Status</th>
            <th className="p-1 border"></th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((i) => (
            <tr key={i.id} className="text-xs text-center hover:bg-gray-50">
              <td className="px-2 border border-gray-300">{i.id}</td>
              <td className="px-2 border border-gray-300">
                {i.establishments.map((e) => e.name).join(", ")}
              </td>
              <td className="px-2 border border-gray-300">
                {i.establishments.map((e) => e.natureOfBusiness).join(", ")}
              </td>
              <td className="px-2 border border-gray-300">
                {i.establishments
                  .map(
                    (e) =>
                      `${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`
                  )
                  .join(" | ")}
              </td>
              <td className="px-2 border border-gray-300">
                {i.establishments
                  .map(
                    (e) =>
                      `${e.coordinates.latitude}, ${e.coordinates.longitude}`
                  )
                  .join(" | ")}
              </td>
              <td className="px-2 border border-gray-300">{i.section}</td>
              <td className="px-2 border border-gray-300">{i.status}</td>
              <td className="relative p-1 text-center border border-gray-300 w-35">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onView(i)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => onEdit(i)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
