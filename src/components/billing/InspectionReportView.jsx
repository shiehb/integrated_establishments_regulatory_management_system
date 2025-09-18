import { useState } from "react";
import { mockApi } from "../../services/mockApi";
import BillingReportPDF from "./BillingReportPDF";

export default function InspectionReportView({
  report,
  onBack,
  onBillingCreated,
}) {
  const [violations, setViolations] = useState(
    report.violations.map((v) => ({ ...v, selected: false, amount: "" }))
  );
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleViolation = (id) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleAmountChange = (id, value) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, amount: value } : v))
    );
  };

  const createBilling = async () => {
    setLoading(true);
    try {
      const selected = violations.filter((v) => v.selected && v.amount);
      const bill = await mockApi.createBillingFromReport(report.id, selected);
      setBilling(bill);
      if (window.showNotification) {
        window.showNotification("success", "Billing report created!");
      }
      onBillingCreated();
    } catch (err) {
      console.error("Error creating billing:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <button
        onClick={onBack}
        className="px-3 py-1 mb-4 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      <h2 className="mb-4 text-xl font-bold text-sky-600">Inspection Report</h2>
      <p className="mb-2">
        <strong>Findings:</strong> {report.findings}
      </p>

      <table className="w-full mb-4 border">
        <thead>
          <tr className="text-sm bg-gray-100">
            <th className="p-2 border">Select</th>
            <th className="p-2 border">Violation</th>
            <th className="p-2 border">Law</th>
            <th className="p-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v) => (
            <tr key={v.id} className="border">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={v.selected}
                  onChange={() => toggleViolation(v.id)}
                />
              </td>
              <td className="p-2 border">{v.description}</td>
              <td className="p-2 border">{v.law}</td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={v.amount}
                  onChange={(e) => handleAmountChange(v.id, e.target.value)}
                  className="w-24 p-1 border rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!billing ? (
        <div className="flex justify-end">
          <button
            onClick={createBilling}
            disabled={loading}
            className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            {loading ? "Creating..." : "Create Billing Report"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-green-600">
            Billing Created!
          </h3>
          <BillingReportPDF billing={billing} />
        </div>
      )}
    </div>
  );
}
