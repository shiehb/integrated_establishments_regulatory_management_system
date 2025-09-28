// constants/complianceConstants.js
export const COMPLIANCE_CATEGORIES = {
  DOCUMENTATION: "Documentation",
  CERTIFICATION: "Certification",
  REPORTING: "Reporting",
  PERMITTING: "Permitting",
  OPERATIONAL: "Operational",
  MONITORING: "Monitoring",
  TRAINING: "Training",
};

export const COMPLIANCE_STATUS = {
  COMPLIANT: "Yes",
  NON_COMPLIANT: "No",
  NOT_APPLICABLE: "N/A",
  PARTIAL: "Partial",
};

export const initialComplianceItems = [
  {
    lawId: "PD-1586",
    lawCitation:
      "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities",
    conditionId: "PD-1586-1",
    conditionNumber: "",
    complianceRequirement: "Provide EIS document",
    compliant: "N/A",
    remarks: "",
    category: "Documentation",
    priority: "High",
  },
  {
    lawId: "RA-6969",
    lawCitation:
      "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act",
    conditionId: "RA-6969-PCL-1",
    applicableLaw: "Priority Chemical List",
    complianceRequirement: "Valid PCL Compliance Certificate",
    compliant: "N/A",
    remarks: "",
    category: "Certification",
    priority: "High",
  },
  {
    lawId: "RA-6969",
    lawCitation:
      "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act",
    conditionId: "RA-6969-PCL-2",
    applicableLaw: "Priority Chemical List",
    complianceRequirement: "Annual Reporting",
    compliant: "N/A",
    remarks: "",
    category: "Reporting",
    priority: "Medium",
  },
  {
    lawId: "RA-8749",
    lawCitation: "RA 8749: Philippine Clean Air Act",
    conditionId: "RA-8749-1",
    applicableLaw: "Air Quality Standards",
    complianceRequirement: "Valid Permit to Operate (POA)",
    compliant: "N/A",
    remarks: "",
    category: "Permitting",
    priority: "High",
  },
  {
    lawId: "RA-9275",
    lawCitation: "RA 9275: Philippine Clean Water Act",
    conditionId: "RA-9275-1",
    applicableLaw: "Water Quality Standards",
    complianceRequirement: "Valid Discharge Permit",
    compliant: "N/A",
    remarks: "",
    category: "Permitting",
    priority: "High",
  },
  {
    lawId: "RA-9003",
    lawCitation: "RA 9003: Ecological Solid Waste Management Act",
    conditionId: "RA-9003-1",
    applicableLaw: "Solid Waste Management",
    complianceRequirement: "Segregation at Source",
    compliant: "N/A",
    remarks: "",
    category: "Operational",
    priority: "Medium",
  },
];

export const getComplianceItemsByLaw = (lawId) => {
  return initialComplianceItems.filter((item) => item.lawId === lawId);
};

export const addPD1586Condition = (existingItems = []) => {
  const nextId = `PD-1586-${
    existingItems.filter((i) => i.lawId === "PD-1586").length + 1
  }`;
  return {
    lawId: "PD-1586",
    lawCitation:
      "Presidential Decree No. 1586 (Environmental Impact Statement System)",
    conditionId: nextId,
    conditionNumber: "",
    complianceRequirement: "",
    compliant: "No",
    remarks: "",
    category: "Documentation",
    priority: "Medium",
  };
};

export default initialComplianceItems;
