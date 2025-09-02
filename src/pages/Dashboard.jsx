import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";

export default function Dashboard() {
  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-sky-600">Dashboard</h1>
          {/* Dashboard content here */}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
