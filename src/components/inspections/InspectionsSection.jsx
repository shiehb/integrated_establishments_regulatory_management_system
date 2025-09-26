import Header from "../Header";
import Footer from "../Footer";
import LayoutWithSidebar from "../LayoutWithSidebar";
import InspectionsCore from "./InspectionsCore";

export default function InspectionsSection() {
  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="Section Chief">
        <InspectionsCore canCreate={false} />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}


