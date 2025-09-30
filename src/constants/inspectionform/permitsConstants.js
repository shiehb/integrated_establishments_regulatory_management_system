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

export default initialPermits;
