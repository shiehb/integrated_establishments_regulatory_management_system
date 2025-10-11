import React from 'react';

/**
 * LoadingSkeleton Component
 * 
 * A reusable loading placeholder component for dashboard cards.
 * Provides animated skeleton loading state while data is being fetched.
 * 
 * @returns {JSX.Element} Loading skeleton component
 */
const LoadingSkeleton = () => (
  <div className="bg-white rounded p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-18 h-18 bg-gray-200 rounded-lg"></div>
      <div className="w-16 h-8 bg-gray-200 rounded"></div>
    </div>
    <div className="w-35 h-15 bg-gray-200 rounded mb-2"></div>
    <div className="w-auto h-8 bg-gray-200 rounded"></div>
  </div>
);

export default LoadingSkeleton;
