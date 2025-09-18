import React, { useEffect, useState } from "react";
import { fetchInspectionLists } from "../../services/api";

/**
 * Props:
 *   inspections (optional): if provided, we render from props
 *   onAdd(): called when user clicks New button
 *   onEdit(inspection): edit one inspection
 *   onView(inspection): view one inspection
 */
export default function InspectionList({
  inspections: propInspections,
  onAdd,
  onEdit,
  onView,
}) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchInspectionLists();
      setInspections(data);
    } catch (err) {
      console.error("Error loading inspections", err);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If inspections are passed as props, use them
    if (propInspections) {
      setInspections(propInspections);
    } else {
      load();
    }
  }, [propInspections]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Inspection Lists</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="px-3 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            + New
          </button>
        )}
      </div>

      {loading && <div>Loading...</div>}

      {!loading && inspections.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No inspections found.
        </div>
      )}

      {!loading && inspections.length > 0 && (
        <table className="w-full text-sm border">
          <thead className="text-white bg-sky-700">
            <tr>
              <th className="p-2 text-left border">ID</th>
              <th className="p-2 text-left border">Law</th>
              <th className="p-2 text-left border">Establishment</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Created</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((ins) => (
              <tr key={ins.id} className="hover:bg-gray-50">
                <td className="p-2 border">{ins.id}</td>
                <td className="p-2 border">{ins.law}</td>
                <td className="p-2 border">
                  {ins.metadata?.establishmentName || "-"}
                </td>
                <td className="p-2 border">{ins.status}</td>
                <td className="p-2 border">
                  {ins.created_at
                    ? new Date(ins.created_at).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(ins)}
                        className="px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                      >
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(ins)}
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
