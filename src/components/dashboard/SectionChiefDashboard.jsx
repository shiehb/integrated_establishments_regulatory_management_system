import React from 'react';
import ComplianceByLawCard from './shared/ComplianceByLawCard';

export default function SectionChiefDashboard() {
  // Navigation handlers
  const handleViewAll = (route) => {
    // You can implement navigation logic here if needed
    console.log('Navigate to:', route);
  };

  return (
    <div className="p-6 bg-gray-50">
        {/* Compliance by Law Chart */}
        <div>
          <ComplianceByLawCard
            userRole="Section Chief"
            onViewAll={handleViewAll}
          />
        </div>
    </div>
  );
}
