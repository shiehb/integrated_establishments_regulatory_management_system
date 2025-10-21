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
import LoadingSkeleton from "./LoadingSkeleton";

/**
 * QuarterlyComparisonCard
 * A compact, dashboard-friendly quarterly comparison component.
 */
const QuarterlyComparisonCard = ({ data, isLoading, onRefresh }) => {
  const [selectedLaw, setSelectedLaw] = useState('all');
  const [filteredData, setFilteredData] = useState(null);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  
  // Fetch filtered data when law changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (selectedLaw === 'all') {
        setFilteredData(null); // Clear filtered data for 'all'
        return;
      }
      
      if (!data) return; // Don't fetch if no base data
      
      setIsLoadingFilter(true);
      try {
        const filteredResponse = await getQuarterlyComparison({ law: selectedLaw });
        // Validate the response structure
        if (filteredResponse && filteredResponse.current_quarter && filteredResponse.last_quarter) {
          setFilteredData(filteredResponse);
        } else {
          setFilteredData(null);
        }
      } catch {
        setFilteredData(null); // Clear filtered data on error
      } finally {
        setIsLoadingFilter(false);
      }
    };
    
    fetchFilteredData();
  }, [selectedLaw, data]);
  
  if (isLoading || isLoadingFilter) return <LoadingSkeleton />;

  if (!data || !data.current_quarter || !data.last_quarter) {
    return (
      <div className="bg-white border-b border-r border-gray-300 p-4 flex items-center justify-center text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  // Use filtered data if available, otherwise use original data
  const displayData = filteredData || data;
  
  // Add null checks to prevent errors
  if (!displayData || !displayData.current_quarter || !displayData.last_quarter) {
    return (
      <div className="bg-white border-b border-r border-gray-300 p-4 flex items-center justify-center text-gray-500 text-sm">
        {isLoadingFilter ? 'Loading filtered data...' : 'No data available'}
      </div>
    );
  }
  
  const noData =
    displayData.current_quarter.total_finished === 0 &&
    displayData.last_quarter.total_finished === 0;

  const getTrendIcon = () => {
    switch (data.trend) {
      case "up":
        return <TrendingUp size={14} className="text-emerald-400" />;
      case "down":
        return <TrendingDown size={14} className="text-red-400" />;
      default:
        return <Minus size={14} className="text-sky-600" />;
    }
  };

  const getTrendBadgeColor = () => {
    switch (data.trend) {
      case "up":
        return "bg-emerald-50 text-emerald-700 border border-emerald-300";
      case "down":
        return "bg-red-50 text-red-700 border border-red-300";
      default:
        return "bg-sky-50 text-sky-700 border border-sky-300";
    }
  };

  const handleRefresh = () => onRefresh && onRefresh();

  // Law options for filtering
  const lawOptions = [
    { value: 'all', label: 'All Laws' },
    { value: 'PD-1586', label: 'PD-1586' },
    { value: 'RA-6969', label: 'RA-6969' },
    { value: 'RA-8749', label: 'RA-8749' },
    { value: 'RA-9275', label: 'RA-9275' },
    { value: 'RA-9003', label: 'RA-9003' }
  ];

  // Calculate totals for comparison using display data
  const lastQuarterTotal = displayData.last_quarter.total_finished;
  const currentQuarterTotal = displayData.current_quarter.total_finished;
  const totalChange = currentQuarterTotal - lastQuarterTotal;
  const totalChangePercent = lastQuarterTotal > 0 ? ((totalChange / lastQuarterTotal) * 100).toFixed(1) : 0;

  const chartData = [
    {
      name: displayData.last_quarter.quarter,
      compliant: displayData.last_quarter.compliant,
      nonCompliant: displayData.last_quarter.non_compliant,
      total: displayData.last_quarter.total_finished,
      period: "Last Quarter",
    },
    {
      name: displayData.current_quarter.quarter,
      compliant: displayData.current_quarter.compliant,
      nonCompliant: displayData.current_quarter.non_compliant,
      total: displayData.current_quarter.total_finished,
      period: "Current Quarter",
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
            Comparison
        </h3>
        <div className="flex items-center gap-3">
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
          
          {!noData && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getTrendBadgeColor()}`}
            >
              {getTrendIcon()}
              {data.change_percentage > 0 ? "+" : ""}
              {data.change_percentage}%
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
              <p className="text-xs font-medium">No quarterly data</p>
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
                <span className="text-gray-600">Last Quarter Total:</span>
                <span className="ml-2 font-semibold text-gray-800">{lastQuarterTotal}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Current Quarter Total:</span>
                <span className="ml-2 font-semibold text-gray-800">{currentQuarterTotal}</span>
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
