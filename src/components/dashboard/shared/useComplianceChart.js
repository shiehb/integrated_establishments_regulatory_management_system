import { useMemo } from 'react';

/**
 * useComplianceChart Hook
 * 
 * A custom hook that generates Chart.js data for the compliance pie chart.
 * Memoizes the chart data to prevent unnecessary re-renders.
 * 
 * @param {Object} complianceStats - Compliance statistics object
 * @param {number} complianceStats.pending - Number of pending inspections
 * @param {number} complianceStats.compliant - Number of compliant inspections
 * @param {number} complianceStats.nonCompliant - Number of non-compliant inspections
 * @returns {Object} Chart.js data object for pie chart
 */
export const useComplianceChart = (complianceStats) => {
  return useMemo(() => {
    return {
      labels: ['Pending', 'Compliant', 'Non-Compliant'],
      datasets: [
        {
          data: [complianceStats.pending, complianceStats.compliant, complianceStats.nonCompliant],
          backgroundColor: [
            '#F59E0B', // Yellow for pending
            '#10B981', // Green for compliant
            '#EF4444', // Red for non-compliant
          ],
          borderColor: [
            '#D97706', // Darker yellow border
            '#059669', // Darker green border
            '#DC2626', // Darker red border
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [complianceStats.pending, complianceStats.compliant, complianceStats.nonCompliant]);
};
