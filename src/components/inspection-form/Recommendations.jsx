import React, { forwardRef } from "react";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Recommendations
   ---------------------------*/
const Recommendations = forwardRef(function Recommendations({ recState, setRecState, errors, isReadOnly = false, canEditRecommendation = false }, ref) {
  // Import recommendations from constants
  const recommendations = [
    {
      id: "confirmatory_sampling",
      label: "For confirmatory sampling/further monitoring",
      category: "Monitoring",
    },
    {
      id: "permit_issuance",
      label:
        "For issuance of Temporary/Renewal of permit to operate (POA) and/or Renewal of Discharge Permit (DP)",
      category: "Permitting",
    },
    {
      id: "pco_accreditation",
      label:
        "For accreditation of Pollution Control Office(PCO)/Seminar requirement of Managing Head",
      category: "Training",
    },
    {
      id: "report_submission",
      label:
        "For Submission of Self-Monitoring Report (SMR)/Compliance monitoring Report(CMR)",
      category: "Reporting",
    },
    {
      id: "violation_notice",
      label: "For issuance of Notice of Violation(NOV)",
      category: "Enforcement",
    },
    {
      id: "suspension",
      label: "For issuance of suspension of ECC/5-day CDO",
      category: "Enforcement",
    },
    {
      id: "pab_endorsement",
      label: "For endorsement to Pollution Adjudication Board (PAB)",
      category: "Enforcement",
    },
    {
      id: "other",
      label: "Other Recommendations",
      category: "General",
    },
  ];

  const toggle = (label) => {
    const set = new Set(recState.checked || []);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    setRecState({ ...recState, checked: Array.from(set) });
  };

  const updateField = (field, value) => {
    setRecState({ ...recState, [field]: formatInput.upper(value) });
  };

  return (
    <section ref={ref} data-section="recommendations" className="p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-300 scroll-mt-[120px]" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <SectionHeader title="Recommendations" />
      {errors.recommendations && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {errors.recommendations}
          </p>
        </div>
      )}
      <div className="space-y-2.5">
        {recommendations.map((r) => (
          <label key={r.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(recState.checked || []).includes(r.label)}
              onChange={() => toggle(r.label)}
              disabled={isReadOnly && !canEditRecommendation}
              className={`w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 ${isReadOnly && !canEditRecommendation ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <span className={`text-sm ${isReadOnly && !canEditRecommendation ? 'text-gray-500' : 'text-gray-900'}`}>{r.label}</span>
          </label>
        ))}

        {(recState.checked || []).includes("Other Recommendations") && (
          <div className="mt-2">
            <textarea
              value={recState.otherText || ""}
              onChange={(e) => updateField("otherText", e.target.value)}
              placeholder="ENTER OTHER RECOMMENDATION..."
              disabled={isReadOnly && !canEditRecommendation}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 min-h-[60px] uppercase focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                isReadOnly && !canEditRecommendation 
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                  : 'bg-white text-gray-900'
              }`}
            />
            {errors.recommendations && (
              <p className="text-sm text-red-600">{errors.recommendations}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

export default Recommendations;
