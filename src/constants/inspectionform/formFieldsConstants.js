// constants/formFieldsConstants.js
export const GENERAL_INFO_FIELDS = {
  ESTABLISHMENT_NAME: "establishment_name",
  ADDRESS: "address",
  COORDINATES: "coordinates",
  NATURE_OF_BUSINESS: "nature_of_business",
  YEAR_ESTABLISHED: "year_established",
  INSPECTION_DATE_TIME: "inspection_date_time",
  ENVIRONMENTAL_LAWS: "environmental_laws",
  OPERATING_HOURS: "operating_hours",
  OPERATING_DAYS_PER_WEEK: "operating_days_per_week",
  OPERATING_DAYS_PER_YEAR: "operating_days_per_year",
  PRODUCT_LINES: "product_lines",
  DECLARED_PRODUCTION_RATE: "declared_production_rate",
  ACTUAL_PRODUCTION_RATE: "actual_production_rate",
  MANAGING_HEAD: "managing_head",
  PCO_NAME: "pco_name",
  INTERVIEWED_PERSON: "interviewed_person",
  PCO_ACCREDITATION_NO: "pco_accreditation_no",
  EFFECTIVITY_DATE: "effectivity_date",
  PHONE_FAX_NO: "phone_fax_no",
  EMAIL_ADDRESS: "email_address",
};

export const PURPOSE_OPTIONS = {
  VERIFY_ACCURACY: "verify_accuracy",
  DETERMINE_COMPLIANCE: "determine_compliance",
  INVESTIGATE_COMPLAINTS: "investigate_complaints",
  CHECK_COMMITMENT_STATUS: "check_commitment_status",
  OTHER_PURPOSE: "other_purpose",
};

export const ACCURACY_DETAILS = {
  POA: "Permit to Operate Air (POA)",
  DP: "Discharge Permit (DP)",
  PMPIN: "PMPIN Application",
  HW_ID: "Hazardous Waste ID Registration",
  HW_TRANSPORTER: "Hazardous Waste Transporter Registration",
  OTHER: "Others",
};

export const COMMITMENT_STATUS = {
  ECOWATCH: "Industrial Ecowatch",
  PEPP: "Philippine Environmental Partnership Program (PEPP)",
  PAB: "Pollution Adjudication Board (PAB)",
  OTHER: "Others",
};

export default {
  GENERAL_INFO_FIELDS,
  PURPOSE_OPTIONS,
  ACCURACY_DETAILS,
  COMMITMENT_STATUS,
};
