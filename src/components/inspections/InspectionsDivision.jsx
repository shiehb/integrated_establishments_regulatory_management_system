import Header from "../Header";
import Footer from "../Footer";
import LayoutWithSidebar from "../LayoutWithSidebar";
import InspectionsCore from "./InspectionsCore";

export default function InspectionsDivision() {
  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="Division Chief">
        <InspectionsCore canCreate={true} />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}


