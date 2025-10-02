// constants/recommendationsConstants.js
export const RECOMMENDATIONS = [
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

export const RECOMMENDATION_CATEGORIES = {
  MONITORING: "Monitoring",
  PERMITTING: "Permitting",
  TRAINING: "Training",
  REPORTING: "Reporting",
  ENFORCEMENT: "Enforcement",
  GENERAL: "General",
};

export const getRecommendationsByCategory = (category) => {
  return RECOMMENDATIONS.filter((rec) => rec.category === category);
};

export default RECOMMENDATIONS;
