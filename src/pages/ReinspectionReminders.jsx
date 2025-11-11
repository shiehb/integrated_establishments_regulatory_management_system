import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import ReinspectionReminders from "../components/dashboard/ReinspectionReminders";

export default function ReinspectionRemindersPage() {
  return (
    <>
      <Header />
      <LayoutWithSidebar>
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-160px)]">
          <ReinspectionReminders />
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}


