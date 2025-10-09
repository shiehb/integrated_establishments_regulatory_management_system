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

export default function DivisionChiefDashboard() {
  // Use shared dashboard data hook with Division Chief role filtering
  const { isLoading, stats, complianceStats, quarterlyData, refetch } = useDashboardData('Division Chief');
  
  // Use shared compliance chart hook
  const complianceData = useComplianceChart(complianceStats);

  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Division Chief Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Division Chief Dashboard</h1>
        <p className="text-gray-600">Overview of your division's performance and compliance status</p>
      </div>

      {/* Main Grid - 5 Column Layout */}
      <div className="grid grid-cols-5 grid-rows-2 gap-2 mb-6">
        {/* Cell 1: Establishments Card */}
        <div>
          <SummaryCard
            title="Establishments"
            value={stats.totalEstablishments}
            icon={<Building2 size={24} className="text-sky-700" />}
            color="bg-sky-50 border-sky-200"
            route="/establishments"
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 2: Users Card */}
        <div>
          <SummaryCard
            title="Users"
            value={stats.totalUsers}
            icon={<Users size={24} className="text-sky-600" />}
            color="bg-sky-50 border-sky-200"
            route="/users"
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 3: Total Inspections in Current Quarter Year */}
        <div>
          <SummaryCard
            title="Compliance Monitoring"
            value={quarterlyData.current_quarter?.total_finished || 0}
            icon={<ClipboardList size={24} className="text-sky-800" />}
            color="bg-sky-50 border-sky-200"
            route="/inspections"
            isLoading={isLoading}
            onNavigate={handleViewAll}
          />
        </div>

        {/* Cell 4: Quarterly Trend (spans 3 columns in row 2) */}
        <div className="col-span-3 col-start-1 row-start-2">
          <QuarterlyComparisonCard
            data={quarterlyData}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>

        {/* Cell 5: Compliance Status (spans 2 rows, starts at column 4) */}
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
