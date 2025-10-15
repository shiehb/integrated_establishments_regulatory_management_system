import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * ValidationSummary Component
 * Displays validation errors grouped by section
 */
export default function ValidationSummary({ errors, onScrollToSection }) {
  // Group errors by section
  const groupedErrors = {
    general: [],
    purpose: [],
    permits: [],
    compliance: [],
    findings: [],
    recommendations: []
  };

  // Categorize errors
  Object.entries(errors).forEach(([key, message]) => {
    if (key === 'establishment_name' || key === 'address' || key === 'coordinates' || 
        key === 'nature_of_business' || key === 'year_established' || 
        key === 'inspection_date_time' || key === 'operating_hours' || 
        key === 'operating_days_per_week' || key === 'operating_days_per_year' || 
        key === 'phone_fax_no' || key === 'email_address' || key === 'environmental_laws') {
      groupedErrors.general.push({ field: key, message });
    } else if (key === 'purpose') {
      groupedErrors.purpose.push({ field: key, message });
    } else if (key === 'permits') {
      groupedErrors.permits.push({ field: key, message });
    } else if (key === 'compliance_items' || key.startsWith('compliant-') || key.startsWith('remarks-')) {
      groupedErrors.compliance.push({ field: key, message });
    } else if (key.startsWith('systemStatus-') || key.startsWith('sysRemarks-')) {
      groupedErrors.findings.push({ field: key, message });
    } else if (key === 'recommendations') {
      groupedErrors.recommendations.push({ field: key, message });
    }
  });

  const sections = [
    { id: 'general', name: 'General Information', errors: groupedErrors.general },
    { id: 'purpose', name: 'Purpose of Inspection', errors: groupedErrors.purpose },
    { id: 'compliance-status', name: 'Compliance Status (DENR Permits)', errors: groupedErrors.permits },
    { id: 'summary-compliance', name: 'Summary of Compliance', errors: groupedErrors.compliance },
    { id: 'findings', name: 'Summary of Findings', errors: groupedErrors.findings },
    { id: 'recommendations', name: 'Recommendations', errors: groupedErrors.recommendations }
  ];

  const totalErrors = Object.keys(errors).length;
  const sectionsWithErrors = sections.filter(s => s.errors.length > 0);

  if (totalErrors === 0) {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">All validations passed!</p>
            <p className="text-xs text-green-700 mt-0.5">Form is ready to submit.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-base font-bold text-red-800 mb-2">
            {totalErrors} Validation Error{totalErrors !== 1 ? 's' : ''} Found
          </h3>
          <p className="text-sm text-red-700 mb-3">
            Please fix the following errors before submitting:
          </p>
          
          <div className="space-y-3">
            {sectionsWithErrors.map((section) => (
              <div key={section.id} className="bg-white rounded-md p-3 border border-red-200">
                <button
                  onClick={() => onScrollToSection && onScrollToSection(section.id)}
                  className="text-left w-full group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-red-800 group-hover:text-red-900">
                      {section.name}
                    </h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                      {section.errors.length} error{section.errors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {section.errors.slice(0, 3).map((error, idx) => (
                      <li key={idx} className="text-xs text-red-700 flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error.message}</span>
                      </li>
                    ))}
                    {section.errors.length > 3 && (
                      <li className="text-xs text-red-600 italic">
                        + {section.errors.length - 3} more error{section.errors.length - 3 !== 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-sky-600 mt-2 group-hover:underline">
                    Click to jump to section →
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

