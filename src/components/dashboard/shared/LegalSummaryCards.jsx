import React from 'react';
import { Scale, FileText, AlertCircle, Building } from 'lucide-react';

export default function LegalSummaryCards({ 
  stats = { legalReview: 0, novSent: 0, nooSent: 0, totalCases: 0 },
  loading = false,
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
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Legal Review",
      value: stats.legalReview,
      icon: Scale,
      color: "text-orange-600",
      iconBg: "bg-orange-100",
      borderColor: "border-orange-200"
    },
    {
      title: "NOV Sent",
      value: stats.novSent,
      icon: FileText,
      color: "text-orange-600",
      iconBg: "bg-orange-100",
      borderColor: "border-orange-200"
    },
    {
      title: "NOO Sent",
      value: stats.nooSent,
      icon: AlertCircle,
      color: "text-orange-600",
      iconBg: "bg-orange-100",
      borderColor: "border-orange-200"
    },
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: Building,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200"
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-l border-gray-300">
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
