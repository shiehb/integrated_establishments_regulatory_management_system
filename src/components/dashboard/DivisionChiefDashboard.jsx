import React from 'react';
import { 
  ClipboardList,
  Building2,
  Users
} from 'lucide-react';
import { useDashboardData } from './shared/useDashboardData';
import { useComplianceChart } from './shared/useComplianceChart';
import SummaryCard from './shared/SummaryCard';
import ComplianceCard from './shared/ComplianceCard';
import QuarterlyComparisonCard from './shared/QuarterlyComparisonCard';
import ComplianceByLawCard from './shared/ComplianceByLawCard';

export default function DivisionChiefDashboard() {
  // Use shared dashboard data hook with Division Chief role filtering
  const { isLoading, complianceStats, quarterlyData, refetch } = useDashboardData('Division Chief');
  
  // Use shared compliance chart hook
  const complianceData = useComplianceChart(complianceStats);

  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Main Grid - 5 Column Layout */}
      <div className="grid grid-cols-5 grid-rows-5 gap-4 mb-6">
        {/* 1. Compliance by Law Chart (spans 3 columns) */}
        <div className="col-span-3">
          <ComplianceByLawCard
            userRole="Division Chief"
            onViewAll={handleViewAll}
          />
        </div>

        {/* 2. QuarterlyComparisonCard (spans 3 columns, starts at row 2) */}
        <div className="col-span-3 col-start-1 row-start-2">
          <QuarterlyComparisonCard
            data={quarterlyData}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>

        {/* 3. ComplianceCard (spans 2 columns, 2 rows, starts at column 4, row 1) */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-1">
          <ComplianceCard
            stats={complianceStats}
            chartData={complianceData}
            isLoading={isLoading}
            onViewAll={handleViewAll}
          />
        </div>
      </div>
    </div>
  );
}
