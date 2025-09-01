import LayoutWithSidebar from "../components/LayoutWithSidebar";

export default function Dashboard() {
  return (
    <LayoutWithSidebar userLevel="admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-sky-600 mb-4">
          Admin Dashboard
        </h1>
        {/* Dashboard content here */}
      </div>
    </LayoutWithSidebar>
  );
}
