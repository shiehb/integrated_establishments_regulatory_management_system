import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportModal({
  open,
  onClose,
  title = "Data Export Report",
  columns = [],
  rows = [],
  fileName = "export",
  companyName = "My Company",
  companySubtitle = "Management Information System",
  logo = null, // pass base64 or image URL
}) {
  const [exportFormat, setExportFormat] = useState("csv");

  // ✅ CSV Export
  const handleExportCSV = () => {
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [columns, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${fileName}.csv`;
    link.click();
  };

  // ✅ PDF Export with company header
  const handleExportPDF = async () => {
    const doc = new jsPDF();

    let yOffset = 15;

    // 🔹 Add Logo if provided
    if (logo) {
      try {
        doc.addImage(logo, "PNG", 14, 10, 20, 20); // (img, format, x, y, w, h)
      } catch (e) {
        console.warn("Logo could not be loaded:", e);
      }
      yOffset = 35;
    }

    // 🔹 Company Name
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, logo ? 40 : 14, 18);

    // 🔹 Company Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companySubtitle, logo ? 40 : 14, 24);

    // 🔹 Report Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, yOffset);
    yOffset += 8;

    // 🔹 Generated Date
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yOffset);
    yOffset += 5;

    // 🔹 Table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: yOffset + 2,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [23, 107, 239] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // 🔹 Footer (page numbers)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`${fileName}.pdf`);
  };

  const handleConfirmExport = () => {
    if (exportFormat === "csv") handleExportCSV();
    else handleExportPDF();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">
          Export Data
        </h3>
        <p className="mb-3 text-gray-600">
          Exporting <b>{rows.length}</b> records. Choose format:
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === "csv"}
              onChange={() => setExportFormat("csv")}
            />
            CSV (Excel)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={() => setExportFormat("pdf")}
            />
            PDF
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmExport}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
