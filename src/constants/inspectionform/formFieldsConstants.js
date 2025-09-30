// constants/formFieldsConstants.js
export const GENERAL_INFO_FIELDS = {
  ESTABLISHMENT_NAME: "establishmentName",
  ADDRESS: "address",
  COORDINATES: "coordinates",
  NATURE_OF_BUSINESS: "natureOfBusiness",
  YEAR_ESTABLISHED: "yearEstablished",
  INSPECTION_DATE_TIME: "inspectionDateTime",
  ENVIRONMENTAL_LAWS: "environmentalLaws",
  OPERATING_HOURS: "operatingHours",
  OPERATING_DAYS_PER_WEEK: "operatingDaysPerWeek",
  OPERATING_DAYS_PER_YEAR: "operatingDaysPerYear",
  PRODUCT_LINES: "productLines",
  DECLARED_PRODUCTION_RATE: "declaredProductionRate",
  ACTUAL_PRODUCTION_RATE: "actualProductionRate",
  MANAGING_HEAD: "managingHead",
  PCO_NAME: "pcoName",
  INTERVIEWED_PERSON: "interviewedPerson",
  PCO_ACCREDITATION_NO: "pcoAccreditationNo",
  EFFECTIVITY_DATE: "effectivityDate",
  PHONE_FAX_NO: "phoneFaxNo",
  EMAIL_ADDRESS: "emailAddress",
};

export const PURPOSE_OPTIONS = {
  VERIFY_ACCURACY: "verify_accuracy",
  COMPLIANCE_STATUS: "compliance_status",
  INVESTIGATE_COMPLAINTS: "investigate_complaints",
  CHECK_COMMITMENTS: "check_commitments",
  OTHER: "other",
};

export const ACCURACY_DETAILS = {
  POA: "poa",
  DP: "dp",
  PMPIN: "pmpin",
  HW_ID: "hw_id",
  HW_TRANSPORTER: "hw_transporter",
  OTHER: "accuracy_other",
};

export const COMMITMENT_STATUS = {
  ECOWATCH: "ecowatch",
  PEPP: "pepp",
  PAB: "pab",
  OTHER: "commitment_other",
};

export default {
  GENERAL_INFO_FIELDS,
  PURPOSE_OPTIONS,
  ACCURACY_DETAILS,
  COMMITMENT_STATUS,
};
