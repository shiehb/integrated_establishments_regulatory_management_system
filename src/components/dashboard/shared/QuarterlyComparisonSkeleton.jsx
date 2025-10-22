import React from 'react';
import { BarChart3, Filter, RefreshCw } from 'lucide-react';

/**
 * QuarterlyComparisonSkeleton Component
 * 
 * A specialized loading skeleton for the Quarterly Performance Comparison card.
 * Mimics the bar chart layout with header, controls, and chart area.
 * 
 * @returns {JSX.Element} Quarterly comparison skeleton component
 */
const QuarterlyComparisonSkeleton = () => (
  <div className="bg-white border-b border-r border-gray-300 p-4 h-full flex flex-col animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-gray-300" />
        <div className="h-6 w-64 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center gap-3">
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-300" />
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        
        {/* Trend Badge */}
        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
        
        {/* Refresh Button */}
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Chart Area */}
    <div className="flex-1">
      <div className="h-64 w-full">
        {/* Y-axis */}
        <div className="flex h-full">
          <div className="w-12 flex flex-col justify-between">
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          
          {/* Chart bars area */}
          <div className="flex-1 flex items-end justify-around px-4">
            {/* Last Quarter */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="w-12 h-16 bg-gray-200 rounded-t"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-t"></div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            
            {/* Current Quarter */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="w-12 h-20 bg-gray-200 rounded-t"></div>
                <div className="w-12 h-8 bg-gray-200 rounded-t"></div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Summary Section */}
    <div className="p-3 bg-gray-100 border border-gray-200 rounded mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default QuarterlyComparisonSkeleton;
