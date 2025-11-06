import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * ComplianceByLawSkeleton Component
 * 
 * A specialized loading skeleton for the Compliance Status by Law card.
 * Mimics the bar chart layout with header, legend, and chart area.
 * 
 * @returns {JSX.Element} Compliance by law skeleton component
 */
const ComplianceByLawSkeleton = () => (
  <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-gray-300" />
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center gap-3">
        {/* Period Type Selector */}
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Chart Container */}
    <div className="flex-1 flex flex-col">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        <div className="h-80 w-full">
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
              {/* Law 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-16 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-12 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-t"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Law 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-12 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-20 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-6 bg-gray-200 rounded-t"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Law 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-16 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-12 bg-gray-200 rounded-t"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Law 4 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-20 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-16 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-4 bg-gray-200 rounded-t"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Law 5 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-16 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-20 bg-gray-200 rounded-t"></div>
                  <div className="w-8 h-18 bg-gray-200 rounded-t"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ComplianceByLawSkeleton;
