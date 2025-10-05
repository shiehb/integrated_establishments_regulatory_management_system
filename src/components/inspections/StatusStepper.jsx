import React from 'react';

const StatusStepper = ({ currentStatus, isCompliant }) => {
  const compliantSteps = [
    { key: 'CREATED', label: 'Created' },
    { key: 'SECTION_ASSIGNED', label: 'Section Assigned' },
    { key: 'SECTION_IN_PROGRESS', label: 'Section In Progress' },
    { key: 'UNIT_ASSIGNED', label: 'Unit Assigned' },
    { key: 'UNIT_IN_PROGRESS', label: 'Unit In Progress' },
    { key: 'MONITORING_ASSIGNED', label: 'Monitoring Assigned' },
    { key: 'MONITORING_IN_PROGRESS', label: 'Monitoring In Progress' },
    { key: 'MONITORING_COMPLETED_COMPLIANT', label: 'Monitoring Complete' },
    { key: 'UNIT_REVIEWED', label: 'Unit Reviewed' },
    { key: 'SECTION_REVIEWED', label: 'Section Reviewed' },
    { key: 'DIVISION_REVIEWED', label: 'Division Reviewed' },
    { key: 'CLOSED_COMPLIANT', label: 'Closed ✅' },
  ];

  const nonCompliantSteps = [
    { key: 'CREATED', label: 'Created' },
    { key: 'SECTION_ASSIGNED', label: 'Section Assigned' },
    { key: 'SECTION_IN_PROGRESS', label: 'Section In Progress' },
    { key: 'UNIT_ASSIGNED', label: 'Unit Assigned' },
    { key: 'UNIT_IN_PROGRESS', label: 'Unit In Progress' },
    { key: 'MONITORING_ASSIGNED', label: 'Monitoring Assigned' },
    { key: 'MONITORING_IN_PROGRESS', label: 'Monitoring In Progress' },
    { key: 'MONITORING_COMPLETED_NON_COMPLIANT', label: 'Non-Compliant' },
    { key: 'UNIT_REVIEWED', label: 'Unit Reviewed' },
    { key: 'SECTION_REVIEWED', label: 'Section Reviewed' },
    { key: 'DIVISION_REVIEWED', label: 'Division Reviewed' },
    { key: 'LEGAL_REVIEW', label: 'Legal Review' },
    { key: 'NOV_SENT', label: 'NOV Sent' },
    { key: 'NOO_SENT', label: 'NOO Sent' },
    { key: 'CLOSED_NON_COMPLIANT', label: 'Closed ❌' },
  ];

  const steps = isCompliant ? compliantSteps : nonCompliantSteps;
  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentIndex
                    ? 'bg-green-600 text-white'
                    : index === currentIndex
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div
                className={`mt-2 text-xs text-center max-w-[100px] ${
                  index === currentIndex ? 'font-semibold text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatusStepper;

