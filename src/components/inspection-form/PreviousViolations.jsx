import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { getPreviousViolations } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PreviousViolations({ inspectionId, inspectionData, onClose }) {
  const navigate = useNavigate();
  const [previousViolations, setPreviousViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViolations = async () => {
      if (!inspectionId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getPreviousViolations(inspectionId);
        const violations = data.previous_violations || [];
        setPreviousViolations(violations);
        
        // Log for debugging
        console.log('Previous violations fetched:', {
          hasViolations: violations.length > 0,
          count: violations.length,
          data: data
        });
      } catch (err) {
        console.error('Failed to fetch previous violations:', err);
        // Don't show error if it's just that there are no previous violations
        if (err.response?.status !== 404) {
          setError('Failed to load previous violations');
        }
      } finally {
        setLoading(false);
      }
    };

    // Always try to fetch previous violations if we have an inspection ID
    // The API will determine if there are previous violations
    if (inspectionId) {
      fetchViolations();
    }
  }, [inspectionId]);

  // Format violations similar to InspectionReportViewPage
  const formatViolations = (violationsText) => {
    if (!violationsText) return 'No violations recorded';

    // Check if it's already formatted (has numbered list)
    if (violationsText.includes('1.') && violationsText.includes('•')) {
      return violationsText;
    }

    // Try to parse comma-separated or bullet-separated violations
    const lines = violationsText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return violationsText;

    // Check if first line looks like a law header
    const formatted = [];
    let lawCounter = 1;
    let currentLaw = null;
    let currentViolations = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if line is a law header (not starting with bullet)
      if (!trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        // If we have previous law, save it
        if (currentLaw) {
          formatted.push(`${lawCounter}. ${currentLaw}:`);
          currentViolations.forEach((violation, idx) => {
            formatted.push(`   ${lawCounter}.${idx + 1} ${violation}`);
          });
          formatted.push('');
          lawCounter += 1;
        }
        currentLaw = trimmed.replace(/[:]+$/, '').trim();
        currentViolations = [];
      } else {
        // It's a violation item
        const violation = trimmed.replace(/^[•\-]\s*/, '');
        if (violation) {
          currentViolations.push(violation);
        }
      }
    });

    // Add last law
    if (currentLaw) {
      formatted.push(`${lawCounter}. ${currentLaw}:`);
      currentViolations.forEach((violation, idx) => {
        formatted.push(`   ${lawCounter}.${idx + 1} ${violation}`);
      });
    }

    return formatted.length > 0 ? formatted.join('\n') : violationsText;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleViewReport = (previousInspectionCode) => {
    if (previousInspectionCode) {
      // Find inspection ID from code - we'll need to navigate to report view
      // For now, navigate to inspections list with search
      navigate(`/inspections?search=${previousInspectionCode}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading previous violations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (previousViolations.length === 0) {
    return (
      <div className="bg-white h-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Previous Violations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No previous violations found</p>
          <p className="text-xs text-gray-400 mt-1">This appears to be a first inspection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Previous Violations to Monitor</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {previousViolations.map((violationData, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Establishment and Inspection Info */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {violationData.establishment_name}
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Previous Inspection:</span>
                  <span className="font-mono">{violationData.previous_inspection_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Date:</span>
                  <span>{formatDate(violationData.previous_inspection_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    violationData.compliance_status === 'CLOSED_COMPLIANT'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {violationData.compliance_status === 'CLOSED_COMPLIANT' ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                {violationData.previous_inspection_code && (
                  <button
                    onClick={() => handleViewReport(violationData.previous_inspection_code)}
                    className="text-xs text-sky-600 hover:text-sky-700 underline mt-1"
                  >
                    View Previous Report →
                  </button>
                )}
              </div>
            </div>

            {/* Violations */}
            <div className="mt-3 pt-3 border-t border-gray-300">
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                Violations Found:
              </h4>
              <div className="bg-white border border-gray-200 rounded-md p-3">
                <pre className="text-xs text-gray-900 whitespace-pre-wrap font-sans leading-relaxed">
                  {formatViolations(violationData.violations)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> These violations are for reference only. Verify that previous issues have been resolved during this inspection.
        </p>
      </div>
    </div>
  );
}

