/**
 * Utility for loading and managing form configuration
 */
import formConfig from '../constants/inspectionform/formConfig.json';

export class FormConfigLoader {
  constructor() {
    this.config = formConfig;
  }

  /**
   * Get all form sections
   */
  getSections() {
    return this.config.formSections || [];
  }

  /**
   * Get a specific section by ID
   */
  getSection(sectionId) {
    return this.config.formSections?.find(section => section.id === sectionId);
  }

  /**
   * Get all fields from all sections
   */
  getAllFields() {
    const fields = [];
    this.config.formSections?.forEach(section => {
      section.fields?.forEach(field => {
        fields.push({
          ...field,
          sectionId: section.id,
          sectionTitle: section.title
        });
      });
    });
    return fields;
  }

  /**
   * Get fields for a specific section
   */
  getSectionFields(sectionId) {
    const section = this.getSection(sectionId);
    return section?.fields || [];
  }

  /**
   * Get a specific field by ID
   */
  getField(fieldId) {
    return this.getAllFields().find(field => field.id === fieldId);
  }

  /**
   * Get required fields
   */
  getRequiredFields() {
    return this.config.formValidation?.required_fields || [];
  }

  /**
   * Get conditional required fields
   */
  getConditionalRequiredFields() {
    return this.config.formValidation?.conditional_required || [];
  }

  /**
   * Get validation rules for a field
   */
  getFieldValidation(fieldId) {
    const field = this.getField(fieldId);
    return field?.validation || {};
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(fieldId) {
    const requiredFields = this.getRequiredFields();
    return requiredFields.includes(fieldId);
  }

  /**
   * Check if a field is conditionally required based on other field values
   */
  isFieldConditionallyRequired(fieldId, formData) {
    const conditionalFields = this.getConditionalRequiredFields();
    const conditionalRule = conditionalFields.find(rule => rule.field === fieldId);
    
    if (!conditionalRule) return false;

    const condition = conditionalRule.condition;
    const targetFieldValue = formData[condition.field];

    if (condition.equals) {
      return targetFieldValue === condition.equals;
    } else if (condition.contains) {
      return Array.isArray(targetFieldValue) && targetFieldValue.includes(condition.contains);
    }

    return false;
  }

  /**
   * Validate a field value
   */
  validateField(fieldId, value, formData = {}) {
    const field = this.getField(fieldId);
    if (!field) return { isValid: true, errors: [] };

    const errors = [];

    // Check if field is required
    if (this.isFieldRequired(fieldId) || this.isFieldConditionallyRequired(fieldId, formData)) {
      if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        errors.push(`${field.label} is required`);
      }
    }

    // Field-specific validation
    if (value !== null && value !== undefined && value !== '') {
      // Pattern validation
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push(field.validation.message || `${field.label} format is invalid`);
        }
      }

      // Min/Max validation for numbers
      if (field.type === 'number') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          if (field.min !== undefined && numValue < field.min) {
            errors.push(`${field.label} must be at least ${field.min}`);
          }
          if (field.max !== undefined && numValue > field.max) {
            errors.push(`${field.label} must be at most ${field.max}`);
          }
        }
      }

      // Email validation
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field.label} must be a valid email address`);
        }
      }

      // Date validation
      if (field.type === 'date' || field.type === 'datetime-local') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field.label} must be a valid date`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate entire form
   */
  validateForm(formData) {
    const errors = {};
    const warnings = {};

    // Validate all fields
    this.getAllFields().forEach(field => {
      const value = formData[field.id];
      const validation = this.validateField(field.id, value, formData);
      
      if (!validation.isValid) {
        errors[field.id] = validation.errors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get field options for select/checkbox/radio fields
   */
  getFieldOptions(fieldId) {
    const field = this.getField(fieldId);
    if (!field) return [];

    switch (field.type) {
      case 'select':
        return field.options || [];
      case 'checkbox_group':
      case 'radio':
        return field.options || [];
      case 'permit_checklist':
        return field.permit_types || [];
      case 'compliance_checklist':
        return field.compliance_categories || [];
      case 'system_checklist':
        return field.systems || [];
      default:
        return [];
    }
  }

  /**
   * Check if a field should be shown based on conditional logic
   */
  shouldShowField(fieldId, formData) {
    const field = this.getField(fieldId);
    if (!field || !field.conditional) return true;

    const condition = field.conditional;
    const targetFieldValue = formData[condition.field];

    if (condition.value) {
      if (Array.isArray(targetFieldValue)) {
        return targetFieldValue.includes(condition.value);
      } else {
        return targetFieldValue === condition.value;
      }
    }

    return true;
  }

  /**
   * Get form metadata
   */
  getMetadata() {
    return this.config.formMetadata || {};
  }

  /**
   * Get applicable laws
   */
  getApplicableLaws() {
    return this.config.formMetadata?.applicableLaws || [];
  }

  /**
   * Create initial form data structure
   */
  createInitialFormData() {
    const formData = {};
    
    this.getAllFields().forEach(field => {
      switch (field.type) {
        case 'checkbox_group':
        case 'permit_checklist':
        case 'compliance_checklist':
        case 'system_checklist':
          formData[field.id] = [];
          break;
        case 'checkbox':
          formData[field.id] = false;
          break;
        case 'number':
          formData[field.id] = null;
          break;
        case 'date':
        case 'datetime-local':
          formData[field.id] = null;
          break;
        default:
          formData[field.id] = '';
      }
    });

    return formData;
  }
}

// Export singleton instance
export const formConfigLoader = new FormConfigLoader();

// Export default configuration
export default formConfig;
