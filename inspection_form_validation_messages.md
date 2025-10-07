# Inspection Form Validation Error Messages

## 1. General Information Section

### Required Field Errors:
- **Establishment Name**: "Establishment name is required."
- **Address**: "Address is required."
- **Coordinates**: "Coordinates are required." / "Coordinates must be in 'lat, lon' decimal format."
- **Nature of Business**: "Nature of Business is required."
- **Year Established**: "Year established is required." / "Enter a 4-digit year." / "Year cannot be in the future."
- **Operating Hours**: "Operating Hours is required." / "Operating Hours must be between 1 and 24."
- **Operating Days/Week**: "Operating Days/Week is required." / "Operating Days/Week must be between 1 and 7."
- **Operating Days/Year**: "Operating Days/Year is required." / "Operating Days/Year must be between 1 and 365."
- **Phone/Fax No.**: "Phone/Fax No. is required."
- **Email Address**: "Email Address is required." / "Enter a valid email."
- **Inspection Date & Time**: "Inspection date/time is required." / "Invalid inspection date/time." / "Inspection date/time cannot be in the future." / "Inspection date/time cannot be before the creation date."

### Real-time Validation Messages:
- **Phone/Fax Validation**:
  - "Phone/Fax number is required"
  - "Phone number is required" / "Fax number is required"
  - "Phone number must contain digits" / "Fax number must contain digits"
  - "Phone number too short (minimum 7 digits)" / "Fax number too short (minimum 7 digits)"
  - "Phone number too long (maximum 15 digits)" / "Fax number too long (maximum 15 digits)"
  - "Invalid phone number format" / "Invalid fax number format"
  - "Phone: [error], Fax: [error]" (for combined phone/fax)

- **Email Validation**:
  - "Email address is required"
  - "Invalid email format"
  - "Email must contain exactly one @ symbol"
  - "Email must have a local part before @ symbol"
  - "Local part is too long (maximum 64 characters)"
  - "Local part cannot start or end with a dot"
  - "Local part cannot contain consecutive dots"
  - "Email must have a domain after @ symbol"
  - "Domain is too long (maximum 253 characters)"
  - "Domain must contain at least one dot"
  - "Domain cannot start or end with a dot"
  - "Domain cannot contain consecutive dots"
  - "Top-level domain must be at least 2 characters"
  - "Top-level domain must contain only letters"

- **Inspection Date/Time Validation**:
  - "Inspection date and time is required"
  - "Invalid date and time format"
  - "Inspection date cannot be in the future"
  - "Inspection date cannot be before the creation date"

## 2. Purpose of Inspection Section

### Validation Messages:
- "At least one purpose of inspection must be selected"
- "When 'Verify accuracy of information' is selected, at least one accuracy detail must be chosen"
- "When 'Others' is selected for accuracy details, please specify the details"
- "When 'Check status of commitment(s)' is selected, at least one commitment detail must be chosen"
- "When 'Others' is selected for commitment details, please specify the details"
- "When 'Others' is selected for purpose, please specify the purpose"
- "At least one accuracy detail must be selected"
- "At least one commitment detail must be selected"

## 3. Compliance Status Section (DENR Permits)

### Date Validation Messages (conditional on permit number):
- **Date Issued**:
  - "Date issued is required" (only if permit number is filled)
  - "Invalid date format"
  - "Date issued cannot be in the future"
  - "Valid date issued"

- **Expiry Date**:
  - "Expiry date is required" (only if permit number is filled)
  - "Invalid date format"
  - "Expiry date must be after the date issued"
  - "Expiry date is in the past - permit may be expired" (warning)
  - "Valid expiry date"

## 4. Summary of Compliance Section

### Compliance Status Validation:
- "Select compliance status." (for each compliance item)

### Remarks Validation:
- "Select a remark option." (when Non-Compliant is selected)
- "Enter custom remarks." (when "Other" is selected but no text provided)

## 5. Summary of Findings and Observations Section

### System Status Validation:
- "Select status for '[System Name]'." (for each system)

### System Remarks Validation:
- "Select a remark option." (when Non-Compliant is selected)
- "Enter custom remarks." (when "Other" is selected but no text provided)

## 6. Recommendations Section

### Recommendations Validation:
- "Select at least one recommendation."
- "Provide text for other recommendation." (when "Other Recommendations" is selected but no text provided)

## 7. Form-Level Validation

### Save/Complete Validation:
- "Please fix errors before saving." (when trying to save with validation errors)
- "Please fix errors before completing the inspection." (when trying to complete with validation errors)

### Draft Status:
- "📝 Draft" (yellow indicator when form is in draft mode)

## 8. Success Messages

### Valid States:
- "Valid date issued" / "Valid expiry date"
- "Valid phone number" / "Valid fax number"
- "Valid email address"
- "Valid purpose of inspection"
- "Valid permit dates"

## Color Coding:
- **Red text/borders**: Invalid/Error states
- **Green text/borders**: Valid states
- **Yellow text/borders**: Warning states (expired permits)
- **Black borders**: Default/neutral states
