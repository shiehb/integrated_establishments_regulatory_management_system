export default function UnitHeadDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Unit Head-specific content */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold">Unit Tasks</h3>
          <p className="text-2xl font-bold">Unit Head Content</p>
        </div>
      </div>
    </div>
  );
}
