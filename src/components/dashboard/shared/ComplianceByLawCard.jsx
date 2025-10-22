import React from "react";
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useComplianceByLawChart } from "./useComplianceByLawChart";
import ComplianceByLawSkeleton from "./ComplianceByLawSkeleton";

/**
 * ComplianceByLawCard Component
 *
 * A dashboard card that displays compliance statistics grouped by law using a vertical stacked bar chart.
 * Shows pending, compliant, and non-compliant inspections for each law.
 *
 * @param {Object} props - Component props
 * @param {string|null} props.userRole - User role for filtering data (optional)
 * @param {Function} props.onViewAll - Handler for view all button (optional)
 * @returns {JSX.Element} Compliance by law card component
 */
const ComplianceByLawCard = ({ userRole = null, onViewAll }) => {
  const { isLoading, data, chartData, error, refetch } = useComplianceByLawChart(userRole);

  if (isLoading) {
    return <ComplianceByLawSkeleton />;
  }

  const noData = !data || data.length === 0 || data.every(item => item.total === 0);

  const handleRefresh = () => {
    if (refetch) {
      refetch();
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll('/inspections');
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-white px-3 py-2 border border-gray-300 shadow-sm">
          <p className="font-medium text-gray-800 text-sm mb-1">{label}</p>
          {payload.map((entry, index) => {
            const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between gap-3 mb-1">
                <span className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2" 
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-xs text-gray-600">{entry.name}:</span>
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  {entry.value} ({percentage}%)
                </span>
              </div>
            );
          })}
          <div className="pt-1 mt-1 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Total:</span>
              <span className="text-xs font-semibold text-gray-800">{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label component to show values above bars
  const CustomLabel = ({ x, y, width, value, fill }) => {
    if (value === 0) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        fill={fill}
        fontSize="12"
        fontWeight="600"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white border-b border-gray-300 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-gray-600" />
          Compliance Status by Law
        </h3>
        <div className="flex items-center gap-3">
          {onViewAll && (
            <button
              onClick={handleViewAll}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="View All Inspections"
            >
              <BarChart3 size={18} />
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="text-gray-600 hover:text-gray-800 p-1"
            title="Refresh Compliance Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-30 text-red-400" />
            <p className="text-sm text-red-600">Error loading compliance data</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-xs text-sky-600 hover:text-sky-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : noData ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No compliance data available</p>
            <p className="text-xs text-gray-400 mt-1">Data will appear here when inspections are completed</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chart Container */}
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={400} minWidth={0} minHeight={0}>
              <BarChart
                data={chartData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  height={60}
                  tick={{ fill: '#6b7280', fontSize: 16 }}
                  stroke="#9ca3af"
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 16 }}
                  stroke="#9ca3af"
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="pending" 
                  fill="#F59E0B"
                  name="Pending"
                  label={<CustomLabel />}
                />
                <Bar 
                  dataKey="compliant" 
                  fill="#34D399"
                  name="Compliant"
                  label={<CustomLabel />}
                />
                <Bar 
                  dataKey="nonCompliant" 
                  fill="#F87171"
                  name="Non-Compliant"
                  label={<CustomLabel />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceByLawCard;
