import React, { useState, useMemo, useEffect } from "react";
import { Target, TrendingUp, Edit3, AlertCircle, FileCheck, AlertTriangle, Wind, Droplets, Recycle, Calendar, Archive, Plus, BarChart3, Scale } from "lucide-react";
import { useQuotaData } from "./useQuotaData";
import { getQuotaColor, formatQuotaDisplay, QUARTERS, MONTHS, getQuarterFromMonth, isPastMonth, isCurrentMonth, getActiveLaws } from "../../../constants/quotaConstants";
import QuotaModal from "./QuotaModal";
import QuotaSkeleton from "./QuotaSkeleton";

const QuotaCard = ({ userRole = null }) => {
  // Calculate current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1; // 1-12
  const currentQuarter = Math.floor((currentMonthNum - 1) / 3) + 1;

  // State for view mode and period selection
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum); // For monthly view
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter); // For quarterly view

  // Determine which period to fetch based on view mode
  const fetchParams = useMemo(() => {
    if (viewMode === 'monthly') {
      return { year: selectedYear, month: selectedMonth, viewMode: 'monthly' };
    } else if (viewMode === 'quarterly') {
      return { year: selectedYear, quarter: selectedQuarter, viewMode: 'quarterly' };
    } else {
      return { year: selectedYear, viewMode: 'yearly' };
    }
  }, [viewMode, selectedYear, selectedMonth, selectedQuarter]);

  // Pass parameters to the hook
  const { quotas, isLoading, error, refetch, updateQuota } = useQuotaData(
    userRole, 
    fetchParams
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);
  const [laws, setLaws] = useState([]);
  const [isLoadingLaws, setIsLoadingLaws] = useState(true);

  const canEdit = ['Admin', 'Division Chief'].includes(userRole);
  
  // Fetch active laws from API
  useEffect(() => {
    const fetchLaws = async () => {
      setIsLoadingLaws(true);
      try {
        const activeLaws = await getActiveLaws();
        setLaws(activeLaws);
      } catch (error) {
        console.error('Error fetching laws for quota cards:', error);
        // Fallback to empty array - quotas will still show based on API data
        setLaws([]);
      } finally {
        setIsLoadingLaws(false);
      }
    };
    fetchLaws();
  }, []);

  // Generate available years (from 2020 to current year + 1 for future planning)
  const availableYears = [];
  for (let y = 2020; y <= currentYear + 1; y++) {
    availableYears.push(y);
  }

  // Check if viewing archived (past) data based on view mode
  const isArchived = useMemo(() => {
    if (viewMode === 'monthly') {
      return isPastMonth(selectedYear, selectedMonth);
    } else if (viewMode === 'quarterly') {
      return selectedYear < currentYear || 
                     (selectedYear === currentYear && selectedQuarter < currentQuarter);
    } else {
      return selectedYear < currentYear;
    }
  }, [viewMode, selectedYear, selectedMonth, selectedQuarter, currentYear, currentQuarter]);

  const isCurrent = useMemo(() => {
    if (viewMode === 'monthly') {
      return isCurrentMonth(selectedYear, selectedMonth);
    } else if (viewMode === 'quarterly') {
      return selectedYear === currentYear && selectedQuarter === currentQuarter;
    } else {
      return selectedYear === currentYear;
    }
  }, [viewMode, selectedYear, selectedMonth, selectedQuarter, currentYear, currentQuarter, currentMonthNum]);

  const isFuture = useMemo(() => {
    if (viewMode === 'monthly') {
      return selectedYear > currentYear || 
             (selectedYear === currentYear && selectedMonth > currentMonthNum);
    } else if (viewMode === 'quarterly') {
      return selectedYear > currentYear || 
                   (selectedYear === currentYear && selectedQuarter > currentQuarter);
    } else {
      return selectedYear > currentYear;
    }
  }, [viewMode, selectedYear, selectedMonth, selectedQuarter, currentYear, currentQuarter, currentMonthNum]);

  // Original law display order (prioritized)
  const originalLawOrder = ['PD-1586', 'RA-8749', 'RA-9275', 'RA-6969', 'RA-9003'];

  // Smart icon mapping based on law code and category
  const getLawIcon = (lawId, lawCategory = null) => {
    // Original laws with specific icons
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
        // Smart icon selection based on category for new laws
        if (lawCategory) {
          const categoryLower = lawCategory.toLowerCase();
          if (categoryLower.includes('air') || categoryLower.includes('quality')) {
            return <Wind size={28} className="text-purple-600" />;
          } else if (categoryLower.includes('water') || categoryLower.includes('marine')) {
            return <Droplets size={28} className="text-teal-600" />;
          } else if (categoryLower.includes('waste') || categoryLower.includes('solid')) {
            return <Recycle size={28} className="text-green-600" />;
          } else if (categoryLower.includes('hazard') || categoryLower.includes('toxic')) {
            return <AlertTriangle size={28} className="text-red-600" />;
          } else if (categoryLower.includes('impact') || categoryLower.includes('eia')) {
            return <FileCheck size={28} className="text-indigo-600" />;
          }
        }
        // Default icon for laws without category match
        return <Scale size={28} className="text-gray-600" />;
    }
  };

  // Get law category for a given law code
  const getLawCategory = (lawId) => {
    const law = laws.find(l => l.id === lawId || l.reference_code === lawId);
    return law?.category || null;
  };

  // Sort quotas: original 5 laws first (in order), then alphabetically by law code
  const sortedQuotas = useMemo(() => {
    if (!quotas) return [];
    
    return [...quotas].sort((a, b) => {
      const indexA = originalLawOrder.indexOf(a.law);
      const indexB = originalLawOrder.indexOf(b.law);
      
      // Both are original laws - sort by original order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // A is original, B is new - A comes first
      if (indexA !== -1) return -1;
      
      // B is original, A is new - B comes first
      if (indexB !== -1) return 1;
      
      // Both are new laws - sort alphabetically
      return a.law.localeCompare(b.law);
    });
  }, [quotas]);

  const handleEditQuota = (quota) => {
    setEditingQuota(quota);
    setIsModalOpen(true);
  };

  const handleSaveQuota = async (quotaData) => {
    try {
      // quotaData can be a single quota or array of quotas (for bulk creation)
      const quotasToSave = Array.isArray(quotaData) ? quotaData : [quotaData];
      
      // Use bulk API endpoint for arrays, single API for single quota
      if (Array.isArray(quotaData) && quotaData.length > 1) {
        const { setQuota } = await import('../../../services/api');
        const result = await setQuota(quotasToSave);
        
        // Handle bulk response - check for errors
        if (result && typeof result === 'object' && result.errors && result.errors.length > 0) {
          const errorMessage = result.errors.map(e => `${e.law || 'Unknown'}: ${e.error}`).join('; ');
          throw new Error(`Some quotas failed to save: ${errorMessage}`);
        }
        
        // For bulk operations, just refetch - the hook will handle state updates
        // The API already handles the creation/update, so we just need to refresh
      } else {
        // Single quota or array with one item - use existing updateQuota
        const quota = Array.isArray(quotaData) ? quotaData[0] : quotaData;
        await updateQuota(quota);
      }
      
    setIsModalOpen(false);
      refetch(); // Refresh to show updated data
    } catch (err) {
      console.error('Error saving quota(s):', err);
      throw err; // Re-throw to let QuotaModal handle the error
    }
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
        background: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
        border: 'border-sky-300',
        text: 'text-sky-600'
      };
    } else {
      colors = {
        background: 'bg-gradient-to-r from-sky-400 to-sky-500',
        border: 'border-sky-300',
        text: 'text-sky-600'
      };
    }
    
    return {
      width: `${percentage}%`,
      background: colors.background,
      borderColor: colors.border,
      pattern: exceeded ? 'bg-stripes' : ''
    };
  };

  // Show loading while fetching either quotas or laws
  if (isLoading || isLoadingLaws) {
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
      <div className="border-b border-gray-300 p-2 bg-gray-50">
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
              {viewMode === 'monthly' && (
                <>Month: {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</>
              )}
              {viewMode === 'quarterly' && (
                <>Quarter {selectedQuarter}, {selectedYear} - {QUARTERS.find(q => q.value === selectedQuarter)?.monthsLabel}</>
              )}
              {viewMode === 'yearly' && (
                <>Year: {selectedYear}</>
              )}
            </h3>
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  // Reset to current period when switching modes
                  if (e.target.value === 'monthly') {
                    setSelectedMonth(currentMonthNum);
                  } else if (e.target.value === 'quarterly') {
                    setSelectedQuarter(currentQuarter);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector (for monthly view) */}
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
                >
                  {MONTHS.map(month => (
                    <option 
                      key={month.value} 
                      value={month.value}
                      disabled={isPastMonth(selectedYear, month.value) && !canEdit}
                    >
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quarter Selector (for quarterly view) */}
            {viewMode === 'quarterly' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Quarter:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
              >
                {QUARTERS.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
            )}

            {/* Add Quota Button */}
            {canEdit && (
              <button
                onClick={handleAddQuota}
                className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                Set Target
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
              {viewMode === 'monthly' && (
                <>No quotas set for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</>
              )}
              {viewMode === 'quarterly' && (
                <>No quotas set for Quarter {selectedQuarter}, {selectedYear} ({QUARTERS.find(q => q.value === selectedQuarter)?.monthsLabel})</>
              )}
              {viewMode === 'yearly' && (
                <>No quotas set for {selectedYear}</>
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
        <div className={`grid gap-4 ${
          sortedQuotas.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          sortedQuotas.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
          sortedQuotas.length === 3 ? 'grid-cols-3 mx-auto' :
          sortedQuotas.length === 4 ? 'grid-cols-4' :
          sortedQuotas.length === 5 ? 'grid-cols-5' :
          sortedQuotas.length === 6 ? 'grid-cols-6' :
          'grid-cols-5 xl:grid-cols-6'
        }`}>
          {sortedQuotas.map((quota) => {
            const style = getProgressBarStyle(quota);
            const exceeded = quota.accomplished > quota.target;
            const display = formatQuotaDisplay(quota.accomplished, quota.target);
            
            // Use a unique key that handles both regular and aggregated quotas
            // For aggregated quarterly quotas, month is null, so use law+year+quarter
            const uniqueKey = quota.month !== null && quota.month !== undefined 
              ? quota.id 
              : `${quota.law}-${quota.year}-${quota.quarter}`;
            
            return (
              <div key={uniqueKey} className="group relative border border-gray-300 p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
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
                    {getLawIcon(quota.law, getLawCategory(quota.law))}
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
                    exceeded ? 'text-green-600' : 
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
                    <div className="absolute -top-6 right-0 text-xs font-semibold text-green-600">
                      +{display.exceededAmount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
      </div>

      <QuotaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quota={editingQuota}
        onSave={handleSaveQuota}
        defaultYear={selectedYear}
        defaultQuarter={viewMode === 'quarterly' ? selectedQuarter : (viewMode === 'monthly' ? getQuarterFromMonth(selectedMonth) : null)}
      />
    </div>
  );
};

export default QuotaCard;
