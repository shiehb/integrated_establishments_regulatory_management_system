import { useState } from "react";
import api from "../../services/api";

export default function EditBilling({ billData, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    establishment: billData.establishment,
    violations: billData.violations,
    amount: billData.amount,
    due_date: billData.due_date,
    status: billData.status,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`billing/${billData.id}/`, formData);
      if (window.showNotification) {
        window.showNotification("success", "Billing record updated!");
      }
      onUpdated();
      onClose();
    } catch (err) {
      if (window.showNotification) {
        window.showNotification("error", "Error updating billing record.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-sky-600">Edit Billing</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block mb-1">Establishment</label>
          <input
            type="text"
            name="establishment"
            value={formData.establishment}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Violations</label>
          <textarea
            name="violations"
            value={formData.violations}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
