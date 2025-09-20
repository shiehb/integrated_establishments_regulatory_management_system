import { useState } from "react";
import { FileText, FileSpreadsheet, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportModal({
  open,
  onClose,
  title,
  fileName,
  columns,
  rows,
  customPdfGenerator, // New prop for custom PDF generation
}) {
  const [exportType, setExportType] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Normalize the title
  const normalizeTitle = (t) =>
    t
      .replace(/export/gi, "")
      .replace(/report/gi, "")
      .trim();

  const reportTitle = `${normalizeTitle(title)} List`;

  // CSV Export
  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(columns.join(","));
    rows.forEach((row) => {
      csvRows.push(row.map((cell) => `"${cell}"`).join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [330.2, 215.9],
      });

      // Use custom PDF generator if provided, otherwise use default
      if (customPdfGenerator) {
        customPdfGenerator(doc, columns, rows);
      } else {
        // Default PDF generator
        doc.setFont("times", "normal");

        // Report info (top right)
        const safeDate = new Date().toISOString().split("T")[0];
        const exportId = `RPT-${Date.now()}`;
        doc.setFontSize(8);
        doc.setFont("times", "bold");
        doc.text(`${exportId}`, 200, 12, { align: "right" });
        doc.text(`${safeDate}`, 200, 16, { align: "right" });
        doc.setFont("times", "normal");

        // Header text
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
          "Integrated Establishment Regulatory Management System",
          108,
          24,
          { align: "center" }
        );
        doc.text("Department of Environmental and Natural Resources", 108, 29, {
          align: "center",
        });
        doc.text("Environmental Management Bureau Region I", 108, 34, {
          align: "center",
        });

        // Report title
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        const titleUpper = reportTitle.toUpperCase();
        doc.text(titleUpper, 108, 42, { align: "center" });
        const titleWidth = doc.getTextWidth(titleUpper);
        doc.line(108 - titleWidth / 2, 44, 108 + titleWidth / 2, 44);
        doc.setFont("times", "normal");

        // Table
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 48,
          styles: {
            fontSize: 8,
            font: "times",
            cellPadding: 1,
            lineWidth: 0.2,
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontSize: 10,
            font: "times",
            cellPadding: 1,
            fontStyle: "bold",
          },
          margin: { left: 10, right: 10 },
          tableLineWidth: 0.2,
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(`Page ${i} of ${pageCount}`, 200, 325, { align: "right" });
        }
      }

      // Open in browser tab
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check console for details.");
    }
  };

  const handleConfirmExport = () => {
    if (exportType === "csv") {
      handleExportCSV();
    } else if (exportType === "pdf") {
      handleExportPDF();
    }
    setExportType(null);
    setConfirming(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative p-6 bg-white rounded-lg shadow-lg w-82">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute text-gray-400 top-3 right-3 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-lg font-semibold">{reportTitle}</h2>

        {!confirming ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setExportType("csv");
                setConfirming(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <FileSpreadsheet size={16} /> Export as CSV
            </button>
            <button
              onClick={() => {
                setExportType("pdf");
                setConfirming(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <FileText size={16} /> Export as PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              Are you sure you want to export as{" "}
              <span className="font-semibold uppercase">{exportType}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setExportType(null);
                  setConfirming(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="px-4 py-2 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
