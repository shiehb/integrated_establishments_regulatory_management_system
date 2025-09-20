import { useState } from "react";
import { mockApi } from "../../services/mockApi";
import BillingReportPDF from "./BillingReportPDF";
import ExportModal from "../ExportModal";

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
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Prepare data for ExportModal
  const exportColumns = ["Violation", "Law", "Description", "Status"];
  const exportRows = report.violations.map((v) => [
    v.code || "N/A",
    v.law,
    v.description,
    v.status || "Not Resolved",
  ]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          Export Report
        </button>
      </div>

      <h2 className="mb-4 text-xl font-bold text-sky-600">Inspection Report</h2>

      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
        <div>
          <p className="mb-1">
            <strong>Establishment:</strong> {report.establishment_name}
          </p>
          <p className="mb-1">
            <strong>Inspection Date:</strong> {report.date}
          </p>
          <p className="mb-1">
            <strong>Inspector:</strong> {report.inspector || "Not specified"}
          </p>
        </div>
        <div>
          <p className="mb-1">
            <strong>Status:</strong> {report.status || "Completed"}
          </p>
          <p className="mb-1">
            <strong>Follow-up Required:</strong>{" "}
            {report.follow_up_required ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="p-3 mb-4 rounded bg-gray-50">
        <p className="font-semibold">Findings:</p>
        <p>{report.findings}</p>
      </div>

      <h3 className="mb-3 text-lg font-semibold">Violations</h3>
      <table className="w-full mb-4 border">
        <thead>
          <tr className="text-sm bg-gray-100">
            <th className="p-2 border">Select</th>
            <th className="p-2 border">Violation</th>
            <th className="p-2 border">Law</th>
            <th className="p-2 border">Description</th>
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
              <td className="p-2 border">{v.code || "N/A"}</td>
              <td className="p-2 border">{v.law}</td>
              <td className="p-2 border">{v.description}</td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={v.amount}
                  onChange={(e) => handleAmountChange(v.id, e.target.value)}
                  className="w-24 p-1 border rounded"
                  placeholder="0.00"
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
            disabled={
              loading ||
              violations.filter((v) => v.selected && v.amount).length === 0
            }
            className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Billing Report"}
          </button>
        </div>
      ) : (
        <div className="p-3 mt-4 rounded bg-green-50">
          <h3 className="text-lg font-semibold text-green-600">
            Billing Created Successfully!
          </h3>
          <div className="mt-2">
            <BillingReportPDF billing={billing} />
          </div>
        </div>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`Inspection Report - ${report.establishment_name}`}
        fileName={`inspection_report_${report.id}`}
        columns={exportColumns}
        rows={exportRows}
        customPdfGenerator={(doc, columns, rows) => {
          // Custom PDF generator for inspection reports
          doc.setFontSize(16);
          doc.text("INSPECTION REPORT", 105, 20, null, null, "center");

          doc.setFontSize(12);
          doc.text(`Establishment: ${report.establishment_name}`, 20, 35);
          doc.text(`Inspection Date: ${report.date}`, 20, 45);
          doc.text(`Report ID: ${report.id}`, 20, 55);

          // Add findings section
          doc.setFontSize(12);
          doc.setFont(undefined, "bold");
          doc.text("Findings:", 20, 70);
          doc.setFont(undefined, "normal");

          // Split findings into multiple lines if too long
          const findingsLines = doc.splitTextToSize(report.findings, 170);
          doc.text(findingsLines, 20, 80);

          // Calculate Y position for table based on findings length
          const tableStartY = 80 + findingsLines.length * 6 + 10;

          // Add violations table
          autoTable(doc, {
            startY: tableStartY,
            head: [columns],
            body: rows,
            theme: "grid",
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: "bold",
            },
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            margin: { left: 20, right: 20 },
          });
        }}
      />
    </div>
  );
}
