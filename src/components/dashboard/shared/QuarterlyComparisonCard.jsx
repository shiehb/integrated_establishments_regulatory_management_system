import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Filter,
} from "lucide-react";
import { getQuarterlyComparison } from "../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import QuarterlyComparisonSkeleton from "./QuarterlyComparisonSkeleton";

/**
 * QuarterlyComparisonCard
 * A compact, dashboard-friendly performance comparison component.
 * Supports monthly, quarterly, and yearly comparison views.
 */
const QuarterlyComparisonCard = ({ data, isLoading, onRefresh }) => {
  const [selectedLaw, setSelectedLaw] = useState('all');
  const [periodType, setPeriodType] = useState(() => {
    // Initialize from data if available, otherwise default to quarterly
    return data?.period_type || 'quarterly';
  });
  const [baseData, setBaseData] = useState(data);
  const [filteredData, setFilteredData] = useState(null);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  
  // Update baseData when data prop changes
  useEffect(() => {
    if (data && (!data.period_type || data.period_type === 'quarterly')) {
      setBaseData(data);
    }
  }, [data]);
  
  // Fetch data when period type changes (if different from data prop period type)
  useEffect(() => {
    const fetchDataForPeriod = async () => {
      // If period type is quarterly and data prop is quarterly, use data prop
      if (periodType === 'quarterly' && data && (!data.period_type || data.period_type === 'quarterly')) {
        setBaseData(data);
        setFilteredData(null);
        return;
      }
      
      // If period type is different from data prop, fetch new data
      if (selectedLaw === 'all') {
        setIsLoadingFilter(true);
        try {
          const newData = await getQuarterlyComparison({ 
            period_type: periodType 
          });
          if (newData && (newData.current_period || newData.current_quarter)) {
            setBaseData(newData);
            setFilteredData(null);
          }
        } catch {
          setBaseData(null);
        } finally {
          setIsLoadingFilter(false);
        }
      } else {
        // If law filter is active, fetch filtered data
        setIsLoadingFilter(true);
        try {
          const filteredResponse = await getQuarterlyComparison({ 
            law: selectedLaw,
            period_type: periodType 
          });
          if (filteredResponse && (filteredResponse.current_period || filteredResponse.current_quarter)) {
            setFilteredData(filteredResponse);
          } else {
            setFilteredData(null);
          }
        } catch {
          setFilteredData(null);
        } finally {
          setIsLoadingFilter(false);
        }
      }
    };
    
    fetchDataForPeriod();
  }, [periodType, selectedLaw, data]);
  
  if (isLoading || isLoadingFilter) return <QuarterlyComparisonSkeleton />;

  // Support both new (current_period/last_period) and old (current_quarter/last_quarter) data structures
  const getCurrentPeriod = (data) => data?.current_period || data?.current_quarter;
  const getLastPeriod = (data) => data?.last_period || data?.last_quarter;

  // Use filtered data if available, otherwise use baseData, fallback to data prop
  const displayData = filteredData || baseData || data;

  if (!displayData || (!getCurrentPeriod(displayData) || !getLastPeriod(displayData))) {
    return (
      <div className="bg-white border-b border-r border-gray-300 p-4 flex items-center justify-center text-gray-500 text-sm">
        {isLoadingFilter ? 'Loading data...' : 'No data available'}
      </div>
    );
  }
  
  // Add null checks to prevent errors
  const currentPeriod = getCurrentPeriod(displayData);
  const lastPeriod = getLastPeriod(displayData);
  
  if (!currentPeriod || !lastPeriod) {
    return (
      <div className="bg-white border-b border-r border-gray-300 p-4 flex items-center justify-center text-gray-500 text-sm">
        {isLoadingFilter ? 'Loading filtered data...' : 'No data available'}
      </div>
    );
  }

  // Get period type from data or use state
  const dataPeriodType = displayData.period_type || periodType;
  
  const noData =
    currentPeriod.total_finished === 0 &&
    lastPeriod.total_finished === 0;

  const getTrendIcon = () => {
    const trend = displayData?.trend || data?.trend || 'stable';
    switch (trend) {
      case "up":
        return <TrendingUp size={14} className="text-emerald-400" />;
      case "down":
        return <TrendingDown size={14} className="text-red-400" />;
      default:
        return <Minus size={14} className="text-sky-600" />;
    }
  };

  const getTrendBadgeColor = () => {
    const trend = displayData?.trend || data?.trend || 'stable';
    switch (trend) {
      case "up":
        return "bg-emerald-50 text-emerald-700 border border-emerald-300";
      case "down":
        return "bg-red-50 text-red-700 border border-red-300";
      default:
        return "bg-sky-50 text-sky-700 border border-sky-300";
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      // Refresh with current period type
      onRefresh(periodType);
    }
  };

  const handlePeriodTypeChange = (newPeriodType) => {
    setPeriodType(newPeriodType);
    setFilteredData(null); // Clear filtered data when period changes
    // Data will be fetched automatically via useEffect
  };

  // Period type options
  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Law options for filtering
  const lawOptions = [
    { value: 'all', label: 'All Laws' },
    { value: 'PD-1586', label: 'PD-1586' },
    { value: 'RA-6969', label: 'RA-6969' },
    { value: 'RA-8749', label: 'RA-8749' },
    { value: 'RA-9275', label: 'RA-9275' },
    { value: 'RA-9003', label: 'RA-9003' }
  ];

  // Get period labels based on period type
  const getPeriodLabel = (periodType, periodText) => {
    switch (periodType) {
      case 'monthly':
        return periodText; // Already formatted as "Jan 2025"
      case 'yearly':
        return periodText; // Already formatted as "2025"
      default: // quarterly
        return periodText; // Already formatted as "Jan-Mar 2025"
    }
  };

  const getPeriodDescription = (periodType, isCurrent) => {
    switch (periodType) {
      case 'monthly':
        return isCurrent ? 'Current Month' : 'Last Month';
      case 'yearly':
        return isCurrent ? 'Current Year' : 'Last Year';
      default: // quarterly
        return isCurrent ? 'Current Quarter' : 'Last Quarter';
    }
  };

  // Calculate totals for comparison using display data
  const lastPeriodTotal = lastPeriod.total_finished;
  const currentPeriodTotal = currentPeriod.total_finished;
  const totalChange = currentPeriodTotal - lastPeriodTotal;
  const totalChangePercent = lastPeriodTotal > 0 ? ((totalChange / lastPeriodTotal) * 100).toFixed(1) : 0;

  // Get period name (support both 'period' and 'quarter' fields for backward compatibility)
  const lastPeriodName = lastPeriod.period || lastPeriod.quarter || '';
  const currentPeriodName = currentPeriod.period || currentPeriod.quarter || '';

  const chartData = [
    {
      name: getPeriodLabel(dataPeriodType, lastPeriodName),
      compliant: lastPeriod.compliant,
      nonCompliant: lastPeriod.non_compliant,
      total: lastPeriod.total_finished,
      period: getPeriodDescription(dataPeriodType, false),
    },
    {
      name: getPeriodLabel(dataPeriodType, currentPeriodName),
      compliant: currentPeriod.compliant,
      nonCompliant: currentPeriod.non_compliant,
      total: currentPeriod.total_finished,
      period: getPeriodDescription(dataPeriodType, true),
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const total = d.compliant + d.nonCompliant;
      const compliantPercent =
        total > 0 ? ((d.compliant / total) * 100).toFixed(1) : 0;
      const nonCompliantPercent =
        total > 0 ? ((d.nonCompliant / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-2 border-r border-b border-gray-300 text-xs">
          <p className="font-medium text-gray-800 mb-1">{d.period}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Compliant
              </span>
              <span className="text-gray-800 font-semibold">
                {d.compliant} ({compliantPercent}%)
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Non-Compliant
              </span>
              <span className="text-gray-800 font-semibold">
                {d.nonCompliant} ({nonCompliantPercent}%)
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between font-medium text-gray-700">
            <span>Total:</span>
            <span className="text-gray-800">{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-b border-r border-gray-300 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-sky-600" />
            Performance Comparison
        </h3>
        <div className="flex items-center gap-3">
          {/* Period Type Selector */}
          <div className="flex items-center gap-2">
            <select
              value={periodType}
              onChange={(e) => handlePeriodTypeChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Law Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedLaw}
              onChange={(e) => setSelectedLaw(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {lawOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedLaw !== 'all' && (
              <span className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded">
                Filtered
              </span>
            )}
          </div>
          
          {!noData && displayData.change_percentage !== undefined && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getTrendBadgeColor()}`}
            >
              {getTrendIcon()}
              {displayData.change_percentage > 0 ? "+" : ""}
              {displayData.change_percentage}%
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      

      {/* Chart */}
      <div className="flex-1">
      {noData ? (
          <div className="flex items-center justify-center text-gray-400 h-40">
          <div className="text-center">
              <BarChart3 size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No {dataPeriodType} data</p>
              {selectedLaw !== 'all' && (
                <p className="text-xs text-gray-500 mt-1">Try selecting "All Laws" to see complete data</p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            {selectedLaw !== 'all' && (
              <div className="absolute top-2 right-2 z-10 bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm animate-pulse">
                Filtered: {selectedLaw}
                        </div>
                      )}
          <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
            <BarChart 
              data={chartData} 
              barGap={8}
              margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 16, fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 16, fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: "#f9fafb" }} 
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
              />
              <Bar 
                dataKey="compliant" 
                fill="#34D399"
                name="Compliant" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="nonCompliant" 
                fill="#F87171"
                name="Non-Compliant" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
        </div>
      {/* Totals moved to bottom */}
      {!noData && (
        <div className=" p-3 bg-gray-100 border border-gray-200 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">{getPeriodDescription(dataPeriodType, false)} Total:</span>
                <span className="ml-2 font-semibold text-gray-800">{lastPeriodTotal}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">{getPeriodDescription(dataPeriodType, true)} Total:</span>
                <span className="ml-2 font-semibold text-gray-800">{currentPeriodTotal}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Change:</span>
              <span className={`text-sm font-semibold ${
                totalChange > 0 ? 'text-emerald-600' : 
                totalChange < 0 ? 'text-red-400' : 'text-gray-600'
              }`}>
                {totalChange > 0 ? '+' : ''}{totalChange} ({totalChangePercent}%)
                </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuarterlyComparisonCard;
