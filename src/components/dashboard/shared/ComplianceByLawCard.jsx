import React from "react";
import {
  Bar,
} from 'react-chartjs-2';
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useComplianceByLawChart } from "./useComplianceByLawChart";
import LoadingSkeleton from "./LoadingSkeleton";

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
    return <LoadingSkeleton />;
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Vertical bars
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const value = dataset.data[context.dataIndex];
            const total = data[context.dataIndex]?.total || 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${dataset.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 1
      }
    }
  };

  return (
    <div className="border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-lg border-sky-200 bg-white group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-sky-600" />
          Compliance by Law
        </h3>
        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={handleViewAll}
              className="p-1.5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="View All Inspections"
            >
              <BarChart3 size={14} className="text-sky-600" />
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Refresh Compliance Data"
          >
            <RefreshCw size={14} className="text-sky-600" />
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
            <div style={{ height: '300px', width: '100%' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Summary Stats */}
          {/* <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">Total Laws</div>
                <div className="text-lg font-semibold text-gray-700">
                  {data.filter(item => item.total > 0).length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Inspections</div>
                <div className="text-lg font-semibold text-sky-700">
                  {data.reduce((sum, item) => sum + item.total, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg per Law</div>
                <div className="text-lg font-semibold text-gray-700">
                  {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.total, 0) / data.length) : 0}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ComplianceByLawCard;
