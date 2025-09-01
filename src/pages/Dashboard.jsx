import LayoutWithSidebar from "../components/LayoutWithSidebar";

export default function Dashboard() {
  return (
    <Layout>
      <LayoutWithSidebar userLevel="admin">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-sky-600">
            Admin Dashboard
          </h1>
          {/* Dashboard content here */}
        </div>
      </LayoutWithSidebar>
    </Layout>
  );
}
