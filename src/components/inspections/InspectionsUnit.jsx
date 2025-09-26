import Header from "../Header";
import Footer from "../Footer";
import LayoutWithSidebar from "../LayoutWithSidebar";
import InspectionsCore from "./InspectionsCore";

export default function InspectionsUnit() {
  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="Unit Head">
        <InspectionsCore canCreate={false} />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}


