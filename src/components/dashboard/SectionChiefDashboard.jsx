export default function SectionChiefDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Section Chief-specific content */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold">Section Performance</h3>
          <p className="text-2xl font-bold">Section Chief Content</p>
        </div>
      </div>
    </div>
  );
}
