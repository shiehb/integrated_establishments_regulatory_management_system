import InspectionSummaryCards from './shared/InspectionSummaryCards';
import InspectionReportsTable from './shared/InspectionReportsTable';
import useInspectionStats from '../../hooks/useInspectionStats';

export default function MonitoringPersonnelDashboard() {
  // Fetch inspection statistics
  const { stats, loading } = useInspectionStats('Monitoring Personnel');

  return (
    <div className="p-4">
      {/* Inspection Summary Cards */}
      <InspectionSummaryCards 
        stats={stats} 
        loading={loading}
      />

      {/* Pending/Received Reports Table - Full Width */}
      <div>
        <InspectionReportsTable 
          userLevel="Monitoring Personnel"
          userProfile={null}
        />
      </div>
    </div>
  );
}
