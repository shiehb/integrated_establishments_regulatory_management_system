import React from 'react';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
 * @param {boolean} props.isLoading - Whether to show loading state
 * @param {Function} props.onViewAll - Handler for view all button
 * @returns {JSX.Element} Compliance card component
 */
const ComplianceCard = ({ stats, isLoading, onViewAll }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const noData = stats.total === 0 && stats.pending === 0;

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll('/inspections');
    }
  };

  // Prepare data for Recharts
  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' }, // amber-500
    { name: 'Compliant', value: stats.compliant, color: '#34D399' }, // emerald-400
    { name: 'Non-Compliant', value: stats.nonCompliant, color: '#F87171' } // red-400
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = stats.pending + stats.compliant + stats.nonCompliant;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white px-3 py-2 border border-gray-300 shadow-sm">
          <p className="font-medium text-gray-800 text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-600">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-xs text-gray-600">
            Percentage: <span className="font-semibold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer
  const renderLabel = (entry) => {
    const total = stats.pending + stats.compliant + stats.nonCompliant;
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
    return percentage > 5 ? `${percentage}%` : '';
  };

  return (
    <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieChartIcon size={20} className="text-gray-600" />
          Compliance Status
        </h3>
        <button 
          onClick={handleViewAll}
          className="text-gray-600 hover:text-gray-800 p-1"
          title="View All Inspections"
        >
          <TrendingUp size={18} />
        </button>
      </div>

      {noData ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <PieChartIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-8">
          {/* LEFT: Larger Pie Chart */}
          <div className="w-80 min-w-0 aspect-square">
            <ResponsiveContainer width="100%" aspect={1} minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* RIGHT: Stats Details */}
          <div className="flex-1 space-y-4">
            {/* Pending */}
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 bg-amber-500"></span>
                <span className="text-base text-gray-700">Pending</span>
              </span>
              <span className="text-xl font-bold text-gray-800">{stats.pending}</span>
            </div>

            {/* Compliant */}
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 bg-emerald-400"></span>
                <span className="text-base text-gray-700">Compliant</span>
              </span>
              <span className="text-xl font-bold text-gray-800">{stats.compliant}</span>
            </div>

            {/* Non-Compliant */}
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 bg-red-400"></span>
                <span className="text-base text-gray-700">Non-Compliant</span>
              </span>
              <span className="text-xl font-bold text-gray-800">{stats.nonCompliant}</span>
            </div>

            {/* Compliance Rate */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="text-3xl font-bold text-gray-800">
                {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Compliance Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceCard;
