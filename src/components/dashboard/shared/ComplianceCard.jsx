import React from 'react';
import { Pie } from 'react-chartjs-2';
import { PieChart, TrendingUp } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * ComplianceCard Component
 * 
 * A reusable compliance status card that displays a pie chart with compliance statistics.
 * Shows pending, compliant, and non-compliant inspections with a compliance rate.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Compliance statistics object
 * @param {number} props.stats.pending - Number of pending inspections
 * @param {number} props.stats.compliant - Number of compliant inspections
 * @param {number} props.stats.nonCompliant - Number of non-compliant inspections
 * @param {number} props.stats.total - Total completed inspections
 * @param {Object} props.chartData - Chart.js data object for the pie chart
 * @param {boolean} props.isLoading - Whether to show loading state
 * @param {Function} props.onViewAll - Handler for view all button
 * @returns {JSX.Element} Compliance card component
 */
const ComplianceCard = ({ stats, chartData, isLoading, onViewAll }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const noData = stats.total === 0 && stats.pending === 0;

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll('/inspections');
    }
  };

  return (
    <div className="bg-white border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg border-sky-200 bg-sky-50 group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieChart size={20} className="text-sky-600" />
          Compliance Status
        </h3>
        <button 
          onClick={handleViewAll}
          className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="View All Inspections"
        >
          <TrendingUp size={16} className="text-sky-600" />
        </button>
      </div>

      {noData ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <PieChart size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-6">
          {/* LEFT: Larger Pie Chart */}
          <div className="w-72 h-72 flex-shrink-0">
            <Pie 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true }
                }
              }}
            />
          </div>

          {/* RIGHT: Stats Details */}
          <div className="flex-1 space-y-3">
            {/* Pending */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </span>
              <span className="text-lg font-semibold text-yellow-700">{stats.pending}</span>
            </div>

            {/* Compliant */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Compliant</span>
              </span>
              <span className="text-lg font-semibold text-green-700">{stats.compliant}</span>
            </div>

            {/* Non-Compliant */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Non-Compliant</span>
              </span>
              <span className="text-lg font-semibold text-red-700">{stats.nonCompliant}</span>
            </div>

            {/* Compliance Rate */}
            <div className="pt-3 mt-3 border-t border-sky-200">
              <div className="text-3xl font-bold text-sky-700">
                {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-500">Compliance Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceCard;
