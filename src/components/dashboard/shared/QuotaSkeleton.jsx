import React from 'react';

/**
 * QuotaSkeleton Component
 * 
 * A specialized loading skeleton for the Quota cards.
 * Mimics the progress card layout with icon, progress text, and progress bar.
 * 
 * @returns {JSX.Element} Quota skeleton component
 */
const QuotaSkeleton = () => (
  <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>

    {/* Quota Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Quota Card 1 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-200 h-2 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>

      {/* Quota Card 2 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-200 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Quota Card 3 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-200 h-2 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Quota Card 4 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-200 h-2 rounded-full w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Quota Card 5 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-200 h-2 rounded-full w-1/5"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default QuotaSkeleton;
