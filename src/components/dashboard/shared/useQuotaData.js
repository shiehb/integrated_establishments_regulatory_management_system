import { useState, useEffect } from 'react';
import { getQuotas, setQuota, autoAdjustQuotas } from '../../../services/api';

/**
 * Custom hook for managing quota data
 * Handles fetching, updating, and auto-adjusting quotas
 * @param {string} userRole - User role for filtering
 * @param {object} params - Parameters object with year, month, quarter, viewMode
 */
export const useQuotaData = (userRole = null, params = {}) => {
  const [quotas, setQuotasState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = { ...params };
      if (userRole) queryParams.role = userRole;
      
      const data = await getQuotas(queryParams);
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
      const response = await setQuota(quotaData);
      
      // Handle bulk response (array of results)
      if (Array.isArray(quotaData) && response && response.results) {
        // Bulk update - update state with all results
        setQuotasState(prevQuotas => {
          const updatedQuotas = [...prevQuotas];
          
          // Update or add each quota from results
          response.results.forEach(updatedQuota => {
            // For aggregated quarterly quotas, month is null, so use law+year+quarter for matching
            const existingIndex = updatedQuotas.findIndex(q => {
              if (q.id === updatedQuota.id) return true;
              if (q.law === updatedQuota.law && q.year === updatedQuota.year) {
                // If both have months, match by month
                if (q.month !== null && updatedQuota.month !== null && q.month === updatedQuota.month) {
                  return true;
                }
                // If both are aggregated (month is null), match by quarter
                if (q.month === null && updatedQuota.month === null && q.quarter === updatedQuota.quarter) {
                  return true;
                }
              }
              return false;
            });
            
            if (existingIndex >= 0) {
              updatedQuotas[existingIndex] = updatedQuota;
            } else {
              updatedQuotas.push(updatedQuota);
            }
          });
          
          return updatedQuotas;
        });
        
        return response;
      } else {
        // Single quota update
        const updatedQuota = response.results?.[0] || response;
        
        setQuotasState(prevQuotas => {
          // For aggregated quarterly quotas, month is null, so use law+year+quarter for matching
          const existingIndex = prevQuotas.findIndex(q => {
            if (q.id === updatedQuota.id) return true;
            if (q.law === updatedQuota.law && q.year === updatedQuota.year) {
              // If both have months, match by month
              if (q.month !== null && updatedQuota.month !== null && q.month === updatedQuota.month) {
                return true;
              }
              // If both are aggregated (month is null), match by quarter
              if (q.month === null && updatedQuota.month === null && q.quarter === updatedQuota.quarter) {
                return true;
              }
            }
            return false;
          });
          
          if (existingIndex >= 0) {
            const newQuotas = [...prevQuotas];
            newQuotas[existingIndex] = updatedQuota;
            return newQuotas;
          } else {
            return [...prevQuotas, updatedQuota];
          }
        });
        
        return updatedQuota;
      }
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
  }, [JSON.stringify(params), userRole]);

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
