import { jsPDF } from "jspdf";

export default function BillingReportPDF({ billing }) {
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

  return (
    <button
      onClick={generatePDF}
      className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
    >
      Print PDF
    </button>
  );
}
