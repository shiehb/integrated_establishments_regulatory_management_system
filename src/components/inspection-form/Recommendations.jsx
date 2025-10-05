import React from "react";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Recommendations
   ---------------------------*/
export default function Recommendations({ recState, setRecState, errors }) {
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
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Recommendations" />
      <div className="space-y-3">
        {recommendations.map((r) => (
          <label key={r.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(recState.checked || []).includes(r.label)}
              onChange={() => toggle(r.label)}
              className="w-4 h-4"
            />
            <span className="text-sm text-black">{r.label}</span>
          </label>
        ))}

        {(recState.checked || []).includes("Other Recommendations") && (
          <div className="mt-2">
            <textarea
              value={recState.otherText || ""}
              onChange={(e) => updateField("otherText", e.target.value)}
              placeholder="ENTER OTHER RECOMMENDATION..."
              className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
            />
            {errors.recommendations && (
              <p className="text-sm text-red-600">{errors.recommendations}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
