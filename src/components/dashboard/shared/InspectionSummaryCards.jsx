import React from 'react';
import { Building, CheckCircle, XCircle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

export default function InspectionSummaryCards({ 
  stats = { total: 0, compliant: 0, nonCompliant: 0, complianceRate: 0 },
  loading = false,
  period,
  className = ""
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 border border-gray-200 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200"></div>
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 mb-2 w-24"></div>
                  <div className="h-8 bg-gray-200 w-16"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate additional metrics for enhanced display
  const total = stats.total || 0;
  const compliant = stats.compliant || 0;
  const nonCompliant = stats.nonCompliant || 0;
  const complianceRate = stats.complianceRate || 0;
  
  // Calculate percentages
  const compliantPercentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
  const nonCompliantPercentage = total > 0 ? Math.round((nonCompliant / total) * 100) : 0;

  const cards = [
    {
      title: "Total Inspections",
      value: total,
      icon: Building,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200",
      trend: null
    },
    {
      title: "Compliant",
      value: compliant,
      icon: CheckCircle,
      color: "text-green-600",
      iconBg: "bg-green-100",
      borderColor: "border-green-200",
      percentage: compliantPercentage,
      trend: null
    },
    {
      title: "Non-Compliant",
      value: nonCompliant,
      icon: XCircle,
      color: "text-red-600",
      iconBg: "bg-red-100",
      borderColor: "border-red-200",
      percentage: nonCompliantPercentage,
      trend: null
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      iconBg: "bg-purple-100",
      borderColor: "border-purple-200",
      isPercentage: true,
      trend: complianceRate >= 80 ? 'up' : complianceRate >= 60 ? 'stable' : 'down'
    }
  ];

  return (
    <div className={`${className}`}>
      {/* Main Stats Grid */}
      <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-l border-gray-300 ">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`bg-white p-6 h-40 border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`${card.iconBg} p-3`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</p>
                  {card.percentage !== undefined && (
                    <p className="text-xs text-gray-500">{card.percentage}% of total</p>
                  )}
                  {card.trend && (
                    <div className="flex items-center mt-1">
                      {card.trend === 'up' && (
                        <>
                          <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600 font-medium">Good</span>
                        </>
                      )}
                      {card.trend === 'down' && (
                        <>
                          <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                          <span className="text-xs text-red-600 font-medium">Needs Attention</span>
                        </>
                      )}
                      {card.trend === 'stable' && (
                        <span className="text-xs text-gray-600 font-medium">Stable</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Period Display (if provided) */}
      {period && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 mr-2 animate-pulse"></div>
            {period}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      {/* <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Performance Overview</p>
              <p className="text-xs text-gray-600">
                {total} total inspections • {complianceRate}% compliance rate
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Last updated</div>
            <div className="text-xs font-medium text-gray-700">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
