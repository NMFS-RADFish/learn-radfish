/**
 * Validates if a value is not empty
 * @param {any} value - The value to check
 * @param {string} fieldName - Name of the field for the error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates if a number is within a specified range
 * @param {number|string} value - The value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of the field for the error message
 * @returns {string|null} Error message or null if valid
 */
export const validateNumberRange = (value, min, max, fieldName) => {
  if (value === '' || value === null || value === undefined) {
    return null; // Empty check should be handled by validateRequired
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (numValue < min || numValue > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  
  return null;
};

/**
 * Validates latitude (-90 to 90 degrees)
 * @param {number|string} value - The latitude value
 * @returns {string|null} Error message or null if valid
 */
export const validateLatitude = (value) => {
  return validateNumberRange(value, -90, 90, 'Latitude');
};

/**
 * Validates longitude (-180 to 180 degrees)
 * @param {number|string} value - The longitude value
 * @returns {string|null} Error message or null if valid
 */
export const validateLongitude = (value) => {
  return validateNumberRange(value, -180, 180, 'Longitude');
};

/**
 * Validates a form object with multiple fields
 * @param {Object} formData - The form data object
 * @param {Object} validationRules - Object mapping field names to validation functions
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.entries(validationRules).forEach(([fieldName, validationFns]) => {
    // Handle both single validation functions and arrays of validation functions
    const validations = Array.isArray(validationFns) ? validationFns : [validationFns];
    
    for (const validationFn of validations) {
      const error = validationFn(formData[fieldName], fieldName);
      if (error) {
        errors[fieldName] = error;
        break; // Stop at the first error for this field
      }
    }
  });
  
  return errors;
}; 