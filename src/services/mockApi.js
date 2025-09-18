// Mock Data for testing Billing workflow

// Non-compliance inspection reports
let mockReports = [
  {
    id: 1,
    establishment_name: "ABC Manufacturing",
    date: "2025-09-10",
    findings: "Emission levels exceeded legal limits",
    violations: [
      { id: 101, law: "RA-8749", description: "Air pollution violation" },
      { id: 102, law: "RA-9003", description: "Improper waste disposal" },
    ],
  },
  {
    id: 2,
    establishment_name: "XYZ Foods Corp.",
    date: "2025-09-12",
    findings: "Improper wastewater discharge detected",
    violations: [
      {
        id: 201,
        law: "RA-9275",
        description: "Wastewater discharge violation",
      },
    ],
  },
];

// Mock billing records
let mockBillings = [];

export const mockApi = {
  getNonCompliantReports: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve([...mockReports]), 500);
    }),

  createBillingFromReport: (reportId, violations) =>
    new Promise((resolve, reject) => {
      const report = mockReports.find((r) => r.id === reportId);
      if (!report) return reject(new Error("Report not found"));

      const selectedViolations = report.violations.filter((v) =>
        violations.some((sel) => sel.id === v.id)
      );

      const enriched = selectedViolations.map((v) => ({
        ...v,
        amount: violations.find((sel) => sel.id === v.id).amount,
      }));

      const total = enriched.reduce(
        (sum, v) => sum + parseFloat(v.amount || 0),
        0
      );

      const billing = {
        id: mockBillings.length + 1,
        establishment_name: report.establishment_name,
        created_at: new Date().toLocaleDateString(),
        violations: enriched,
        total_amount: total,
      };

      mockBillings.push(billing);

      setTimeout(() => resolve(billing), 500);
    }),
};
