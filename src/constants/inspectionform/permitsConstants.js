// constants/permitsConstants.js
export const PERMIT_TYPES = {
  ECC: {
    id: "ECC",
    name: "Environmental Compliance Certificate",
    laws: ["PD-1586"],
  },
  POA: {
    id: "POA",
    name: "Permit to Operate Air Pollution Source",
    laws: ["RA-8749"],
  },
  DISCHARGE_PERMIT: {
    id: "DISCHARGE_PERMIT",
    name: "Wastewater Discharge Permit",
    laws: ["RA-9275"],
  },
  HAZARDOUS_WASTE_ID: {
    id: "HAZARDOUS_WASTE_ID",
    name: "Hazardous Waste Generator ID",
    laws: ["RA-6969"],
  },
  PCL_CERTIFICATE: {
    id: "PCL_CERTIFICATE",
    name: "PCL Compliance Certificate",
    laws: ["RA-6969"],
  },
};

// Mapping of business types to relevant permit types
export const BUSINESS_PERMIT_MAPPING = {
  "RESTAURANT/FOOD SERVICE": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "RETAIL/WHOLESALE": ["ECC1", "ECC2", "ECC3", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "MANUFACTURING": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "DENR Registry ID", "PCL Compliance Certificate", "CCO Registry", "Permit to Transport", "Copy of COT issued by licensed TSD Facility"],
  "CONSTRUCTION": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "TRANSPORTATION": ["POA No.", "Permit to Transport", "DENR Registry ID"],
  "HEALTHCARE/MEDICAL": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "DENR Registry ID", "Permit to Transport", "Copy of COT issued by licensed TSD Facility"],
  "EDUCATION/TRAINING": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "HOSPITALITY/TOURISM": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "AGRICULTURE/FARMING": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "PCL Compliance Certificate"],
  "FISHING/AQUACULTURE": ["ECC1", "ECC2", "ECC3", "Discharge Permit No."],
  "MINING": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "DENR Registry ID", "PCL Compliance Certificate", "CCO Registry", "Importer Clearance No.", "Permit to Transport", "Copy of COT issued by licensed TSD Facility"],
  "ENERGY/POWER": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "DENR Registry ID", "PCL Compliance Certificate"],
  "TELECOMMUNICATIONS": ["ECC1", "ECC2", "ECC3"],
  "BANKING/FINANCE": ["ECC1", "ECC2", "ECC3", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "INSURANCE": ["ECC1", "ECC2", "ECC3", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "REAL ESTATE": ["ECC1", "ECC2", "ECC3", "Discharge Permit No."],
  "CONSULTING SERVICES": ["ECC1", "ECC2", "ECC3"],
  "LEGAL SERVICES": ["ECC1", "ECC2", "ECC3"],
  "ACCOUNTING SERVICES": ["ECC1", "ECC2", "ECC3"],
  "MARKETING/ADVERTISING": ["ECC1", "ECC2", "ECC3"],
  "INFORMATION TECHNOLOGY": ["ECC1", "ECC2", "ECC3", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "RESEARCH & DEVELOPMENT": ["ECC1", "ECC2", "ECC3", "DENR Registry ID", "PCL Compliance Certificate", "Discharge Permit No."],
  "WASTE MANAGEMENT": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "DENR Registry ID", "PCL Compliance Certificate", "CCO Registry", "Importer Clearance No.", "Permit to Transport", "Copy of COT issued by licensed TSD Facility", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "WATER SUPPLY": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "PCL Compliance Certificate"],
  "GOVERNMENT SERVICES": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "NON-PROFIT/CHARITY": ["ECC1", "ECC2", "ECC3", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "ENTERTAINMENT/RECREATION": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "With MOA/Agreement for residuals disposed of to a SLF w/ ECC"],
  "SPORTS/FITNESS": ["ECC1", "ECC2", "ECC3", "Discharge Permit No."],
  "BEAUTY/COSMETICS": ["ECC1", "ECC2", "ECC3", "Discharge Permit No.", "PCL Compliance Certificate"],
  "AUTOMOTIVE SERVICES": ["ECC1", "ECC2", "ECC3", "POA No.", "Discharge Permit No.", "DENR Registry ID", "Permit to Transport"],
  "REPAIR SERVICES": ["ECC1", "ECC2", "ECC3", "Discharge Permit No."],
  "CLEANING SERVICES": ["ECC1", "ECC2", "ECC3", "PCL Compliance Certificate"],
  "SECURITY SERVICES": ["ECC1", "ECC2", "ECC3"],
  "OTHERS": null, // null means show all permits
};

export const initialPermits = [
  {
    lawId: "PD-1586",
    permitType: "ECC1",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Environmental Compliance Certificate Type 1",
    required: true,
  },
  {
    lawId: "PD-1586",
    permitType: "ECC2",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Environmental Compliance Certificate Type 2",
    required: false,
  },
  {
    lawId: "PD-1586",
    permitType: "ECC3",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Environmental Compliance Certificate Type 3",
    required: false,
  },
  {
    lawId: "RA-6969",
    permitType: "DENR Registry ID",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Chemical Control Order Registry Identification",
    required: true,
  },
  {
    lawId: "RA-6969",
    permitType: "PCL Compliance Certificate",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Priority Chemicals List Compliance Certificate",
    required: true,
  },
  {
    lawId: "RA-6969",
    permitType: "CCO Registry",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Chemical Control Order Registry",
    required: false,
  },
  {
    lawId: "RA-6969",
    permitType: "Importer Clearance No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Importer Clearance Number for Hazardous Substances",
    required: false,
  },
  {
    lawId: "RA-6969",
    permitType: "Permit to Transport",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Hazardous Waste Transport Permit",
    required: true,
  },
  {
    lawId: "RA-6969",
    permitType: "Copy of COT issued by licensed TSD Facility",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description:
      "Certificate of Treatment from Treatment, Storage, and Disposal Facility",
    required: false,
  },
  {
    lawId: "RA-8749",
    permitType: "POA No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Permit to Operate Air Pollution Source",
    required: true,
  },
  {
    lawId: "RA-9275",
    permitType: "Discharge Permit No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Wastewater Discharge Permit",
    required: true,
  },
  {
    lawId: "RA-9003",
    permitType: "With MOA/Agreement for residuals disposed of to a SLF w/ ECC",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
    description: "Memorandum of Agreement for Residual Waste Disposal",
    required: false,
  },
];

export const getPermitsByLaw = (lawId) => {
  return initialPermits.filter((permit) => permit.lawId === lawId);
};

// Filter permits by nature of business
export const filterPermitsByBusiness = (permits, natureOfBusiness) => {
  // If no nature of business specified or OTHERS, return all permits
  if (!natureOfBusiness || natureOfBusiness === "OTHERS") {
    return permits;
  }
  
  // Get allowed permit types for this business
  const allowedPermitTypes = BUSINESS_PERMIT_MAPPING[natureOfBusiness];
  
  // If no mapping found, return all permits (fail-safe)
  if (!allowedPermitTypes) {
    return permits;
  }
  
  // Filter permits to only include allowed types
  return permits.filter(permit => allowedPermitTypes.includes(permit.permitType));
};

export default initialPermits;
