import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import NonComplianceList from "../components/billing/NonComplianceList";
import InspectionReportView from "../components/billing/InspectionReportView";

export default function Billing() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="legal-unit">
        {!selectedReport ? (
          <NonComplianceList
            key={refreshTrigger}
            onSelectReport={setSelectedReport}
          />
        ) : (
          <InspectionReportView
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
            onBillingCreated={refreshData}
          />
        )}
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
