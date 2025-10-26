import React, { useState } from "react";
import { Target, TrendingUp, Edit3, AlertCircle, FileCheck, AlertTriangle, Wind, Droplets, Recycle, Calendar, Archive, Plus } from "lucide-react";
import { useQuotaData } from "./useQuotaData";
import { getQuotaColor, formatQuotaDisplay, QUARTERS } from "../../../constants/quotaConstants";
import QuotaModal from "./QuotaModal";
import QuotaSkeleton from "./QuotaSkeleton";

const QuotaCard = ({ userRole = null }) => {
  // Calculate current year and quarter
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  // State for year/quarter selection - defaults to current quarter
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);

  // Pass selected year/quarter to the hook
  const { quotas, isLoading, error, refetch, updateQuota } = useQuotaData(
    userRole, 
    selectedYear, 
    selectedQuarter
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);

  const canEdit = ['Admin', 'Division Chief'].includes(userRole);

  // Generate available years (from 2020 to current year + 1 for future planning)
  const availableYears = [];
  for (let y = 2020; y <= currentYear + 1; y++) {
    availableYears.push(y);
  }

  // Check if viewing archived (past) data
  const isArchived = selectedYear < currentYear || 
                     (selectedYear === currentYear && selectedQuarter < currentQuarter);
  const isCurrent = selectedYear === currentYear && selectedQuarter === currentQuarter;
  const isFuture = selectedYear > currentYear || 
                   (selectedYear === currentYear && selectedQuarter > currentQuarter);

  // Law display order
  const lawOrder = ['PD-1586', 'RA-8749', 'RA-9275', 'RA-6969', 'RA-9003'];

  // Icon mapping for each law with colors
  const getLawIcon = (lawId) => {
    switch (lawId) {
      case 'PD-1586':
        return <FileCheck size={28} className="text-blue-600" />;
      case 'RA-8749':
        return <Wind size={28} className="text-sky-600" />;
      case 'RA-9275':
        return <Droplets size={28} className="text-cyan-600" />;
      case 'RA-6969':
        return <AlertTriangle size={28} className="text-orange-600" />;
      case 'RA-9003':
        return <Recycle size={28} className="text-emerald-600" />;
      default:
        return <Target size={28} className="text-gray-600" />;
    }
  };

  // Sort quotas by the specified order
  const sortedQuotas = quotas ? [...quotas].sort((a, b) => {
    const indexA = lawOrder.indexOf(a.law);
    const indexB = lawOrder.indexOf(b.law);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }) : [];

  const handleEditQuota = (quota) => {
    setEditingQuota(quota);
    setIsModalOpen(true);
  };

  const handleSaveQuota = async (quotaData) => {
    await updateQuota(quotaData);
    setIsModalOpen(false);
  };

  const handleAddQuota = () => {
    setEditingQuota(null); // Set to null for new quota
    setIsModalOpen(true);
  };

  const getProgressBarStyle = (quota) => {
    const percentage = Math.min((quota.accomplished / quota.target) * 100, 100);
    const exceeded = quota.accomplished > quota.target;
    const met = quota.accomplished >= quota.target;
    
    // Custom color scheme: emerald for in-progress, sky for met, amber for exceeded
    let colors;
    if (exceeded) {
      colors = getQuotaColor('exceeded');
    } else if (met) {
      colors = {
        background: 'bg-gradient-to-r from-sky-400 to-sky-500',
        border: 'border-sky-300',
        text: 'text-sky-600'
      };
    } else {
      colors = {
        background: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
        border: 'border-emerald-300',
        text: 'text-emerald-600'
      };
    }
    
    return {
      width: `${percentage}%`,
      background: colors.background,
      borderColor: colors.border,
      pattern: exceeded ? 'bg-stripes' : ''
    };
  };

  if (isLoading) {
    return <QuotaSkeleton />;
  }

  if (error) {
    return (
      <div className="border border-gray-300 p-4 bg-white">
        <div className="flex items-center justify-center text-red-600">
          <div className="text-center">
            <AlertCircle size={40} className="mx-auto mb-3" />
            <p className="text-sm">Error loading quotas</p>
            <button
              onClick={refetch}
              className="mt-2 text-xs text-gray-600 hover:text-gray-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const noData = !quotas || quotas.length === 0;

  return (
    <div className="bg-white border-b border-gray-300">
      {/* Year/Quarter Selector Header */}
      <div className="border-b border-gray-300 p-4 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Title with Period and Badge */}
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-sky-600" />
            {isCurrent && (
              <span className="px-2 py-1 text-xs font-medium bg-sky-100 text-sky-700 rounded flex items-center gap-1">
                <Target size={12} />
                Current
              </span>
            )}
            {isArchived && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded flex items-center gap-1">
                <Archive size={12} />
                Archived
              </span>
            )}
            {isFuture && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                <TrendingUp size={12} />
                Future
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-800">
              Quarter {selectedQuarter}, {selectedYear} - {QUARTERS.find(q => q.value === selectedQuarter)?.months}
            </h3>
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Quarter Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Quarter:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
              >
                {QUARTERS.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>

            {/* Add Quota Button */}
            {canEdit && (
              <button
                onClick={handleAddQuota}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                Set Quota
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quota Cards Content */}
      <div className="p-4">
      {noData ? (
        <div className="flex items-center justify-center text-gray-400 py-8">
          <div className="text-center">
            <Target size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No quotas set for Quarter {selectedQuarter}, {selectedYear} ({QUARTERS.find(q => q.value === selectedQuarter)?.months})
            </p>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          sortedQuotas.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          sortedQuotas.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
            sortedQuotas.length === 3 ? 'grid-cols-3 mx-auto' :
          sortedQuotas.length === 4 ? 'grid-cols-4' :
          'grid-cols-5'
        }`}>
          {sortedQuotas.map((quota) => {
            const style = getProgressBarStyle(quota);
            const exceeded = quota.accomplished > quota.target;
            const display = formatQuotaDisplay(quota.accomplished, quota.target);
            
            return (
              <div key={quota.id} className="group relative border border-gray-300 p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {canEdit && !isArchived && (
                  <button
                    onClick={() => handleEditQuota(quota)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 hover:bg-white p-1.5 rounded shadow-sm z-10 transition-all"
                    title="Edit Quota"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                
                {/* Law Name with Icon and Auto Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getLawIcon(quota.law)}
                    <span className="font-semibold text-base text-gray-800">{quota.law}</span>
                  </div>
                  {quota.auto_adjusted && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 border border-amber-300 flex items-center gap-1">
                      <TrendingUp size={10} />
                      Auto
                    </span>
                  )}
                </div>
                
                {/* Numbers - Horizontal Layout */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-3xl font-bold text-sky-600">
                    {display.display}
                  </div>
                  <div className={`text-xl font-bold ${
                    exceeded ? 'text-amber-600' : 
                    quota.accomplished >= quota.target ? 'text-sky-600' : 'text-emerald-600'
                  }`}>
                    {display.percentage}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 h-10 border border-gray-300">
                    <div
                      className={`h-10 ${style.pattern}`}
                      style={{ width: style.width }}
                    >
                      <div className={`h-full ${style.background}`}></div>
                    </div>
                  </div>
                  {exceeded && (
                    <div className="absolute -top-6 right-0 text-xs font-semibold text-amber-600">
                      +{display.exceededAmount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <QuotaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quota={editingQuota}
        onSave={handleSaveQuota}
      />
    </div>
  );
};

export default QuotaCard;
