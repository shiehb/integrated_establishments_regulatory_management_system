import { useState, useEffect } from 'react';
import { getQuotas, setQuota, autoAdjustQuotas } from '../../../services/api';

/**
 * Custom hook for managing quota data
 * Handles fetching, updating, and auto-adjusting quotas
 */
export const useQuotaData = (userRole = null, year = null, quarter = null) => {
  const [quotas, setQuotasState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (year) params.year = year;
      if (quarter) params.quarter = quarter;
      if (userRole) params.role = userRole;
      
      const data = await getQuotas(params);
      setQuotasState(data);
    } catch (err) {
      console.error('Error fetching quotas:', err);
      setError(err.message || 'Failed to fetch quotas');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuota = async (quotaData) => {
    try {
      const updatedQuota = await setQuota(quotaData);
      
      // Update the quotas state with the new/updated quota
      setQuotasState(prevQuotas => {
        const existingIndex = prevQuotas.findIndex(q => 
          q.law === updatedQuota.law && 
          q.year === updatedQuota.year && 
          q.quarter === updatedQuota.quarter
        );
        
        if (existingIndex >= 0) {
          // Update existing quota
          const newQuotas = [...prevQuotas];
          newQuotas[existingIndex] = updatedQuota;
          return newQuotas;
        } else {
          // Add new quota
          return [...prevQuotas, updatedQuota];
        }
      });
      
      return updatedQuota;
    } catch (err) {
      console.error('Error updating quota:', err);
      setError(err.message || 'Failed to update quota');
      throw err;
    }
  };

  const triggerAutoAdjust = async (year = null, quarter = null) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (quarter) params.quarter = quarter;
      
      const result = await autoAdjustQuotas(params);
      
      // Refresh quotas to show updated data
      await fetchQuotas();
      
      return result;
    } catch (err) {
      console.error('Error auto-adjusting quotas:', err);
      setError(err.message || 'Failed to auto-adjust quotas');
      throw err;
    }
  };

  useEffect(() => {
    fetchQuotas();
  }, [year, quarter, userRole]);

  return {
    quotas,
    isLoading,
    error,
    refetch: fetchQuotas,
    updateQuota,
    triggerAutoAdjust
  };
};

export default useQuotaData;
