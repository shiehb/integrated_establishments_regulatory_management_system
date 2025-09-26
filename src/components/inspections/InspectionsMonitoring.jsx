import Header from "../Header";
import Footer from "../Footer";
import LayoutWithSidebar from "../LayoutWithSidebar";
import InspectionsCore from "./InspectionsCore";

export default function InspectionsMonitoring() {
  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="Monitoring Personnel">
        <InspectionsCore canCreate={false} />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}


