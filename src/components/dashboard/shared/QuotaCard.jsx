import React, { useState } from "react";
import { Target, TrendingUp, Edit3, AlertCircle, FileCheck, AlertTriangle, Wind, Droplets, Recycle } from "lucide-react";
import { useQuotaData } from "./useQuotaData";
import { getQuotaColor, formatQuotaDisplay } from "../../../constants/quotaConstants";
import QuotaModal from "./QuotaModal";
import QuotaSkeleton from "./QuotaSkeleton";

const QuotaCard = ({ userRole = null, year = null, quarter = null }) => {
  const { quotas, isLoading, error, refetch, updateQuota } = useQuotaData(userRole, year, quarter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);

  const canEdit = ['Admin', 'Division Chief'].includes(userRole);

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
    <div className="bg-white border-b border-gray-300 p-4">
      {noData ? (
        <div className="flex items-center justify-center text-gray-400 py-8">
          <div className="text-center">
            <Target size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No quotas set for this quarter</p>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          sortedQuotas.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          sortedQuotas.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
          sortedQuotas.length === 3 ? 'grid-cols-3  mx-auto' :
          sortedQuotas.length === 4 ? 'grid-cols-4' :
          'grid-cols-5'
        }`}>
          {sortedQuotas.map((quota) => {
            const style = getProgressBarStyle(quota);
            const exceeded = quota.accomplished > quota.target;
            const display = formatQuotaDisplay(quota.accomplished, quota.target);
            
            return (
              <div key={quota.id} className="group relative border border-gray-300 p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                {canEdit && (
                  <button
                    onClick={() => handleEditQuota(quota)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-gray-800 p-1.5 bg-white border border-gray-300 rounded shadow-sm z-10"
                    title="Edit Quota"
                  >
                    <Edit3 size={14} />
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
