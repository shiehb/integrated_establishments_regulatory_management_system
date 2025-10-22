import React from 'react';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

/**
 * ComplianceOverviewSkeleton Component
 * 
 * A specialized loading skeleton for the Compliance Overview card.
 * Mimics the pie chart layout with header, chart, and legend.
 * 
 * @returns {JSX.Element} Compliance overview skeleton component
 */
const ComplianceOverviewSkeleton = () => (
  <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <PieChartIcon size={20} className="text-gray-300" />
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>

    <div className="flex-1 flex items-center gap-8">
      {/* LEFT: Pie Chart Skeleton */}
      <div className="w-80 min-w-0 aspect-square">
        <div className="relative w-full h-full">
          {/* Pie Chart Circle */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
          <div className="absolute inset-2 rounded-full border-8 border-gray-200" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }}></div>
          <div className="absolute inset-2 rounded-full border-8 border-gray-200" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }}></div>
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full"></div>
        </div>
      </div>

      {/* RIGHT: Legend and Stats */}
      <div className="flex-1 space-y-4">
        {/* Pending */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Compliant */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Non-Compliant */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Compliance Rate */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default ComplianceOverviewSkeleton;
