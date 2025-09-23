export default function LegalUnitDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Legal Unit-specific stats */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold">Legal Cases</h3>
          <p className="text-2xl font-bold">Legal Unit Content</p>
        </div>
      </div>
    </div>
  );
}
