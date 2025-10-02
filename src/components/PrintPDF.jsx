import { useState } from "react";
import { Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNotifications } from "./NotificationManager";
import ConfirmationDialog from "./common/ConfirmationDialog";

export default function PrintPDF({
  title,
  columns,
  rows,
  customPdfGenerator,
  className = "",
  disabled = false,
  selectedCount = 0
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const notifications = useNotifications();

  // Print functionality using existing PDF
  const handlePrintConfirm = () => {
    setShowConfirm(true);
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [330.2, 215.9],
      });

      if (customPdfGenerator) {
        customPdfGenerator(doc, columns, rows);
      } else {
        // Use same PDF generation as export
        doc.setFont("times", "normal");
        const pageWidth = doc.internal.pageSize.getWidth();
        const safeDate = new Date().toISOString().split("T")[0];
        const exportId = `RPT-${Date.now()}`;
        
        doc.setFontSize(8);
        doc.setFont("times", "bold");
        doc.text(`${exportId}`, pageWidth - 15, 12, { align: "right" });
        doc.text(`${safeDate}`, pageWidth - 15, 16, { align: "right" });
        doc.setFont("times", "normal");

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
          { align: "center" }
        );
        doc.text(
          "Environmental Management Bureau Region I",
          pageWidth / 2,
          34,
          { align: "center" }
        );

        doc.setFont("times", "bold");
        doc.setFontSize(12);
        const titleUpper = title.toUpperCase();
        doc.text(titleUpper, pageWidth / 2, 42, { align: "center" });
        const titleWidth = doc.getTextWidth(titleUpper);
        doc.line(
          pageWidth / 2 - titleWidth / 2,
          44,
          pageWidth / 2 + titleWidth / 2,
          44
        );
        doc.setFont("times", "normal");

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

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, 325, {
            align: "right",
          });
        }
      }

      // Open PDF in new tab and trigger print
      const blobUrl = doc.output("bloburl");
      const printWindow = window.open(blobUrl, "_blank");
      
      // Wait for PDF to load then trigger print
      setTimeout(() => {
        if (printWindow) {
          printWindow.print();
        }
      }, 1000);

      notifications.success(
        "Print dialog opened successfully!",
        {
          title: "Print Ready",
          duration: 4000
        }
      );
     } catch {
      notifications.error(
        "Failed to open print dialog",
        {
          title: "Print Failed",
          duration: 6000
        }
      );
    } finally {
      setIsPrinting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={handlePrintConfirm}
        disabled={disabled || isPrinting}
        className={`
          flex items-center px-3 py-1 text-sm font-medium rounded
          text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200
          ${isPrinting ? 'opacity-75' : ''}
          ${className}
        `}
      >
        <Printer size={16} />
        {isPrinting ? 'Printing...' : 'Print'}
      </button>

      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Print"
        message={
          <div>
            <p>Are you sure you want to print the {title}?</p>
            <p className="mt-2 text-sm text-gray-600">
              This will open the print dialog in a new window.
            </p>
            {selectedCount > 0 ? (
              <p className="mt-1 text-sm text-blue-600 font-medium">
                Selected items to print: {selectedCount}
              </p>
            ) : rows.length > 0 ? (
              <p className="mt-1 text-sm text-gray-500">
                Total items to print: {rows.length}
              </p>
            ) : null}
          </div>
        }
        loading={isPrinting}
        onCancel={handleCancel}
        onConfirm={handlePrint}
        confirmText="Print"
        cancelText="Cancel"
        confirmColor="blue"
      />
    </>
  );
}
