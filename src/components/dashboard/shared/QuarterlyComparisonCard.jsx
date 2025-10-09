import React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";

/**
 * QuarterlyComparisonCard Component
 *
 * A reusable quarterly comparison card that displays quarterly trends and compliance breakdown.
 * Shows current vs last quarter performance with trend indicators and compliance metrics.
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Quarterly comparison data object
 * @param {Object} props.data.current_quarter - Current quarter data
 * @param {string} props.data.current_quarter.quarter - Quarter name (e.g., "Jan-Mar")
 * @param {number} props.data.current_quarter.year - Year
 * @param {number} props.data.current_quarter.compliant - Compliant inspections count
 * @param {number} props.data.current_quarter.non_compliant - Non-compliant inspections count
 * @param {number} props.data.current_quarter.total_finished - Total finished inspections
 * @param {Object} props.data.last_quarter - Last quarter data (same structure as current_quarter)
 * @param {number} props.data.change_percentage - Percentage change from last quarter
 * @param {string} props.data.trend - Trend direction ('up', 'down', 'stable')
 * @param {boolean} props.isLoading - Whether to show loading state
 * @param {Function} props.onRefresh - Handler for refresh button
 * @returns {JSX.Element} Quarterly comparison card component
 */
const QuarterlyComparisonCard = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const noData =
    data.current_quarter.total_finished === 0 &&
    data.last_quarter.total_finished === 0;

  const getTrendIcon = () => {
    switch (data.trend) {
      case "up":
        return <TrendingUp size={16} className="text-green-600" />;
      case "down":
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  const calculatePercentage = (value) => {
    const total = data.current_quarter.total_finished;
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getTrendBadgeColor = () => {
    switch (data.trend) {
      case "up":
        return "bg-green-100 text-green-700";
      case "down":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className=" border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-lg border-sky-200 bg-white group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-sky-600" />
          Quarterly
        </h3>
        <div className="flex items-center gap-2">
          {/* Trend Badge */}
          {!noData && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${getTrendBadgeColor()}`}>
              {getTrendIcon()}
              {data.change_percentage > 0 ? "+" : ""}{data.change_percentage}%
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Refresh Quarterly Data"
          >
            <RefreshCw size={14} className="text-sky-600" />
          </button>
        </div>
      </div>

      {noData ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No quarterly data available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {/* Quarter Comparison */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Last Quarter - Compact */}
            <div>
              <div className="text-xs text-gray-500">Last Quarter</div>
              <div className="text-sm font-semibold text-gray-700">
                {data.last_quarter.quarter}
              </div>
              <div className="text-xl font-bold text-sky-700">
                {data.last_quarter.total_finished} <span className="text-xs font-normal text-gray-500">Inspected Establishments</span>
              </div>
            </div>
            
            {/* Current Quarter - Compact */}
            <div>
              <div className="text-xs text-gray-500">Current Quarter</div>
              <div className="text-sm font-semibold text-gray-700">
                {data.current_quarter.quarter}
              </div>
              <div className="text-xl font-bold text-sky-700">
                {data.current_quarter.total_finished} <span className="text-xs font-normal text-gray-500">Inspected Establishments</span>
              </div>
            </div>
          </div>

          {/* Compliance Breakdown with Progress Bars */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Compliance Breakdown</div>
            
            {/* Compliant Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Compliant
                </span>
                <span className="text-xs font-semibold text-green-700">
                  {data.current_quarter.compliant} ({calculatePercentage(data.current_quarter.compliant)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" 
                     style={{ width: `${calculatePercentage(data.current_quarter.compliant)}%` }}></div>
              </div>
            </div>
            
            {/* Non-Compliant Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Non-Compliant
                </span>
                <span className="text-xs font-semibold text-red-700">
                  {data.current_quarter.non_compliant} ({calculatePercentage(data.current_quarter.non_compliant)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all" 
                     style={{ width: `${calculatePercentage(data.current_quarter.non_compliant)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuarterlyComparisonCard;
