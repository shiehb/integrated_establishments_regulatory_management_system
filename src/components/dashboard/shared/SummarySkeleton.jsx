import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * SummarySkeleton Component
 * 
 * A specialized loading skeleton for the Summary card.
 * Mimics the statistics layout with key metrics in a grid.
 * 
 * @returns {JSX.Element} Summary skeleton component
 */
const SummarySkeleton = () => (
  <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>

    {/* Statistics Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stat 1 */}
      <div className="text-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
        <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Stat 2 */}
      <div className="text-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
        <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Stat 3 */}
      <div className="text-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
        <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Stat 4 */}
      <div className="text-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
        <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>

    {/* Additional Stats Row */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default SummarySkeleton;
