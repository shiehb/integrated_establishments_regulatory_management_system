import React, { useState, useEffect, useMemo } from "react";
import { X, Target, AlertCircle, Calendar, Info } from "lucide-react";
import { LAWS as FALLBACK_LAWS, QUARTERS, MONTHS, getQuarterFromMonth, getMonthsInQuarter, isPastMonth, getActiveLaws } from "../../../constants/quotaConstants";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import { getQuotas } from "../../../services/api";
import Header from "../../Header";
import Footer from "../../Footer";

const QuotaModal = ({ isOpen, onClose, quota, onSave, defaultYear = null, defaultQuarter = null }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentQuarter = Math.floor((currentMonthNum - 1) / 3) + 1;
  
  const initialYear = defaultYear || currentYear;
  const initialQuarter = defaultQuarter || currentQuarter;

  const [formData, setFormData] = useState({
    year: initialYear,
    quarter: initialQuarter || null, // Can be null when year changes
    selectedLaws: [],
    selectedMonths: [],
    monthTargets: {}, // { month: { law: target } } structure
    auto_adjust: true
  });

  const [LAWS, setLAWS] = useState(FALLBACK_LAWS); // Dynamic laws from API
  const [existingQuotas, setExistingQuotas] = useState([]);
  const [allQuartersQuotas, setAllQuartersQuotas] = useState([]); // Store quotas for all quarters of a year
  const [loadingQuotas, setLoadingQuotas] = useState(false);
  const [loadingAllQuarters, setLoadingAllQuarters] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Fetch active laws when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchLaws = async () => {
        try {
          const laws = await getActiveLaws();
          setLAWS(laws);
        } catch (error) {
          console.error('Error fetching laws for quota modal:', error);
          // Keep fallback laws on error
        }
      };
      fetchLaws();
    }
  }, [isOpen]);

  // Fetch existing quotas to determine which months are already set
  useEffect(() => {
    if (isOpen && formData.year && formData.quarter !== null && formData.quarter !== undefined) {
      // Always fetch to check availability, even if it might be past
      // This ensures months are shown correctly
      setInitialLoadComplete(false); // Reset when year/quarter changes
      fetchExistingQuotas();
    } else if (isOpen) {
      // Reset quotas when year/quarter is not set
      setExistingQuotas([]);
      setInitialLoadComplete(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.year, formData.quarter]);

  // Fetch quotas for all quarters of a year to check if all are set/past
  useEffect(() => {
    if (isOpen && formData.year) {
      fetchAllQuartersQuotas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.year]);

  // Auto-switch year when all quarters are set/past
  useEffect(() => {
    if (isOpen && !quota && allQuartersQuotas.length > 0 && !loadingAllQuarters) {
      if (areAllQuartersSetOrPast(formData.year) && formData.year === currentYear) {
        // Auto-switch to next year if current year is all set/past
        setFormData(prev => ({
          ...prev,
          year: currentYear + 1,
          quarter: 1, // Start with Q1 of next year
          selectedMonths: [],
          monthTargets: {}
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, allQuartersQuotas, loadingAllQuarters, formData.year]);

  // Auto-deselect laws that become disabled (have records)
  useEffect(() => {
    if (isOpen && formData.selectedLaws.length > 0 && existingQuotas.length > 0) {
      const disabledLaws = formData.selectedLaws.filter(lawId => 
        hasLawRecordForPeriod(lawId) && !quota
      );
      
      if (disabledLaws.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedLaws: prev.selectedLaws.filter(l => !disabledLaws.includes(l)),
          monthTargets: Object.fromEntries(
            Object.entries(prev.monthTargets).map(([month, targets]) => [
              month,
              Object.fromEntries(
                Object.entries(targets).filter(([law]) => !disabledLaws.includes(law))
              )
            ])
          )
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.quarter, formData.year, existingQuotas]);

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    if (!isOpen) {
      // Reset form when closing
      setFormData({
        year: initialYear,
        quarter: initialQuarter || null,
        selectedLaws: [],
        selectedMonths: [],
        monthTargets: {},
        auto_adjust: true
      });
      setErrors({});
      setExistingQuotas([]); // Clear existing quotas when closing
      setInitialLoadComplete(false); // Reset loading state when closing
      return;
    }

    if (quota) {
      // Editing mode - single quota
      // For aggregated quarterly quotas, month will be null
      // In that case, we need to fetch all monthly quotas for this law in this quarter
      if (quota.month === null || quota.month === undefined) {
        // Aggregated quarterly quota - fetch all monthly quotas for this law/quarter
        const quarter = quota.quarter || getQuarterFromMonth(currentMonthNum);
        setFormData({
          year: quota.year,
          quarter: quarter,
          selectedLaws: [quota.law],
          selectedMonths: [], // Will be populated after fetching existing quotas
          monthTargets: {},
          auto_adjust: quota.auto_adjusted
        });
        // Fetch existing quotas to populate the form
        // This will happen in the useEffect that depends on formData.quarter
      } else {
        // Regular monthly quota - edit single month
        const month = quota.month;
        const quarter = quota.quarter || getQuarterFromMonth(month);
        
        setFormData({
          year: quota.year,
          quarter: quarter,
          selectedLaws: [quota.law],
          selectedMonths: [month],
          monthTargets: {
            [month]: {
              [quota.law]: quota.target
            }
          },
          auto_adjust: quota.auto_adjusted
        });
      }
    } else {
      // New quota mode - ensure we don't start with a past quarter
      let quarter = initialQuarter;
      const quarterMonths = getMonthsInQuarter(quarter);
      const lastMonth = quarterMonths[quarterMonths.length - 1];
      const isPast = initialYear < currentYear || 
                     (initialYear === currentYear && lastMonth < currentMonthNum);
      
      if (isPast) {
        quarter = currentQuarter;
      }
      
      setFormData({
        year: initialYear,
        quarter: quarter,
        selectedLaws: [],
        selectedMonths: [],
        monthTargets: {},
        auto_adjust: true
      });
    }
  }, [quota, isOpen, initialYear, initialQuarter, currentMonthNum, currentQuarter, currentYear]);

  const fetchExistingQuotas = async () => {
    setLoadingQuotas(true);
    setInitialLoadComplete(false); // Reset on new fetch
    try {
      // For quarterly view, we need monthly data (not aggregated) to show individual months
      // So we fetch monthly data for each month in the quarter to get individual records
      const quarterMonths = getMonthsInQuarter(formData.quarter);
      const promises = quarterMonths.map(month => 
        getQuotas({ 
          year: formData.year, 
          month: month,
          viewMode: 'monthly' // Get monthly data (not aggregated)
        })
      );
      const results = await Promise.all(promises);
      // Flatten all results into a single array
      const allQuotas = results.flat();
      // Filter to only show quotas for the selected law if editing
      const quotas = allQuotas.filter(q => {
        // If editing a specific law, only show quotas for that law
        if (quota && quota.law) {
          return q.law === quota.law;
        }
        return true;
      });
      console.log('Fetched existing quotas for Q' + formData.quarter + ' ' + formData.year + ':', quotas);
      setExistingQuotas(quotas);
      
      // If editing an aggregated quarterly quota, pre-populate selected months and targets
      if (quota && (quota.month === null || quota.month === undefined)) {
        const monthTargets = {};
        const selectedMonths = [];
        
        quarterMonths.forEach(month => {
          const monthQuota = quotas.find(q => q.month === month && q.law === quota.law);
          if (monthQuota) {
            selectedMonths.push(month);
            if (!monthTargets[month]) {
              monthTargets[month] = {};
            }
            monthTargets[month][quota.law] = monthQuota.target;
          }
        });
        
        setFormData(prev => ({
          ...prev,
          selectedMonths: selectedMonths,
          monthTargets: monthTargets
        }));
      }
      
      setInitialLoadComplete(true); // Mark as complete on success
    } catch (err) {
      console.error('Error fetching quotas:', err);
      setExistingQuotas([]); // Set empty array on error to prevent undefined issues
      setInitialLoadComplete(true); // Mark complete even on error
    } finally {
      setLoadingQuotas(false);
    }
  };

  const fetchAllQuartersQuotas = async () => {
    setLoadingAllQuarters(true);
    try {
      // Only fetch if year is current year or next year
      if (formData.year < currentYear || formData.year > currentYear + 1) {
        setAllQuartersQuotas([]);
        return;
      }
      
      // Fetch monthly quotas for all months in the year to check availability
      // We need monthly data (not aggregated) to check individual month availability
      const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const promises = allMonths.map(month => 
        getQuotas({ year: formData.year, month, viewMode: 'monthly' })
      );
      const results = await Promise.all(promises);
      // Flatten all results into a single array
      const allQuotas = results.flat();
      setAllQuartersQuotas(allQuotas);
    } catch (err) {
      console.error('Error fetching all quarters quotas:', err);
      setAllQuartersQuotas([]); // Set empty array on error
    } finally {
      setLoadingAllQuarters(false);
    }
  };

  // Check if month has any quota records (for any law)
  const hasMonthRecords = (month) => {
    if (!initialLoadComplete) return false; // Don't check until data is loaded
    return existingQuotas.some(q => {
      // Month should be a number (1-12), ensure we compare correctly
      const qMonth = q.month != null ? Number(q.month) : null;
      if (qMonth === null || qMonth === undefined) {
        // If month is missing, try to derive from quarter (fallback for old data)
        // But this is not accurate - we should always have month now
        return false; // Don't match if month is missing
      }
      return qMonth === Number(month);
    });
  };

  // Check if month is already set for all laws
  const isMonthFullySet = (month) => {
    if (!initialLoadComplete) return false; // Don't check until data is loaded
    const monthQuotas = existingQuotas.filter(q => {
      const qMonth = q.month != null ? Number(q.month) : null;
      if (qMonth === null || qMonth === undefined) {
        return false; // Don't count if month is missing
      }
      return qMonth === Number(month);
    });
    return monthQuotas.length >= 5; // All 5 laws have quotas
  };

  // Check if month is set for a specific law
  const isMonthSetForLaw = (month, law) => {
    if (!initialLoadComplete) return false; // Don't check until data is loaded
    return existingQuotas.some(q => {
      const qMonth = q.month != null ? Number(q.month) : null;
      if (qMonth === null || qMonth === undefined) {
        return false; // Don't match if month is missing
      }
      return qMonth === Number(month) && q.law === law;
    });
  };

  // Check if a quarter is in the past
  const isPastQuarter = (year, quarter) => {
    if (year < currentYear) return true;
    if (year > currentYear) return false;
    
    // Get the last month of the quarter
    const quarterMonths = getMonthsInQuarter(quarter);
    const lastMonth = quarterMonths[quarterMonths.length - 1];
    
    // Quarter is past if its last month is before current month
    return lastMonth < currentMonthNum;
  };

  // Check if a law already has a record for the selected period (year + quarter)
  const hasLawRecordForPeriod = (lawId) => {
    if (!initialLoadComplete || !formData.quarter) return false; // Don't check until data is loaded or quarter is selected
    // Check if this law has a record for ANY of the selected months in the quarter
    // If no months are selected yet, check all months in the quarter
    const monthsToCheck = formData.selectedMonths.length > 0 
      ? formData.selectedMonths 
      : getMonthsInQuarter(formData.quarter);
    
    return existingQuotas.some(q => {
      const qMonth = q.month != null ? Number(q.month) : null;
      if (qMonth === null || qMonth === undefined) {
        return false; // Don't match if month is missing
      }
      return q.law === lawId && 
             q.year === formData.year && 
             monthsToCheck.includes(qMonth);
    });
  };

  // Note: hasAllLawsRecordForMonth removed - we now check per month individually using isMonthFullySet

  // Check if a specific quarter is all set or past
  const isQuarterAllSetOrPast = (year, quarter) => {
    // Get all months in the quarter
    const quarterMonths = getMonthsInQuarter(quarter);
    
    // Check if all months are past
    const allMonthsPast = quarterMonths.every(month => 
      isPastMonth(year, month)
    );
    
    if (allMonthsPast) return true;
    
    // Since quotas are now stored monthly, check each month individually
    // A quarter is "all set" only if ALL months in the quarter have all 5 laws set
    const allMonthsFullySet = quarterMonths.every(month => {
      // Get quotas for this specific month (not just the quarter)
      const monthQuotas = allQuartersQuotas.filter(q => 
        q.year === year && q.month === month
      );
      
      // Check if we have quotas for all 5 laws for this specific month
      const lawsWithQuotas = [...new Set(monthQuotas.map(q => q.law))];
      return lawsWithQuotas.length >= 5;
    });
    
    return allMonthsFullySet;
  };

  // Check if all quarters in a year are set or past
  const areAllQuartersSetOrPast = (year) => {
    // If we don't have data yet, return false (conservative approach)
    if (allQuartersQuotas.length === 0 && !loadingAllQuarters) {
      return false;
    }
    
    const allQuarters = [1, 2, 3, 4];
    return allQuarters.every(quarter => 
      isQuarterAllSetOrPast(year, quarter)
    );
  };

  // Memoized checks for performance
  const currentYearAllSet = useMemo(() => {
    // If we don't have data yet, return false (conservative approach)
    if (allQuartersQuotas.length === 0 && !loadingAllQuarters) {
      return false;
    }
    
    const allQuarters = [1, 2, 3, 4];
    return allQuarters.every(quarter => {
      // Get all months in the quarter
      const quarterMonths = getMonthsInQuarter(quarter);
      
      // Check if all months are past
      const allMonthsPast = quarterMonths.every(month => 
        isPastMonth(currentYear, month)
      );
      
      if (allMonthsPast) return true;
      
      // Since quotas are now stored monthly, check each month individually
      // A quarter is "all set" only if ALL months in the quarter have all 5 laws set
      const allMonthsFullySet = quarterMonths.every(month => {
        // Get quotas for this specific month
        const monthQuotas = allQuartersQuotas.filter(q => 
          q.year === currentYear && q.month === month
        );
        
        // Check if we have quotas for all 5 laws for this specific month
        const lawsWithQuotas = [...new Set(monthQuotas.map(q => q.law))];
        return lawsWithQuotas.length >= 5;
      });
      
      return allMonthsFullySet;
    });
  }, [allQuartersQuotas, loadingAllQuarters, currentYear]);

  const selectedQuarterAllSet = useMemo(() => {
    // If no quarter is selected, return false
    if (!formData.quarter) return false;
    
    // Get all months in the quarter
    const quarterMonths = getMonthsInQuarter(formData.quarter);
    
    // Check if all months are past
    const allMonthsPast = quarterMonths.every(month => 
      isPastMonth(formData.year, month)
    );
    
    if (allMonthsPast) return true;
    
    // Since quotas are now stored monthly, check each month individually
    // A quarter is "all set" only if ALL months in the quarter have all 5 laws set
    const allMonthsFullySet = quarterMonths.every(month => {
      // Get quotas for this specific month
      const monthQuotas = allQuartersQuotas.filter(q => 
        q.year === formData.year && q.month === month
      );
      
      // Check if we have quotas for all 5 laws for this specific month
      const lawsWithQuotas = [...new Set(monthQuotas.map(q => q.law))];
      return lawsWithQuotas.length >= 5;
    });
    
    return allMonthsFullySet;
  }, [allQuartersQuotas, formData.year, formData.quarter]);

  const handleLawToggle = (lawId) => {
    setFormData(prev => {
      const newSelectedLaws = prev.selectedLaws.includes(lawId)
        ? prev.selectedLaws.filter(l => l !== lawId)
        : [...prev.selectedLaws, lawId];
      
      // Initialize targets for newly selected laws in all selected months
      const newMonthTargets = { ...prev.monthTargets };
      prev.selectedMonths.forEach(month => {
        if (!newMonthTargets[month]) newMonthTargets[month] = {};
        if (newSelectedLaws.includes(lawId)) {
          // Only set if existing quota found, otherwise leave empty
          if (!newMonthTargets[month][lawId]) {
            // Check if there's an existing quota for this month-law
            const existing = existingQuotas.find(q => {
              const qMonth = q.month || ((q.quarter - 1) * 3 + 1);
              return qMonth === month && q.law === lawId;
            });
            // Only set if existing quota found, otherwise leave empty
            if (existing) {
              newMonthTargets[month][lawId] = existing.target;
            }
          }
        } else {
          // Remove targets for deselected law
          delete newMonthTargets[month][lawId];
        }
      });
      
      return {
        ...prev,
        selectedLaws: newSelectedLaws,
        monthTargets: newMonthTargets
      };
    });
  };

  const handleMonthToggle = (month) => {
    setFormData(prev => {
      const newSelectedMonths = prev.selectedMonths.includes(month)
        ? prev.selectedMonths.filter(m => m !== month)
        : [...prev.selectedMonths, month];
      
      // Initialize targets for newly selected months
      const newMonthTargets = { ...prev.monthTargets };
      if (newSelectedMonths.includes(month)) {
        prev.selectedLaws.forEach(law => {
          if (!newMonthTargets[month]) newMonthTargets[month] = {};
          if (!newMonthTargets[month][law]) {
            // Check if there's an existing quota for this month-law
            const existing = existingQuotas.find(q => {
              const qMonth = q.month || ((q.quarter - 1) * 3 + 1);
              return qMonth === month && q.law === law;
            });
            // Only set if existing quota found, otherwise leave empty
            if (existing) {
              newMonthTargets[month][law] = existing.target;
            }
          }
        });
      } else {
        // Remove targets for deselected month
        delete newMonthTargets[month];
      }
      
      return {
        ...prev,
        selectedMonths: newSelectedMonths,
        monthTargets: newMonthTargets
      };
    });
  };

  const handleTargetChange = (month, law, value) => {
    setFormData(prev => ({
      ...prev,
      monthTargets: {
        ...prev.monthTargets,
        [month]: {
          ...prev.monthTargets[month],
          [law]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleQuarterChange = (quarter) => {
    if (!quarter || quarter === '' || quarter === 'null') {
      // Allow clearing quarter selection
      setFormData(prev => ({ ...prev, quarter: null, selectedMonths: [], monthTargets: {} }));
      setErrors({ quarter: '' });
      return;
    }
    
    const quarterNum = parseInt(quarter);
    const isPast = isPastQuarter(formData.year, quarterNum);
    const isAllSet = isQuarterAllSetOrPast(formData.year, quarterNum);
    
    // Don't allow selecting past or all-set quarters
    if (isPast || isAllSet) {
      setErrors({ quarter: 'Cannot select past or fully set quarters' });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      quarter: quarterNum,
      selectedMonths: [],
      monthTargets: {}
    }));
    
    // Clear errors
    setErrors(prev => ({ ...prev, quarter: null }));
    
    // Refetch quotas for new quarter
    setTimeout(() => {
      fetchExistingQuotas();
    }, 100);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.quarter || formData.quarter === null) {
      newErrors.quarter = 'Please select a quarter';
    }
    
    if (formData.selectedLaws.length === 0) {
      newErrors.laws = 'Please select at least one law';
    }
    
    if (formData.selectedMonths.length === 0) {
      newErrors.months = 'Please select at least one month';
    }
    
    // Validate targets for each selected month-law combination
    formData.selectedMonths.forEach(month => {
      formData.selectedLaws.forEach(law => {
        const target = formData.monthTargets[month]?.[law];
        if (!target || target <= 0) {
          newErrors[`target_${month}_${law}`] = `Target for ${MONTHS.find(m => m.value === month)?.label} - ${LAWS.find(l => l.id === law)?.name} must be greater than 0`;
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      // Build array of quotas to save - ONE PER MONTH (not grouped by quarter)
      const quotasToSave = [];
      
      formData.selectedMonths.forEach(month => {
        formData.selectedLaws.forEach(law => {
          const target = formData.monthTargets[month]?.[law];
          if (target > 0) {
            const quarter = getQuarterFromMonth(month);
            
            // If editing a single quota, include the ID
            const quotaId = quota && quota.law === law && quota.month === month
                           ? quota.id : null;
            
            quotasToSave.push({
              ...(quotaId && { id: quotaId }), // Include ID if editing
              law: law,
              year: formData.year,
              month: month,  // Save individual month
              quarter: quarter,  // Store quarter for reference
              target: target
            });
          }
        });
      });
      
      if (quotasToSave.length === 0) {
        throw new Error('No valid quotas to save. Please select at least one month and law with a target.');
      }
      
      // Pass array to onSave for bulk creation
      await onSave(quotasToSave);
      setShowConfirmDialog(false);
      onClose();
    } catch (err) {
      console.error('Error saving quotas:', err);
      let errorMessage = 'Failed to save quotas';
      
      // Extract error message from various possible formats
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setErrors({ submit: errorMessage });
      // Close dialog on error so user can see the error message in the main modal
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const quarterMonths = formData.quarter ? getMonthsInQuarter(formData.quarter) : [];

  // Skeleton component for months
  const MonthSkeleton = () => (
    <div className="flex flex-col items-center gap-1 p-2 border rounded-lg bg-gray-50 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded border-gray-300"></div>
      <div className="h-4 w-16 bg-gray-200 rounded"></div>
    </div>
  );

  // Skeleton component for laws
  const LawSkeleton = () => (
    <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded border-gray-300"></div>
      <div className="h-4 w-48 bg-gray-200 rounded"></div>
    </div>
  );

  // Get recommendations based on existing data
  const getRecommendations = () => {
    if (!initialLoadComplete || loadingQuotas || existingQuotas.length === 0 || !formData.quarter) return [];
    
    const recommendations = [];
    const quarterMonths = getMonthsInQuarter(formData.quarter);
    
    // Check each month for partial records
    quarterMonths.forEach(monthNum => {
      const monthQuotas = existingQuotas.filter(q => {
        const qMonth = q.month != null ? Number(q.month) : null;
        return qMonth === monthNum;
      });
      const monthName = MONTHS.find(m => m.value === monthNum)?.label;
      
      if (monthQuotas.length > 0 && monthQuotas.length < 5) {
        const missingLaws = LAWS.filter(law => 
          !monthQuotas.some(q => q.law === law.id)
        ).map(law => law.name);
        
        recommendations.push({
          type: 'partial_month',
          month: monthName,
          monthNum: monthNum,
          count: monthQuotas.length,
          remaining: 5 - monthQuotas.length,
          missingLaws: missingLaws
        });
      }
    });
    
    // Check overall quarter completion
    const totalMonths = quarterMonths.length;
    const monthsWithRecords = quarterMonths.filter(m => 
      existingQuotas.some(q => {
        const qMonth = q.month != null ? Number(q.month) : null;
        return qMonth === m;
      })
    ).length;
    
    if (monthsWithRecords > 0 && monthsWithRecords < totalMonths) {
      const missingMonths = quarterMonths.filter(m => 
        !existingQuotas.some(q => {
          const qMonth = q.month != null ? Number(q.month) : null;
          return qMonth === m;
        })
      ).map(m => MONTHS.find(month => month.value === m)?.label).filter(Boolean);
      
      recommendations.push({
        type: 'incomplete_quarter',
        completed: monthsWithRecords,
        total: totalMonths,
        missingMonths: missingMonths,
        completionPercent: Math.round((monthsWithRecords / totalMonths) * 100)
      });
    }
    
    // Check for laws that have records across all months
    const lawsWithRecords = LAWS.filter(law => 
      existingQuotas.some(q => q.law === law.id)
    );
    
    if (lawsWithRecords.length > 0 && lawsWithRecords.length < 5) {
      recommendations.push({
        type: 'partial_laws',
        count: lawsWithRecords.length,
        remaining: 5 - lawsWithRecords.length
      });
    }
    
    return recommendations;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-50">
      <div className="bg-white w-screen h-screen flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Modal Header with Actions */}
        <div className="flex items-center justify-between p-2 px-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Target size={20} className="text-sky-600" />
            {quota ? 'Update Quota Target' : 'Set Inspection Quota'}
          </h3>
          <div className="flex items-center gap-3">
          <button 
              type="button"
            onClick={onClose} 
              className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-2 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Target size={16} />
                  Set Targets
                </>
              )}
          </button>
          </div>
        </div>

        {/* Content Area - Two Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - 30% */}
          <div className="w-[30%] border-r border-gray-200 overflow-y-auto p-6 space-y-6">
            {/* Period Selection */}
            <div >
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-sky-600" />
                <h4 className="font-semibold text-gray-800">Period Selection</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.year}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      setFormData(prev => {
                        let quarter = prev.quarter;
                        
                        // Reset quarter if it's past in new year
                        if (isPastQuarter(newYear, quarter)) {
                          quarter = currentQuarter;
                        }
                        
                        // Reset quarter to null when year changes - user must select quarter manually
                        return { ...prev, year: newYear, quarter: null, selectedMonths: [], monthTargets: {} };
                      });
                      // Don't fetch quotas if quarter is not selected
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 border-gray-300"
                disabled={isSubmitting || !!quota}
              >
                    {!currentYearAllSet && (
                      <option value={currentYear}>{currentYear}</option>
                    )}
                    <option value={currentYear + 1}>{currentYear + 1}</option>
              </select>
                  {loadingAllQuarters && (
                    <p className="text-xs text-blue-500 mt-1">Checking quarters...</p>
                  )}
                  {currentYearAllSet && formData.year === currentYear && !loadingAllQuarters && (
                    <p className="text-xs text-gray-500 mt-1">All quarters are set or past - showing next year only</p>
              )}
            </div>
                
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quarter <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.quarter || ''}
                    onChange={(e) => handleQuarterChange(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 border-gray-300 ${
                      selectedQuarterAllSet ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting || !!quota || selectedQuarterAllSet}
                  >
                    <option value="">Select Quarter</option>
                    {QUARTERS.map(q => {
                      const isPast = isPastQuarter(formData.year, q.value);
                      const isAllSet = isQuarterAllSetOrPast(formData.year, q.value);
                      const isDisabled = isPast || isAllSet;
                      return (
                        <option 
                          key={q.value} 
                          value={q.value}
                          disabled={isDisabled}
                        >
                          {q.label} {isPast ? '(Past)' : isAllSet ? '(All Set)' : ''}
                        </option>
                      );
                    })}
              </select>
                  {errors.quarter && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.quarter}
                    </p>
                  )}
                  {selectedQuarterAllSet && !errors.quarter && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      <strong>Why disabled?</strong> All months in this quarter have all inspection programs set, or all months are in the past.
                    </div>
                  )}
            </div>
          </div>

              {/* Month Selection - Multiple Checkboxes (3 columns) */}
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month(s) <span className="text-red-500">*</span>
            </label>
                {!formData.quarter ? (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    Please select a quarter to view months
                  </div>
                ) : loadingQuotas && !initialLoadComplete ? (
                  <div className="grid grid-cols-3 gap-2">
                    {quarterMonths.map(monthNum => (
                      <MonthSkeleton key={monthNum} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {quarterMonths.map(monthNum => {
                      const month = MONTHS.find(m => m.value === monthNum);
                      if (!month) return null; // Safety check
                      
                      const isPast = isPastMonth(formData.year, monthNum);
                      const hasRecords = hasMonthRecords(monthNum);
                      const isFullySet = isMonthFullySet(monthNum);
                      
                      // Debug log for November (month 11)
                      if (monthNum === 11) {
                        console.log('November check:', {
                          monthNum,
                          hasRecords,
                          isFullySet,
                          existingQuotas: existingQuotas.filter(q => {
                            const qMonth = q.month != null ? Number(q.month) : null;
                            return qMonth === 11;
                          }),
                          allQuotas: existingQuotas
                        });
                      }
                      
                      // Only hide months that are fully set (all 5 laws) or past
                      // DO NOT hide months with partial records - show them so users can add more
                      const isHidden = isFullySet || isPast;
                      
                      // Disable if: past month, fully set, or quarter is past
                      // Also disable while loading to prevent interaction before data is ready
                      const isDisabled = isPast || isFullySet || isPastQuarter(formData.year, formData.quarter);
                      const isSelected = formData.selectedMonths.includes(monthNum);
                      
                      // Hide months that are fully set or past (unless editing)
                      // Also hide if quarter is past
                      if ((isHidden && !quota) || isPastQuarter(formData.year, formData.quarter)) {
                        return null;
                      }
                      
                      return (
                        <label 
                          key={monthNum}
                          className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition-colors ${
                            isDisabled || (loadingQuotas && !initialLoadComplete)
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                              : isSelected
                              ? 'bg-sky-50 border-sky-300 cursor-pointer'
                              : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMonthToggle(monthNum)}
                            disabled={isSubmitting || isDisabled || !!quota || (loadingQuotas && !initialLoadComplete)}
                            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-xs font-medium text-gray-700 text-center">
                            {month.label}
                            {hasRecords && !isFullySet && (
                              <span className="block text-xs text-gray-500 mt-1">(Has Record)</span>
                            )}
                            {isFullySet && (
                              <span className="block text-xs text-gray-500 mt-1">(All Set)</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.months && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                    {errors.months}
              </p>
            )}
              </div>
          </div>

            {/* Law Selection - Multiple Checkboxes */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Program(s) <span className="text-red-500">*</span>
            </label>
              {loadingQuotas && !initialLoadComplete ? (
                <div className="grid grid-cols-1 gap-3">
                  {LAWS.map(law => (
                    <LawSkeleton key={law.id} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {LAWS.map(law => {
                  const hasRecord = hasLawRecordForPeriod(law.id);
                  const isDisabled = hasRecord && !quota;
                  const isSelected = formData.selectedLaws.includes(law.id);
                  
                  return (
                    <label 
                      key={law.id} 
                      className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                        isDisabled
                          ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                          : formData.selectedLaws.includes(law.id) 
                          ? 'bg-sky-50 border-sky-300 cursor-pointer'
                          : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                <input
                  type="checkbox"
                        checked={isSelected}
                        onChange={() => handleLawToggle(law.id)}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        disabled={isSubmitting || !!quota || isDisabled}
                      />
                      <span className="text-sm text-gray-700">
                        {law.name}
                        {hasRecord && (
                          <span className="ml-2 text-xs text-gray-500">(Has Record)</span>
                        )}
                      </span>
                </label>
                  );
                })}
              </div>
              )}
              {errors.laws && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                  {errors.laws}
              </p>
            )}
            </div>
          </div>

          {/* Right Column - 70% */}
          <div className="w-[70%] overflow-y-auto p-4">
            {/* Recommendations Section */}
            {initialLoadComplete && !loadingQuotas && getRecommendations().length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      {getRecommendations().map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>
                            {rec.type === 'partial_month' && (
                              <>
                                <strong>{rec.month}</strong> has {rec.count} record(s). 
                                Consider setting quotas for the remaining <strong>{rec.remaining}</strong> inspection program(s): {rec.missingLaws.join(', ')}.
                              </>
                            )}
                            {rec.type === 'incomplete_quarter' && (
                              <>
                                Quarter {formData.quarter} is <strong>{rec.completionPercent}%</strong> complete ({rec.completed}/{rec.total} months). 
                                Set quotas for: <strong>{rec.missingMonths.join(', ')}</strong> to finish the quarter.
                              </>
                            )}
                            {rec.type === 'partial_laws' && (
                              <>
                                Some inspection programs already have records. Only <strong>{rec.remaining}</strong> program(s) remaining to be set for this period.
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Target Inputs for Each Month-Law Combination */}
            {formData.selectedMonths.length > 0 && formData.selectedLaws.length > 0 ? (
              <div className="space-y-6">
                {/* Header */}

                {/* Month Sections */}
                {formData.selectedMonths.map((month) => {
                  const monthName = MONTHS.find(m => m.value === month)?.label;
                  return (
                    <div key={month} className="bg-white border border-gray-200 rounded overflow-hidden">
                      {/* Month Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h5 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                          <Calendar size={16} className="text-sky-600" />
                          {monthName}
                        </h5>
                      </div>
                      
                      {/* Law Inputs Grid */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {formData.selectedLaws.map(lawId => {
                            const law = LAWS.find(l => l.id === lawId);
                            const targetKey = `target_${month}_${lawId}`;
                            const isSet = isMonthSetForLaw(month, lawId);
                            
                            return (
                              <div key={lawId} className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {law?.id}
                                  <span className="text-gray-500 font-normal block text-xs mt-0.5">
                                    {law?.name.includes('(') ? law.name.split('(')[1]?.replace(')', '') : law?.name}
                                  </span>
                                  {isSet && (
                                    <span className="inline-block mt-1 text-xs text-sky-600 font-medium">(Update)</span>
                                  )}
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={formData.monthTargets[month]?.[lawId] || ''}
                                  onChange={(e) => handleTargetChange(month, lawId, e.target.value)}
                                  className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                                    errors[targetKey] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 bg-white hover:border-gray-400'
                                  }`}
                                  placeholder="0"
                                  disabled={isSubmitting}
                                />
                                {errors[targetKey] && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    {errors[targetKey]}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select months and inspection programs</p>
                  <p className="text-sm mt-2">to configure target settings</p>
              </div>
            </div>
          )}

          {errors.submit && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-semibold text-sm mb-1">Error Saving Quotas</p>
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        title={quota ? "Confirm Quota Update" : "Confirm Quota Creation"}
        message={
          <div>
            <p className="mb-4 text-gray-700">
              {quota 
                ? "You are about to update the quota target." 
                : `You are about to create ${formData.selectedMonths.length * formData.selectedLaws.length} quota(s) for the selected period.`
              }
            </p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {formData.selectedMonths.map(month => {
                  const monthName = MONTHS.find(m => m.value === month)?.label;
                  return (
                    <div key={month} className="bg-white rounded-lg p-3 border border-gray-100">
                      <h6 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
                        <Calendar size={14} className="text-sky-600" />
                        {monthName}
                      </h6>
                      <div className="grid grid-cols-1 gap-2">
                        {formData.selectedLaws.map(lawId => {
                          const law = LAWS.find(l => l.id === lawId);
                          const target = formData.monthTargets[month]?.[lawId];
                          const isSet = isMonthSetForLaw(month, lawId);
                          return (
                            <div key={lawId} className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                              <span className="text-gray-700">
                                <span className="font-medium">{law?.id}</span>
                                <span className="text-gray-500 ml-1">
                                  {law?.name.includes('(') ? `(${law.name.split('(')[1]?.replace(')', '')})` : `(${law?.name})`}
                                </span>
                                {isSet && <span className="ml-2 text-xs text-sky-600 font-medium">(Update)</span>}
                              </span>
                              <span className="font-semibold text-sky-600">{target || 0}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Quotas are stored by quarter. If multiple months from the same quarter are selected, they will share the same target value.
              </p>
            </div>
          </div>
        }
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSave}
        confirmText={quota ? "Update" : "Set Targets"}
        cancelText="Cancel"
        confirmColor="sky"
        loading={isSubmitting}
        icon={<Target size={20} className="text-sky-600" />}
        headerColor="sky"
        size="lg"
      />
    </div>
  );
};

export default QuotaModal;
