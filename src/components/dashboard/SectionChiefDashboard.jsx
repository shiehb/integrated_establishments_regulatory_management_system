import React from 'react';
import ComplianceByLawCard from './shared/ComplianceByLawCard';
import QuotaCard from './shared/QuotaCard';

export default function SectionChiefDashboard() {
  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Law Chart */}
        <div>
          <ComplianceByLawCard
            userRole="Section Chief"
            onViewAll={handleViewAll}
          />
        </div>
        
        {/* Quota Management */}
        <div>
          <QuotaCard userRole="Section Chief" />
        </div>
      </div>
    </div>
  );
}
