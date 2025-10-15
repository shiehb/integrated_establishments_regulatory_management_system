/**
 * Permit Number Validation
 * Validates permit numbers according to DENR format standards
 */

// Permit number patterns by law and permit type
export const PERMIT_PATTERNS = {
  'PD-1586': {
    'ECC1': {
      pattern: /^ECC-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'ECC-R3-2023-045',
      description: 'Format: ECC-[Region]-[Year]-[Number]'
    },
    'ECC2': {
      pattern: /^ECC-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'ECC-R3-2023-045',
      description: 'Format: ECC-[Region]-[Year]-[Number]'
    },
    'ECC3': {
      pattern: /^ECC-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'ECC-R3-2023-045',
      description: 'Format: ECC-[Region]-[Year]-[Number]'
    }
  },
  'RA-6969': {
    'DENR Registry ID': {
      pattern: /^(R|REG)-\d{5,6}$/i,
      example: 'R-12345 or REG-12345',
      description: 'Format: R-[Number] or REG-[Number]'
    },
    'PCL Compliance Certificate': {
      pattern: /^PCL-\d{4}$/i,
      example: 'PCL-0456',
      description: 'Format: PCL-[Number]'
    },
    'Permit to Transport': {
      pattern: /^PTT-\d{2}-\d{4}$/i,
      example: 'PTT-24-0021',
      description: 'Format: PTT-[Year]-[Number]'
    },
    'CCO Registry': {
      pattern: /^CCO-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'CCO-R3-2023-123',
      description: 'Format: CCO-[Region]-[Year]-[Number]'
    },
    'Importer Clearance No.': {
      pattern: /^IC-\d{4}-\d{3,5}$/i,
      example: 'IC-2023-123',
      description: 'Format: IC-[Year]-[Number]'
    },
    'Copy of COT issued by licensed TSD Facility': {
      pattern: /^COT-\d{4}-\d{3,5}$/i,
      example: 'COT-2023-123',
      description: 'Format: COT-[Year]-[Number]'
    }
  },
  'RA-8749': {
    'POA No.': {
      pattern: /^P?POA-(R\d{1,2}|NCR|CAR|BARMM)-(\d{4}-)?\d{3,5}$/i,
      example: 'POA-R3-2023-1234 or PPOA-R3-1234',
      description: 'Format: POA-[Region]-[Year]-[Number] or POA-[Region]-[Number]'
    }
  },
  'RA-9275': {
    'Discharge Permit No.': {
      pattern: /^P?DP-(R\d{1,2}|NCR|CAR|BARMM)-(\d{4}-)?\d{3,5}$/i,
      example: 'DP-R3-2023-9876 or PDP-R3-9876',
      description: 'Format: DP-[Region]-[Year]-[Number] or DP-[Region]-[Number]'
    }
  },
  'RA-9003': {
    'With MOA/Agreement for residuals disposed of to a SLF w/ ECC': {
      pattern: /^MOA-(\d{3}|\d{3}-\d{4}|(R\d{1,2}|NCR|CAR)-\d{4}-\d{3})$/i,
      example: 'MOA-123, MOA-123-2023, or MOA-R3-2023-123',
      description: 'Format: MOA-[Number], MOA-[Number]-[Year], or MOA-[Region]-[Year]-[Number]'
    }
  },
  'RA-9729': {
    'Certificate of Compliance': {
      pattern: /^COC-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'COC-R3-2023-123',
      description: 'Format: COC-[Region]-[Year]-[Number]'
    }
  },
  'RA-10121': {
    'Emergency Preparedness Plan Approval': {
      pattern: /^EPP-(R\d{1,2}|NCR|CAR|BARMM)-\d{4}-\d{3,5}$/i,
      example: 'EPP-R3-2023-045',
      description: 'Format: EPP-[Region]-[Year]-[Number]'
    }
  }
};

/**
 * Validate a permit number based on law and permit type
 * @param {string} permitNumber - The permit number to validate
 * @param {string} lawId - The environmental law ID
 * @param {string} permitType - The type of permit
 * @returns {object} - { isValid: boolean, message: string, warning: boolean }
 */
export function validatePermitNumber(permitNumber, lawId, permitType) {
  // Empty permit numbers are handled by required field validation
  if (!permitNumber || permitNumber.trim() === '') {
    return { isValid: false, message: '', warning: false };
  }

  // Get the pattern for this law and permit type
  const lawPatterns = PERMIT_PATTERNS[lawId];
  if (!lawPatterns) {
    // No specific pattern for this law - allow any format
    return { 
      isValid: true, 
      message: 'No specific format validation available for this permit type', 
      warning: true 
    };
  }

  const permitConfig = lawPatterns[permitType];
  if (!permitConfig) {
    // No specific pattern for this permit type - allow any format
    return { 
      isValid: true, 
      message: 'No specific format validation available for this permit type', 
      warning: true 
    };
  }

  // Validate against pattern
  const isValid = permitConfig.pattern.test(permitNumber.trim());

  if (isValid) {
    return {
      isValid: true,
      message: '✓ Valid permit number format',
      warning: false
    };
  } else {
    return {
      isValid: false,
      message: `Invalid format. Expected: ${permitConfig.example}`,
      warning: false,
      description: permitConfig.description
    };
  }
}

/**
 * Get example permit number for a law and permit type
 * @param {string} lawId - The environmental law ID
 * @param {string} permitType - The type of permit
 * @returns {string} - Example permit number
 */
export function getPermitExample(lawId, permitType) {
  const lawPatterns = PERMIT_PATTERNS[lawId];
  if (!lawPatterns) return '';
  
  const permitConfig = lawPatterns[permitType];
  if (!permitConfig) return '';
  
  return permitConfig.example;
}

/**
 * Get permit format description
 * @param {string} lawId - The environmental law ID
 * @param {string} permitType - The type of permit
 * @returns {string} - Format description
 */
export function getPermitFormatDescription(lawId, permitType) {
  const lawPatterns = PERMIT_PATTERNS[lawId];
  if (!lawPatterns) return '';
  
  const permitConfig = lawPatterns[permitType];
  if (!permitConfig) return '';
  
  return permitConfig.description;
}

/**
 * Validate multiple permit numbers at once
 * @param {array} permits - Array of permit objects
 * @returns {object} - Validation results keyed by permit index
 */
export function validateAllPermits(permits) {
  const validations = {};
  
  permits.forEach((permit, index) => {
    if (permit.permitNumber && permit.permitNumber.trim() !== '') {
      validations[index] = validatePermitNumber(
        permit.permitNumber,
        permit.lawId,
        permit.permitType
      );
    }
  });
  
  return validations;
}

