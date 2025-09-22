import { useState } from "react";
import logo1 from "/assets/document/logo1.png";
import logo2 from "/assets/document/logo2.png";
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
  customPdfGenerator,
}) {
  const [exportType, setExportType] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const normalizeTitle = (t) =>
    t
      .replace(/export/gi, "")
      .replace(/report/gi, "")
      .trim();

  const reportTitle = `${normalizeTitle(title)} List`;

  // Function to convert image URL to base64
  const getBase64Image = (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = () => {
        console.warn("Failed to load image:", imgUrl);
        resolve(null); // Return null if image fails to load
      };
      img.src = imgUrl;
    });
  };

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
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [330.2, 215.9],
      });

      if (customPdfGenerator) {
        customPdfGenerator(doc, columns, rows);
      } else {
        doc.setFont("times", "normal");

        // Convert images to base64
        const logo1Base64 = await getBase64Image(logo1);
        const logo2Base64 = await getBase64Image(logo2);

        // Calculate page width for positioning
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add logos - logo1 on left, logo2 on right
        if (logo1Base64) {
          doc.addImage(logo1Base64, "PNG", 35, 18, 18, 18); // Left side
        }
        if (logo2Base64) {
          doc.addImage(logo2Base64, "PNG", pageWidth - 50, 18, 18, 18); // Right side (pageWidth - 50mm from right)
        }

        // Report info (centered between logos)
        const safeDate = new Date().toISOString().split("T")[0];
        const exportId = `RPT-${Date.now()}`;
        doc.setFontSize(8);
        doc.setFont("times", "bold");
        doc.text(`${exportId}`, pageWidth - 15, 12, { align: "right" });
        doc.text(`${safeDate}`, pageWidth - 15, 16, { align: "right" });
        doc.setFont("times", "normal");

        // Header text (centered)
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
          "Integrated Establishment Regulatory Management System",
          pageWidth / 2,
          24,
          { align: "center" }
        );
        doc.text(
          "Department of Environmental and Natural Resources",
          pageWidth / 2,
          29,
          {
            align: "center",
          }
        );
        doc.text(
          "Environmental Management Bureau Region I",
          pageWidth / 2,
          34,
          {
            align: "center",
          }
        );

        // Report title
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        const titleUpper = reportTitle.toUpperCase();
        doc.text(titleUpper, pageWidth / 2, 42, { align: "center" });
        const titleWidth = doc.getTextWidth(titleUpper);
        doc.line(
          pageWidth / 2 - titleWidth / 2,
          44,
          pageWidth / 2 + titleWidth / 2,
          44
        );
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
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, 325, {
            align: "right",
          });
        }
      }

      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check console for details.");
    }
  };

  const handleConfirmExport = async () => {
    if (exportType === "csv") {
      handleExportCSV();
    } else if (exportType === "pdf") {
      await handleExportPDF();
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
