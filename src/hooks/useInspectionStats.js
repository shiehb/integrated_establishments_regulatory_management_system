import { useState, useEffect, useCallback } from 'react';
import { getInspections } from '../services/api';

export default function useInspectionStats(userLevel, dateFrom, dateTo) {
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userLevel) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: 1,
        page_size: 1000, // Get all inspections for stats calculation
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      };

      const data = await getInspections(params);
      
      // Filter for completed inspections
      const completedInspections = data.results?.filter(inspection => {
        const status = inspection.current_status;
        return status?.includes('COMPLETED') || 
               status?.includes('CLOSED') ||
               status === 'SECTION_COMPLETED_COMPLIANT' ||
               status === 'SECTION_COMPLETED_NON_COMPLIANT' ||
               status === 'UNIT_COMPLETED_COMPLIANT' ||
               status === 'UNIT_COMPLETED_NON_COMPLIANT' ||
               status === 'MONITORING_COMPLETED_COMPLIANT' ||
               status === 'MONITORING_COMPLETED_NON_COMPLIANT' ||
               status === 'CLOSED_COMPLIANT' ||
               status === 'CLOSED_NON_COMPLIANT';
      }) || [];

      // Calculate statistics
      const total = completedInspections.length;
      const compliant = completedInspections.filter(inspection => 
        inspection.form?.compliance_decision === 'COMPLIANT'
      ).length;
      const nonCompliant = completedInspections.filter(inspection => 
        inspection.form?.compliance_decision === 'NON_COMPLIANT'
      ).length;
      const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

      setStats({
        total,
        compliant,
        nonCompliant,
        complianceRate
      });
    } catch (err) {
      console.error('Error fetching inspection stats:', err);
      setError(err.message);
      setStats({
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        complianceRate: 0
      });
    } finally {
      setLoading(false);
    }
  }, [userLevel, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}

// Hook for Legal Unit statistics
export function useLegalStats() {
  const [stats, setStats] = useState({
    legalReview: 0,
    novSent: 0,
    nooSent: 0,
    totalCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLegalStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: 1,
        page_size: 1000
      };

      const data = await getInspections(params);
      const allInspections = data.results || [];
      
      // Filter for legal statuses
      const legalInspections = allInspections.filter(inspection => 
        ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT', 'CLOSED_NON_COMPLIANT'].includes(inspection.current_status)
      );
      
      // Calculate statistics
      setStats({
        legalReview: legalInspections.filter(i => i.current_status === 'LEGAL_REVIEW').length,
        novSent: legalInspections.filter(i => i.current_status === 'NOV_SENT').length,
        nooSent: legalInspections.filter(i => i.current_status === 'NOO_SENT').length,
        totalCases: legalInspections.length
      });
    } catch (err) {
      console.error('Error fetching legal stats:', err);
      setError(err.message);
      setStats({
        legalReview: 0,
        novSent: 0,
        nooSent: 0,
        totalCases: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLegalStats();
  }, [fetchLegalStats]);

  const refetch = useCallback(() => {
    fetchLegalStats();
  }, [fetchLegalStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}
