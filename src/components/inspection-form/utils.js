/* ======================
   Input formatting helpers
   ====================== */
export const formatInput = {
  upper: (val) =>
    val === undefined || val === null ? "" : String(val).toUpperCase(),
  lower: (val) =>
    val === undefined || val === null ? "" : String(val).toLowerCase(),
  title: (val) =>
    val === undefined || val === null
      ? ""
      : String(val)
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
  numeric: (val) =>
    val === undefined || val === null ? "" : String(val).replace(/\D/g, ""),
  coords: (val) => (val ? String(val).trim() : ""),
  phone: (val) => {
    if (val === undefined || val === null) return "";
    // Allow digits, spaces, hyphens, parentheses, plus sign, and forward slash
    return String(val).replace(/[^\d\s\-\(\)\+\/]/g, "");
  },
};

/* ======================
   Date helpers
   ====================== */
export const toDateOnly = (input) => {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  // normalize to date-only (local)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const _isPastDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d < today;
};

export const isFutureDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d > today;
};

export const isSameOrAfter = (a, b) => {
  const da = toDateOnly(a);
  const db = toDateOnly(b);
  if (!da || !db) return false;
  return da >= db;
};

/* ======================
   Phone/Fax validation helpers
   ====================== */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return { isValid: false, message: "Phone number is required" };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  
  // Check if it contains only digits
  if (digitsOnly.length === 0) {
    return { isValid: false, message: "Phone number must contain digits" };
  }

  // Philippine phone number patterns
  const patterns = [
    // Mobile: 09XX-XXX-XXXX or +639XX-XXX-XXXX
    /^(\+?63)?9\d{9}$/,
    // Landline: 0X-XXX-XXXX or +63X-XXX-XXXX
    /^(\+?63)?[2-8]\d{7}$/,
    // International format: +XX-XXX-XXX-XXXX
    /^\+\d{1,3}-\d{3,4}-\d{3,4}-\d{3,4}$/,
    // Simple format: XXX-XXX-XXXX
    /^\d{3,4}-\d{3,4}-\d{3,4}$/,
  ];

  // Check against patterns
  const isValidFormat = patterns.some(pattern => pattern.test(digitsOnly));
  
  if (!isValidFormat) {
    // Check length for basic validation
    if (digitsOnly.length < 7) {
      return { isValid: false, message: "Phone number too short (minimum 7 digits)" };
    }
    if (digitsOnly.length > 15) {
      return { isValid: false, message: "Phone number too long (maximum 15 digits)" };
    }
    
    // If it has reasonable length but doesn't match patterns, still consider valid
    // but with a warning
    return { isValid: true, message: "Phone number format accepted", warning: true };
  }

  return { isValid: true, message: "Valid phone number" };
};

export const validateFaxNumber = (faxNumber) => {
  if (!faxNumber || faxNumber.trim() === "") {
    return { isValid: false, message: "Fax number is required" };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = faxNumber.replace(/\D/g, "");
  
  // Check if it contains only digits
  if (digitsOnly.length === 0) {
    return { isValid: false, message: "Fax number must contain digits" };
  }

  // Fax number patterns (similar to phone but may have different requirements)
  const patterns = [
    // Philippine landline: 0X-XXX-XXXX or +63X-XXX-XXXX
    /^(\+?63)?[2-8]\d{7}$/,
    // International format: +XX-XXX-XXX-XXXX
    /^\+\d{1,3}-\d{3,4}-\d{3,4}-\d{3,4}$/,
    // Simple format: XXX-XXX-XXXX
    /^\d{3,4}-\d{3,4}-\d{3,4}$/,
  ];

  // Check against patterns
  const isValidFormat = patterns.some(pattern => pattern.test(digitsOnly));
  
  if (!isValidFormat) {
    // Check length for basic validation
    if (digitsOnly.length < 7) {
      return { isValid: false, message: "Fax number too short (minimum 7 digits)" };
    }
    if (digitsOnly.length > 15) {
      return { isValid: false, message: "Fax number too long (maximum 15 digits)" };
    }
    
    return { isValid: true, message: "Fax number format accepted", warning: true };
  }

  return { isValid: true, message: "Valid fax number" };
};

export const validatePhoneOrFax = (value) => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: "Phone/Fax number is required" };
  }

  // Check if it contains both phone and fax (separated by /)
  if (value.includes("/")) {
    const parts = value.split("/").map(part => part.trim());
    if (parts.length === 2) {
      const phoneValidation = validatePhoneNumber(parts[0]);
      const faxValidation = validateFaxNumber(parts[1]);
      
      if (phoneValidation.isValid && faxValidation.isValid) {
        return { isValid: true, message: "Valid phone and fax numbers" };
      } else {
        const errors = [];
        if (!phoneValidation.isValid) errors.push(`Phone: ${phoneValidation.message}`);
        if (!faxValidation.isValid) errors.push(`Fax: ${faxValidation.message}`);
        return { isValid: false, message: errors.join(", ") };
      }
    }
  }

  // Single number - try to validate as phone first, then fax
  const phoneValidation = validatePhoneNumber(value);
  if (phoneValidation.isValid) {
    return phoneValidation;
  }

  const faxValidation = validateFaxNumber(value);
  return faxValidation;
};

/* ======================
   Email validation helpers
   ====================== */
export const validateEmailAddress = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email address is required" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Check basic format
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Check for common issues
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: "Email must contain exactly one @ symbol" };
  }

  const [localPart, domainPart] = parts;

  // Check local part (before @)
  if (localPart.length === 0) {
    return { isValid: false, message: "Email must have a local part before @ symbol" };
  }
  if (localPart.length > 64) {
    return { isValid: false, message: "Local part is too long (maximum 64 characters)" };
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: "Local part cannot start or end with a dot" };
  }
  if (localPart.includes('..')) {
    return { isValid: false, message: "Local part cannot contain consecutive dots" };
  }

  // Check domain part (after @)
  if (domainPart.length === 0) {
    return { isValid: false, message: "Email must have a domain after @ symbol" };
  }
  if (domainPart.length > 253) {
    return { isValid: false, message: "Domain is too long (maximum 253 characters)" };
  }
  if (!domainPart.includes('.')) {
    return { isValid: false, message: "Domain must contain at least one dot" };
  }
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return { isValid: false, message: "Domain cannot start or end with a dot" };
  }
  if (domainPart.includes('..')) {
    return { isValid: false, message: "Domain cannot contain consecutive dots" };
  }

  // Check top-level domain
  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, message: "Top-level domain must be at least 2 characters" };
  }
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, message: "Top-level domain must contain only letters" };
  }

  // Check for common typos in popular domains
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'aol.com', 'icloud.com', 'protonmail.com', 'yandex.com', 'mail.com'
  ];
  
  const domainWithoutTld = domainPart.substring(0, domainPart.lastIndexOf('.'));
  const isCommonDomain = commonDomains.some(domain => 
    domainPart === domain || domainPart.endsWith('.' + domain)
  );

  // Check for potential typos in common domains
  if (isCommonDomain) {
    const potentialTypos = commonDomains.filter(domain => {
      const similarity = calculateSimilarity(domainWithoutTld, domain.split('.')[0]);
      return similarity > 0.6 && similarity < 1.0;
    });
    
    if (potentialTypos.length > 0) {
      return { 
        isValid: true, 
        message: "Valid email address", 
        warning: true,
        suggestion: `Did you mean ${potentialTypos[0]}?`
      };
    }
  }

  return { isValid: true, message: "Valid email address" };
};

// Helper function to calculate string similarity (simple Levenshtein distance)
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/* ======================
   Date/Time validation helpers
   ====================== */
export const validateInspectionDateTime = (dateTimeValue, inspectionCreatedAt = null) => {
  if (!dateTimeValue || dateTimeValue.trim() === "") {
    return { isValid: false, message: "Inspection date and time is required" };
  }

  const inspectionDateTime = new Date(dateTimeValue);
  
  // Check if the date is valid
  if (isNaN(inspectionDateTime.getTime())) {
    return { isValid: false, message: "Invalid date and time format" };
  }

  const now = new Date();
  const currentDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

  // Check if the inspection date is in the future
  if (inspectionDateTime > currentDateTime) {
    return { isValid: false, message: "Inspection date cannot be in the future" };
  }

  // Check if inspection date is before creation date (if provided)
  if (inspectionCreatedAt) {
    const createdAt = new Date(inspectionCreatedAt);
    if (!isNaN(createdAt.getTime())) {
      // Allow some tolerance (e.g., 1 minute) for creation time
      const toleranceMinutes = 1;
      const createdAtWithTolerance = new Date(createdAt.getTime() + (toleranceMinutes * 60 * 1000));
      
      if (inspectionDateTime < createdAtWithTolerance) {
        return { isValid: false, message: "Inspection date cannot be before the inspection was created" };
      }
    }
  }

  // Check if the date is too far in the past (e.g., more than 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (inspectionDateTime < oneYearAgo) {
    return { isValid: true, message: "Valid inspection date", warning: true };
  }

  // Check if the date is very recent (within last hour) - might be a warning
  const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
  if (inspectionDateTime > oneHourAgo) {
    return { isValid: true, message: "Valid inspection date", warning: true };
  }

  return { isValid: true, message: "Valid inspection date" };
};

export const formatDateTimeForInput = (dateTime) => {
  if (!dateTime) return "";
  
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "";
  
  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getCurrentDateTimeForInput = () => {
  const now = new Date();
  return formatDateTimeForInput(now);
};

export const getInspectionCreatedAt = (inspectionData) => {
  if (!inspectionData) return null;
  
  // Try different possible fields for creation date
  const possibleFields = ['created_at', 'createdAt', 'date_created', 'dateCreated', 'created'];
  
  for (const field of possibleFields) {
    if (inspectionData[field]) {
      return inspectionData[field];
    }
  }
  
  return null;
};

/* ======================
   Purpose of Inspection validation helpers
   ====================== */
export const validatePurposeOfInspection = (purposeData) => {
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

  const selectedMainPurposes = mainPurposes.filter(purpose => purposeData[purpose]);
  
  if (selectedMainPurposes.length === 0) {
    errors.push("At least one purpose of inspection must be selected");
  }

  // Validate verify_accuracy details
  if (purposeData.verify_accuracy) {
    const accuracyDetails = purposeData.verify_accuracy_details || [];
    if (accuracyDetails.length === 0) {
      errors.push("When 'Verify accuracy of information' is selected, at least one accuracy detail must be chosen");
    }
    
    // If "Others" is selected, check if it has content
    if (accuracyDetails.includes("Others")) {
      if (!purposeData.verify_accuracy_others || purposeData.verify_accuracy_others.trim() === "") {
        errors.push("When 'Others' is selected for accuracy details, please specify the details");
      }
    }
  }

  // Validate check_commitment_status details
  if (purposeData.check_commitment_status) {
    const commitmentDetails = purposeData.commitment_status_details || [];
    if (commitmentDetails.length === 0) {
      errors.push("When 'Check status of commitment(s)' is selected, at least one commitment detail must be chosen");
    }
    
    // If "Others" is selected, check if it has content
    if (commitmentDetails.includes("Others")) {
      if (!purposeData.commitment_status_others || purposeData.commitment_status_others.trim() === "") {
        errors.push("When 'Others' is selected for commitment details, please specify the details");
      }
    }
  }

  // Validate other_purpose
  if (purposeData.other_purpose) {
    if (!purposeData.other_purpose_specify || purposeData.other_purpose_specify.trim() === "") {
      errors.push("When 'Others' is selected for purpose, please specify the purpose");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(", ") : "Valid purpose of inspection"
  };
};

export const validateVerifyAccuracyDetails = (accuracyDetails) => {
  if (!accuracyDetails || accuracyDetails.length === 0) {
    return {
      isValid: false,
      message: "At least one accuracy detail must be selected"
    };
  }

  return {
    isValid: true,
    message: "Valid accuracy details"
  };
};

export const validateCommitmentStatusDetails = (commitmentDetails) => {
  if (!commitmentDetails || commitmentDetails.length === 0) {
    return {
      isValid: false,
      message: "At least one commitment detail must be selected"
    };
  }

  return {
    isValid: true,
    message: "Valid commitment details"
  };
};

/* ======================
   Permit Date validation helpers
   ====================== */
export const validatePermitDates = (dateIssued, expiryDate) => {
  const errors = [];
  const warnings = [];

  // Check if dates are provided
  if (!dateIssued || dateIssued.trim() === "") {
    errors.push("Date issued is required");
  }

  if (!expiryDate || expiryDate.trim() === "") {
    errors.push("Expiry date is required");
  }

  // If both dates are provided, validate them
  if (dateIssued && expiryDate) {
    const issuedDate = new Date(dateIssued);
    const expiryDateObj = new Date(expiryDate);

    // Check if dates are valid
    if (isNaN(issuedDate.getTime())) {
      errors.push("Invalid date issued format");
    }

    if (isNaN(expiryDateObj.getTime())) {
      errors.push("Invalid expiry date format");
    }

    // If both dates are valid, check if expiry is after issued date
    if (!isNaN(issuedDate.getTime()) && !isNaN(expiryDateObj.getTime())) {
      if (expiryDateObj <= issuedDate) {
        errors.push("Expiry date must be after the date issued");
      }

      // Check if expiry date is in the past (warning)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (expiryDateObj < today) {
        warnings.push("Expiry date is in the past - permit may be expired");
      }

      // Check if expiry date is very far in the future (warning)
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
      
      if (expiryDateObj > fiveYearsFromNow) {
        warnings.push("Expiry date is more than 5 years in the future");
      }

      // Check if issued date is in the future (warning)
      if (issuedDate > today) {
        warnings.push("Date issued is in the future");
      }

      // Check if issued date is very old (warning)
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      
      if (issuedDate < tenYearsAgo) {
        warnings.push("Date issued is more than 10 years ago");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    message: errors.length > 0 ? errors.join(", ") : warnings.length > 0 ? warnings.join(", ") : "Valid permit dates"
  };
};

export const validateDateIssued = (dateIssued) => {
  if (!dateIssued || dateIssued.trim() === "") {
    return {
      isValid: false,
      message: "Date issued is required"
    };
  }

  const issuedDate = new Date(dateIssued);
  
  if (isNaN(issuedDate.getTime())) {
    return {
      isValid: false,
      message: "Invalid date format"
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (issuedDate > today) {
    return {
      isValid: true,
      message: "Valid date issued",
      warning: true
    };
  }

  return {
    isValid: true,
    message: "Valid date issued"
  };
};

export const validateExpiryDate = (expiryDate, dateIssued = null) => {
  if (!expiryDate || expiryDate.trim() === "") {
    return {
      isValid: false,
      message: "Expiry date is required"
    };
  }

  const expiryDateObj = new Date(expiryDate);
  
  if (isNaN(expiryDateObj.getTime())) {
    return {
      isValid: false,
      message: "Invalid date format"
    };
  }

  // Check if expiry date is after issued date
  if (dateIssued) {
    const issuedDate = new Date(dateIssued);
    if (!isNaN(issuedDate.getTime()) && expiryDateObj <= issuedDate) {
      return {
        isValid: false,
        message: "Expiry date must be after the date issued"
      };
    }
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (expiryDateObj < today) {
    return {
      isValid: true,
      message: "Valid expiry date",
      warning: true
    };
  }

  return {
    isValid: true,
    message: "Valid expiry date"
  };
};
