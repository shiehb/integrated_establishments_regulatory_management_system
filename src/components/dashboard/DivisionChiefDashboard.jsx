import React from 'react';
import { useDashboardData } from './shared/useDashboardData';
import ComplianceCard from './shared/ComplianceCard';
import QuarterlyComparisonCard from './shared/QuarterlyComparisonCard';
import ComplianceByLawCard from './shared/ComplianceByLawCard';
import QuotaCard from './shared/QuotaCard';
import ReinspectionReminders from './ReinspectionReminders';
import { FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DivisionChiefDashboard() {
  // Use shared dashboard data hook with Division Chief role filtering
  const { isLoading, complianceStats, quarterlyData, refetch } = useDashboardData('Division Chief');

  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div>
      {/* Quotas on top (same positioning as Admin) */}
      <QuotaCard userRole="Division Chief" />

      {/* Two-column overview like Admin (no tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
          <QuarterlyComparisonCard
            data={quarterlyData}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>
        <div>
          <ComplianceCard
            stats={complianceStats}
            isLoading={isLoading}
            onViewAll={handleViewAll}
          />
        </div>
      </div>

      {/* Compliance by Law (matches Admin; no tables below) */}
      <div>
        <ComplianceByLawCard
          userRole="Division Chief"
          onViewAll={handleViewAll}
        />
      </div>

      {/* Reinspection Reminders - New section for Division Chiefs */}
      <div className="mb-6">
        <ReinspectionReminders />
      </div>
    </div>
  );
}
