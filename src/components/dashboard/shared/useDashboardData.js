import { useState, useEffect } from 'react';
import { getUsers, getEstablishments, getInspections, getComplianceStats, getQuarterlyComparison } from '../../../services/api';

/**
 * useDashboardData Hook
 * 
 * A custom hook that fetches and manages dashboard data with optional role-based filtering.
 * Provides loading states, error handling, and data refresh functionality.
 * 
 * @param {string|null} userRole - User role for filtering data (optional)
 * @returns {Object} Dashboard data and utilities
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.stats - Basic statistics (users, establishments, inspections)
 * @returns {Object} returns.complianceStats - Compliance statistics
 * @returns {Object} returns.quarterlyData - Quarterly comparison data
 * @returns {Function} returns.refetch - Function to refresh all data
 */
export const useDashboardData = (userRole = null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEstablishments: 0,
    totalInspections: 0
  });
  const [complianceStats, setComplianceStats] = useState({
    pending: 0,
    compliant: 0,
    nonCompliant: 0,
    total: 0
  });
  const [quarterlyData, setQuarterlyData] = useState({
    current_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
    last_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
    change_percentage: 0,
    trend: 'stable'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Role-based filtering parameters
      const params = userRole ? { role: userRole } : {};
      
      const [usersRes, establishmentsRes, inspectionsRes, complianceRes, quarterlyRes] = await Promise.all([
        getUsers(params),
        getEstablishments(params),
        getInspections({...params, page_size: 1000}), // Get large page size for total count
        getComplianceStats(params),
        getQuarterlyComparison(params)
      ]);
      
      // Debug logging
      console.log('Dashboard API responses:', {
        usersRes,
        establishmentsRes,
        inspectionsRes,
        complianceRes,
        quarterlyRes
      });
      
      setStats({
        totalUsers: usersRes.count || 0,
        totalEstablishments: establishmentsRes.count || 0,
        totalInspections: inspectionsRes.count || 0
      });
      
      setComplianceStats({
        pending: complianceRes.pending || 0,
        compliant: complianceRes.compliant || 0,
        nonCompliant: complianceRes.non_compliant || 0,
        total: complianceRes.total_completed || 0
      });
      
      setQuarterlyData(quarterlyRes);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Set default values on error
      setStats({ totalUsers: 0, totalEstablishments: 0, totalInspections: 0 });
      setComplianceStats({ pending: 0, compliant: 0, nonCompliant: 0, total: 0 });
      setQuarterlyData({
        current_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
        last_quarter: { quarter: '', year: 0, compliant: 0, non_compliant: 0, total_finished: 0 },
        change_percentage: 0,
        trend: 'stable'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    stats,
    complianceStats,
    quarterlyData,
    refetch: fetchData
  };
};
