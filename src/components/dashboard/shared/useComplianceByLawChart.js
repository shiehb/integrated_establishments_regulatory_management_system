import { useState, useEffect, useMemo } from 'react';
import { getComplianceByLaw } from '../../../services/api';

/**
 * useComplianceByLawChart Hook
 * 
 * A custom hook that fetches compliance data by law and transforms it for Chart.js vertical bar chart.
 * Provides loading states, error handling, and data refresh functionality.
 * 
 * @param {string|null} userRole - User role for filtering data (optional)
 * @returns {Object} Compliance by law data and utilities
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Array} returns.data - Raw compliance data by law
 * @returns {Object} returns.chartData - Transformed data for Chart.js
 * @returns {Function} returns.refetch - Function to refresh data
 */
export const useComplianceByLawChart = (userRole = null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Role-based filtering parameters
      const params = userRole ? { role: userRole } : {};
      
      const response = await getComplianceByLaw(params);
      setData(response || []);
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
  }, [userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Transform data for Chart.js vertical bar chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by total count (descending) to show laws with most inspections first
    const sortedData = [...data].sort((a, b) => b.total - a.total);

    return {
      labels: sortedData.map(item => item.law_name),
      datasets: [
        {
          label: 'Pending',
          data: sortedData.map(item => item.pending),
          backgroundColor: '#F59E0B', // Yellow/amber
          borderColor: '#D97706', // Darker yellow border
          borderWidth: 1,
        },
        {
          label: 'Compliant',
          data: sortedData.map(item => item.compliant),
          backgroundColor: '#10B981', // Green
          borderColor: '#059669', // Darker green border
          borderWidth: 1,
        },
        {
          label: 'Non-Compliant',
          data: sortedData.map(item => item.non_compliant),
          backgroundColor: '#EF4444', // Red
          borderColor: '#DC2626', // Darker red border
          borderWidth: 1,
        }
      ]
    };
  }, [data]);

  return {
    isLoading,
    data,
    chartData,
    error,
    refetch: fetchData
  };
};
