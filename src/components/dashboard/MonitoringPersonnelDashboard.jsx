import InspectionSummaryCards from './shared/InspectionSummaryCards';
import useInspectionStats from '../../hooks/useInspectionStats';

export default function MonitoringPersonnelDashboard() {
  // Fetch inspection statistics
  const { stats, loading } = useInspectionStats('Monitoring Personnel');

  return (
    <div className="space-y-6">
      {/* Inspection Summary Cards */}
      <InspectionSummaryCards 
        stats={stats} 
        loading={loading}
        period="Current Period"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Monitoring Personnel-specific content */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold">Monitoring Tasks</h3>
          <p className="text-2xl font-bold">Monitoring Personnel Content</p>
        </div>
      </div>
    </div>
  );
}
