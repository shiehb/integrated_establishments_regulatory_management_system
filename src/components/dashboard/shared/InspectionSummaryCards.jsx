import React from 'react';
import { Building, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function InspectionSummaryCards({ 
  stats = { total: 0, compliant: 0, nonCompliant: 0, complianceRate: 0 },
  loading = false,
  period,
  className = ""
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {/* Total Inspections Card */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <Building className="w-8 h-8 text-sky-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total Inspections</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Compliant Card */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Compliant</p>
            <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
          </div>
        </div>
      </div>

      {/* Non-Compliant Card */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <XCircle className="w-8 h-8 text-red-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
            <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
          </div>
        </div>
      </div>

      {/* Compliance Rate Card */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
            <p className="text-2xl font-bold text-blue-600">{stats.complianceRate}%</p>
          </div>
        </div>
      </div>

      {/* Period Display (if provided) */}
      {period && (
        <div className="col-span-full text-center text-sm text-gray-500 mt-2">
          {period}
        </div>
      )}
    </div>
  );
}
