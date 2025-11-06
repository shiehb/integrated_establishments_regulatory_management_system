import { useState, useEffect, useMemo } from 'react';
import { getComplianceByLaw } from '../../../services/api';

/**
 * useComplianceByLawChart Hook
 * 
 * A custom hook that fetches compliance data by law and transforms it for Chart.js vertical bar chart.
 * Provides loading states, error handling, and data refresh functionality.
 * 
 * @param {string|null} userRole - User role for filtering data (optional)
 * @param {string} periodType - Period type for filtering: 'monthly', 'quarterly', 'yearly' (default: 'quarterly')
 * @returns {Object} Compliance by law data and utilities
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Array} returns.data - Raw compliance data by law
 * @returns {Object} returns.chartData - Transformed data for Chart.js
 * @returns {Function} returns.refetch - Function to refresh data
 */
export const useComplianceByLawChart = (userRole = null, periodType = 'quarterly') => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Role-based filtering parameters
      const params = userRole ? { role: userRole } : {};
      
      // Add period_type (always required now)
      params.period_type = periodType || 'quarterly';
      
      const response = await getComplianceByLaw(params);
      // Handle both new format (with data property) and old format (array) for backward compatibility
      const responseData = response?.data || response || [];
      setData(responseData);
    } catch (err) {
      console.error("Error fetching compliance by law data:", err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole, periodType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Transform data for Recharts stacked bar chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Sort data by total count (descending) to show laws with most inspections first
    const sortedData = [...data].sort((a, b) => b.total - a.total);

    // Transform to Recharts format: array of objects
    return sortedData.map(item => ({
      name: item.law_name,
      pending: item.pending,
      compliant: item.compliant,
      nonCompliant: item.non_compliant,
      total: item.total
    }));
  }, [data]);

  return {
    isLoading,
    data,
    chartData,
    error,
    refetch: fetchData
  };
};
