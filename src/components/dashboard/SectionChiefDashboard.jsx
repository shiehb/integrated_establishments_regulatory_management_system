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
    <div className='grid grid-cols-5'>
      <div className='col-span-3'>
      <div className="grid grid-cols-3">
        {/* Quota Management */}
        <div className="col-span-3">
          <QuotaCard userRole="Section Chief" />
        </div>
      </div>
          {/* Compliance by Law Chart */}
        <div>
          <ComplianceByLawCard
            userRole="Section Chief"
            onViewAll={handleViewAll}
          />
        </div>
        </div>
        <div className='col-span-2 grid grid-cols-2 row-span-2'>
          <div className='col-span-2 '>
            {/* Blank for now */}
          </div>
          <div className='col-span-2 '>
            {/* Blank for now  */}
          </div>
        </div>

    </div>
  );
}
