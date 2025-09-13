import { useState, useEffect } from "react";
import { Pencil, Map, Plus } from "lucide-react";
import { getEstablishments } from "../../services/api";

export default function EstablishmentList({
  onAdd,
  onEdit,
  onPolygon,
  refreshTrigger,
}) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstablishments();
  }, [refreshTrigger]);

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching establishments");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4">Loading establishments...</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-2 py-2 text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          <Plus size={18} /> Add Establishment
        </button>
      </div>

      {/* Table - Always show the header */}
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-center text-white bg-sky-700">
            <th className="p-1 border border-gray-300">Name</th>
            <th className="p-1 border border-gray-300">Nature of Business</th>
            <th className="p-1 border border-gray-300">Year Established</th>
            <th className="p-1 border border-gray-300">Address</th>
            <th className="p-1 border border-gray-300">Coordinates</th>
            <th className="p-1 text-right border border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {establishments.length === 0 ? (
            // Show message when no establishments
            <tr>
              <td
                colSpan="6"
                className="px-2 py-4 text-center text-gray-500 border border-gray-300"
              >
                There are no establishments to display.
              </td>
            </tr>
          ) : (
            // Show establishments when available
            establishments.map((e) => (
              <tr
                key={e.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
              >
                <td className="px-2 border border-gray-300">{e.name}</td>
                <td className="px-2 text-center border border-gray-300">
                  {e.nature_of_business}
                </td>
                <td className="px-2 text-center border border-gray-300">
                  {e.year_established}
                </td>
                <td className="px-2 border border-gray-300">
                  {e.street_building}, {e.barangay}, {e.city}, {e.province},{" "}
                  {e.postal_code}
                </td>
                <td className="px-2 text-center border border-gray-300">
                  {e.latitude}, {e.longitude}
                </td>
                <td className="relative w-40 p-1 text-center border border-gray-300">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(e)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                      title="Edit"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => onPolygon(e)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                      title="Polygon"
                    >
                      <Map size={14} />
                      Polygon
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
