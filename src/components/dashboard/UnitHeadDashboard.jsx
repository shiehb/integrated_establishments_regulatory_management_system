import React from 'react';
import ComplianceByLawCard from './shared/ComplianceByLawCard';
import QuotaCard from './shared/QuotaCard';
import InspectionSummaryCards from './shared/InspectionSummaryCards';
import InspectionReportsTable from './shared/InspectionReportsTable';
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
    <div>
      <div>
        {/* Top Row: Quota Management and Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Quota Management */}
          <div>
            <QuotaCard userRole="Unit Head" />
          </div>
          
          {/* Inspection Summary Cards */}
          <div className="col-span-4">
            <InspectionSummaryCards 
              stats={stats} 
              loading={loading}
            />
          </div>
        </div>

        {/* Bottom Row: Compliance Chart and Reports Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Compliance by Law Chart */}
          <div>
            <ComplianceByLawCard
              userRole="Unit Head"
              onViewAll={handleViewAll}
            />
          </div>
          
          {/* Pending/Received Reports Table */}
          <div>
            <InspectionReportsTable 
              userLevel="Unit Head"
              userProfile={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
