import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExportModal from "../ExportModal";

export default function BillingReportPDF({ billing }) {
  const [showExportModal, setShowExportModal] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Billing Notice", 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Establishment: ${billing.establishment_name}`, 20, 40);
    doc.text(`Date Issued: ${billing.created_at}`, 20, 50);

    let y = 70;
    billing.violations.forEach((v, i) => {
      doc.text(`${i + 1}. ${v.law} - ${v.description}`, 20, y);
      doc.text(`₱${v.amount}`, 160, y);
      y += 10;
    });

    doc.text(`Total: ₱${billing.total_amount}`, 20, y + 10);

    doc.save(`billing_${billing.id}.pdf`);
  };

  // Prepare data for ExportModal
  const exportColumns = ["Law", "Description", "Amount"];
  const exportRows = billing.violations.map((v) => [
    v.law,
    v.description,
    `₱${v.amount}`,
  ]);

  // Add total row
  exportRows.push(["", "TOTAL", `₱${billing.total_amount}`]);

  return (
    <>
      <button
        onClick={() => setShowExportModal(true)}
        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
      >
        Print PDF
      </button>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`Billing Report - ${billing.establishment_name}`}
        fileName={`billing_${billing.id}`}
        columns={exportColumns}
        rows={exportRows}
        customPdfGenerator={(doc, columns, rows) => {
          // Custom PDF generator for billing reports
          doc.setFontSize(16);
          doc.text("BILLING NOTICE", 105, 20, null, null, "center");

          doc.setFontSize(12);
          doc.text(`Establishment: ${billing.establishment_name}`, 20, 40);
          doc.text(`Date Issued: ${billing.created_at}`, 20, 50);
          doc.text(`Billing ID: ${billing.id}`, 20, 60);

          // Add billing details table
          autoTable(doc, {
            startY: 70,
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

          // Add footer with total
          const finalY = doc.lastAutoTable.finalY + 10;
          doc.setFontSize(12);
          doc.setFont(undefined, "bold");
          doc.text(`Total Amount Due: ₱${billing.total_amount}`, 20, finalY);
        }}
      />
    </>
  );
}
