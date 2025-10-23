// src/components/reports/CompletedInspectionsList.jsx
import { useMemo, useEffect, useRef } from 'react';
import OfficialInspectionTable from './OfficialInspectionTable';

export default function CompletedInspectionsList({ 
  inspections = [],
  loading = false,
  onSummaryChange
}) {
  const prevStatsRef = useRef(null);
  
  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = inspections.length;
    const compliant = inspections.filter(i => 
      i.form?.compliance_decision === 'COMPLIANT'
    ).length;
    const nonCompliant = inspections.filter(i => 
      i.form?.compliance_decision === 'NON_COMPLIANT'
    ).length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    
    return { total, compliant, nonCompliant, complianceRate };
  }, [inspections]);

  // Pass summary stats to parent only when they actually change
  useEffect(() => {
    if (onSummaryChange) {
      const prevStats = prevStatsRef.current;
      const hasChanged = !prevStats || 
        prevStats.total !== summaryStats.total ||
        prevStats.compliant !== summaryStats.compliant ||
        prevStats.nonCompliant !== summaryStats.nonCompliant ||
        prevStats.complianceRate !== summaryStats.complianceRate;
      
      if (hasChanged) {
        onSummaryChange(summaryStats);
        prevStatsRef.current = summaryStats;
      }
    }
  }, [summaryStats, onSummaryChange]);

  return (
    <div className="space-y-4">
      <OfficialInspectionTable
        inspections={inspections}
        loading={loading}
      />
    </div>
  );
}