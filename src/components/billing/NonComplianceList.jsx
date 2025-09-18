import { useEffect, useState } from "react";
import { mockApi } from "../../services/mockApi";

export default function NonComplianceList({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getNonCompliantReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold text-sky-600">
        Non-Compliant Establishments
      </h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No non-compliance reports found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="text-sm text-white bg-sky-700">
              <th className="p-2 border">Establishment</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Findings</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border hover:bg-gray-50">
                <td className="p-2 border">{r.establishment_name}</td>
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">{r.findings}</td>
                <td className="p-2 text-right border">
                  <button
                    onClick={() => onSelectReport(r)}
                    className="px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
