/**
 * Form validation utilities for inspection form
 * Validates that frontend data matches backend requirements
 */

/**
 * Validates general information section
 * @param {Object} general - General information data
 * @returns {Object} - Validation result
 */
export const validateGeneralInformation = (general) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!general.establishment_name || general.establishment_name.trim() === '') {
    errors.push('Establishment name is required');
  }

  if (!general.address || general.address.trim() === '') {
    errors.push('Address is required');
  }

  if (!general.coordinates || general.coordinates.trim() === '') {
    errors.push('Coordinates are required');
  }

  if (!general.nature_of_business || general.nature_of_business.trim() === '') {
    errors.push('Nature of business is required');
  }

  if (!general.year_established || general.year_established === '') {
    errors.push('Year established is required');
  }

  if (!general.inspection_date_time || general.inspection_date_time.trim() === '') {
    errors.push('Inspection date and time is required');
  }

  if (!general.environmental_laws || general.environmental_laws.length === 0) {
    errors.push('At least one environmental law must be selected');
  }

  if (!general.operating_hours || general.operating_hours === '') {
    errors.push('Operating hours is required');
  }

  if (!general.operating_days_per_week || general.operating_days_per_week === '') {
    errors.push('Operating days per week is required');
  }

  if (!general.operating_days_per_year || general.operating_days_per_year === '') {
    errors.push('Operating days per year is required');
  }

  if (!general.phone_fax_no || general.phone_fax_no.trim() === '') {
    errors.push('Phone/Fax number is required');
  }

  if (!general.email_address || general.email_address.trim() === '') {
    errors.push('Email address is required');
  }

  // Validate year established
  if (general.year_established) {
    const year = parseInt(general.year_established);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(year) || year < 1800 || year > currentYear) {
      errors.push('Year established must be a valid year');
    }
  }

  // Validate inspection date
  if (general.inspection_date_time) {
    const inspectionDate = new Date(general.inspection_date_time);
    const now = new Date();
    
    if (isNaN(inspectionDate.getTime())) {
      errors.push('Invalid inspection date format');
    } else if (inspectionDate > now) {
      errors.push('Inspection date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'General information is valid'
  };
};

/**
 * Validates purpose of inspection section
 * @param {Object} purpose - Purpose data
 * @returns {Object} - Validation result
 */
export const validatePurposeOfInspection = (purpose) => {
  const errors = [];
  const warnings = [];

  // Check if at least one main purpose is selected
  const mainPurposes = [
    'verify_accuracy',
    'determine_compliance', 
    'investigate_complaints',
    'check_commitment_status',
    'other_purpose'
  ];

  const selectedMainPurposes = mainPurposes.filter(p => purpose[p]);
  
  if (selectedMainPurposes.length === 0) {
    errors.push('At least one purpose of inspection must be selected');
  }

  // Validate verify_accuracy details
  if (purpose.verify_accuracy) {
    const accuracyDetails = purpose.verify_accuracy_details || [];
    if (accuracyDetails.length === 0) {
      errors.push('When "Verify accuracy of information" is selected, at least one accuracy detail must be chosen');
    }
    
    // If "Others" is selected, check if it has content
    if (accuracyDetails.includes('Others')) {
      if (!purpose.verify_accuracy_others || purpose.verify_accuracy_others.trim() === '') {
        errors.push('When "Others" is selected for accuracy details, please specify the details');
      }
    }
  }

  // Validate check_commitment_status details
  if (purpose.check_commitment_status) {
    const commitmentDetails = purpose.commitment_status_details || [];
    if (commitmentDetails.length === 0) {
      errors.push('When "Check status of commitment(s)" is selected, at least one commitment detail must be chosen');
    }
    
    // If "Others" is selected, check if it has content
    if (commitmentDetails.includes('Others')) {
      if (!purpose.commitment_status_others || purpose.commitment_status_others.trim() === '') {
        errors.push('When "Others" is selected for commitment details, please specify the details');
      }
    }
  }

  // Validate other_purpose
  if (purpose.other_purpose) {
    if (!purpose.other_purpose_specify || purpose.other_purpose_specify.trim() === '') {
      errors.push('When "Others" is selected for purpose, please specify the purpose');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'Purpose of inspection is valid'
  };
};

/**
 * Validates permits data
 * @param {Array} permits - Permits array
 * @returns {Object} - Validation result
 */
export const validatePermits = (permits) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(permits)) {
    errors.push('Permits must be an array');
    return { isValid: false, errors, warnings, message: errors.join(', ') };
  }

  permits.forEach((permit, index) => {
    if (permit.permitNumber && permit.permitNumber.trim() !== '') {
      if (!permit.dateIssued || permit.dateIssued.trim() === '') {
        errors.push(`Permit ${index + 1}: Date issued is required when permit number is provided`);
      }
      
      if (!permit.expiryDate || permit.expiryDate.trim() === '') {
        errors.push(`Permit ${index + 1}: Expiry date is required when permit number is provided`);
      }

      // Validate date relationship
      if (permit.dateIssued && permit.expiryDate) {
        const issuedDate = new Date(permit.dateIssued);
        const expiryDate = new Date(permit.expiryDate);
        
        if (!isNaN(issuedDate.getTime()) && !isNaN(expiryDate.getTime())) {
          if (expiryDate <= issuedDate) {
            errors.push(`Permit ${index + 1}: Expiry date must be after the date issued`);
          }
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'Permits data is valid'
  };
};

/**
 * Validates compliance items
 * @param {Array} complianceItems - Compliance items array
 * @returns {Object} - Validation result
 */
export const validateComplianceItems = (complianceItems) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(complianceItems)) {
    errors.push('Compliance items must be an array');
    return { isValid: false, errors, warnings, message: errors.join(', ') };
  }

  complianceItems.forEach((item, index) => {
    // For PD-1586 items, validate condition number and compliance requirement
    if (item.lawId === 'PD-1586') {
      if (!item.conditionNumber || item.conditionNumber.trim() === '') {
        errors.push(`Compliance item ${index + 1}: Condition number is required for PD-1586 items`);
      }
      
      if (!item.complianceRequirement || item.complianceRequirement.trim() === '') {
        errors.push(`Compliance item ${index + 1}: Compliance requirement is required for PD-1586 items`);
      }
    }

    // Validate compliance status
    if (item.compliant && item.compliant !== 'Yes' && item.compliant !== 'No') {
      errors.push(`Compliance item ${index + 1}: Invalid compliance status`);
    }

    // Validate remarks for non-compliant items
    if (item.compliant === 'No') {
      if (!item.remarksOption || item.remarksOption.trim() === '') {
        errors.push(`Compliance item ${index + 1}: Remarks are required for non-compliant items`);
      }
      
      if (item.remarksOption === 'Other' && (!item.remarks || item.remarks.trim() === '')) {
        errors.push(`Compliance item ${index + 1}: Custom remarks are required when "Other" is selected`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'Compliance items are valid'
  };
};

/**
 * Validates systems data
 * @param {Array} systems - Systems array
 * @returns {Object} - Validation result
 */
export const validateSystems = (systems) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(systems)) {
    errors.push('Systems must be an array');
    return { isValid: false, errors, warnings, message: errors.join(', ') };
  }

  systems.forEach((system, index) => {
    if (system.nonCompliant && (!system.sysRemarks || system.sysRemarks.trim() === '')) {
      errors.push(`System ${index + 1}: Remarks are required for non-compliant systems`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'Systems data is valid'
  };
};

/**
 * Validates recommendations
 * @param {Object} recommendationState - Recommendation state
 * @returns {Object} - Validation result
 */
export const validateRecommendations = (recommendationState) => {
  const errors = [];
  const warnings = [];

  if (!recommendationState) {
    errors.push('Recommendation state is required');
    return { isValid: false, errors, warnings, message: errors.join(', ') };
  }

  if (recommendationState.checked && recommendationState.checked.includes('Other Recommendations')) {
    if (!recommendationState.otherText || recommendationState.otherText.trim() === '') {
      errors.push('Custom recommendation text is required when "Other Recommendations" is selected');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(', ') : 'Recommendations are valid'
  };
};

/**
 * Main validation function for the entire form
 * @param {Object} formData - Complete form data
 * @returns {Object} - Overall validation result
 */
export const validateInspectionForm = (formData) => {
  const allErrors = [];
  const allWarnings = [];

  // Validate each section
  const generalValidation = validateGeneralInformation(formData.general);
  const purposeValidation = validatePurposeOfInspection(formData.purpose);
  const permitsValidation = validatePermits(formData.permits);
  const complianceValidation = validateComplianceItems(formData.complianceItems);
  const systemsValidation = validateSystems(formData.systems);
  const recommendationsValidation = validateRecommendations(formData.recommendationState);

  // Collect all errors and warnings
  allErrors.push(...generalValidation.errors);
  allErrors.push(...purposeValidation.errors);
  allErrors.push(...permitsValidation.errors);
  allErrors.push(...complianceValidation.errors);
  allErrors.push(...systemsValidation.errors);
  allErrors.push(...recommendationsValidation.errors);

  allWarnings.push(...generalValidation.warnings);
  allWarnings.push(...purposeValidation.warnings);
  allWarnings.push(...permitsValidation.warnings);
  allWarnings.push(...complianceValidation.warnings);
  allWarnings.push(...systemsValidation.warnings);
  allWarnings.push(...recommendationsValidation.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    message: allErrors.length > 0 ? `Form has ${allErrors.length} validation errors` : 'Form is valid',
    sectionValidations: {
      general: generalValidation,
      purpose: purposeValidation,
      permits: permitsValidation,
      compliance: complianceValidation,
      systems: systemsValidation,
      recommendations: recommendationsValidation,
    }
  };
};
