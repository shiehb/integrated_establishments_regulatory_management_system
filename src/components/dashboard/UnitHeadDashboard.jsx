import React from 'react';
import ComplianceByLawCard from './shared/ComplianceByLawCard';
import QuotaCard from './shared/QuotaCard';
import InspectionSummaryCards from './shared/InspectionSummaryCards';
import useInspectionStats from '../../hooks/useInspectionStats';

export default function UnitHeadDashboard() {
  // Fetch inspection statistics
  const { stats, loading } = useInspectionStats('Unit Head');

  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="space-y-6">
        {/* Inspection Summary Cards */}
        <InspectionSummaryCards 
          stats={stats} 
          loading={loading}
          period="Current Period"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance by Law Chart */}
          <div>
            <ComplianceByLawCard
              userRole="Unit Head"
              onViewAll={handleViewAll}
            />
          </div>
          
          {/* Quota Management */}
          <div>
            <QuotaCard userRole="Unit Head" />
          </div>
        </div>
      </div>
    </div>
  );
}
