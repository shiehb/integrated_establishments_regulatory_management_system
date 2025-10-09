import { useState } from "react";
import { Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNotifications } from "./NotificationManager";
import ConfirmationDialog from "./common/ConfirmationDialog";

// Helper function to load images as base64
const loadImageAsBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

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

        // Load and add logos
        const logo1Data = await loadImageAsBase64('/assets/document/logo1.png');
        const logo2Data = await loadImageAsBase64('/assets/document/logo2.png');
        
        const logoWidth = 15; // mm
        const logoHeight = 15; // mm
        const logoY = 24; // Y position for logos
        
        // Calculate title text width to position logos closer
        const titleText = "Integrated Establishment Regulatory Management System";
        const titleTextWidth = doc.getTextWidth(titleText);
        
        // Position logos with more spacing from the title text
        const leftLogoX = (pageWidth / 2) - (titleTextWidth / 2) - logoWidth - 20; // 10mm gap
        const rightLogoX = (pageWidth / 2) + (titleTextWidth / 2) + 20; // 10mm gap
        
        // Add logo1 on the left (closer to title)
        if (logo1Data) {
          doc.addImage(logo1Data, 'PNG', leftLogoX, logoY, logoWidth, logoHeight);
        }
        
        // Add logo2 on the right (closer to title)
        if (logo2Data) {
          doc.addImage(logo2Data, 'PNG', rightLogoX, logoY, logoWidth, logoHeight);
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
          "Integrated Establishment Regulatory Management System",
          pageWidth / 2,
          28,
          { align: "center" }
        );
        doc.text(
          "Department of Environmental and Natural Resources",
          pageWidth / 2,
          33,
          { align: "center" }
        );
        doc.text(
          "Environmental Management Bureau Region I",
          pageWidth / 2,
          38,
          { align: "center" }
        );

        doc.setFont("times", "bold");
        doc.setFontSize(12);
        const titleUpper = title.toUpperCase();
        doc.text(titleUpper, pageWidth / 2, 46, { align: "center" });
        const titleWidth = doc.getTextWidth(titleUpper);
        doc.line(
          pageWidth / 2 - titleWidth / 2,
          48,
          pageWidth / 2 + titleWidth / 2,
          48
        );
        doc.setFont("times", "normal");

        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 52,
          styles: {
            fontSize: 8,
            font: "times",
            cellPadding: 1,
            lineWidth: 0.2,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 10,
            font: "times",
            cellPadding: 1,
            fontStyle: "bold",
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
          },
          margin: { left: 10, right: 10 },
          tableLineWidth: 0.5,
          tableLineColor: [0, 0, 0],
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
        title="Print Report"
        message={
          <div className="space-y-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Printer size={24} className="text-sky-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Print {title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Generate PDF and open print dialog
              </p>
            </div>
            
            <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Records to print:</span>
                {selectedCount > 0 ? (
                  <span className="font-semibold text-sky-600">{selectedCount} selected</span>
                ) : rows.length > 0 ? (
                  <span className="font-semibold text-gray-700">{rows.length} total</span>
                ) : (
                  <span className="font-semibold text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>
        }
        loading={isPrinting}
        onCancel={handleCancel}
        onConfirm={handlePrint}
        confirmText={isPrinting ? "Generating..." : "Print"}
        cancelText="Cancel"
        confirmColor="sky"
      />
    </>
  );
}
