import { useState, useEffect } from "react";
import { Plus, Pencil, FileText } from "lucide-react";
import api from "../../services/api";

export default function BillingList({ onAdd, onEdit, refreshTrigger }) {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillings();
  }, [refreshTrigger]);

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const res = await api.get("billing/");
      setBillings(res.data);
    } catch (err) {
      console.error("Error fetching billings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-sky-600">Billing Records</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          <Plus size={16} /> Add Billing
        </button>
      </div>

      {billings.length === 0 ? (
        <p className="text-center text-gray-500">No billing records found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-left text-white bg-sky-700">
              <th className="p-2 border">Establishment</th>
              <th className="p-2 border">Violations</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => (
              <tr key={b.id} className="text-sm border hover:bg-gray-50">
                <td className="p-2 border">{b.establishment}</td>
                <td className="p-2 border">{b.violations}</td>
                <td className="p-2 border">₱{b.amount}</td>
                <td className="p-2 border">{b.due_date}</td>
                <td className="p-2 border">{b.status}</td>
                <td className="flex gap-2 p-2 border">
                  <button
                    onClick={() => onEdit(b)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                    <FileText size={14} /> Generate Bill
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
