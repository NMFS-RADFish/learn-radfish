/**
 * Core validation utilities.
 * These functions follow a consistent pattern:
 * - Each returns null for valid values
 * - Each returns an error message string for invalid values
 * - Each is pure and has no side effects
 */

/**
 * Validates if a value is not empty
 * @param {any} value - The value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates if a number is within a specified range
 * @param {number|string} value - The value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateNumberRange = (value, min, max, fieldName) => {
  // Skip validation if the field is empty (validateRequired should handle this)
  if (value === "" || value === null || value === undefined) {
    return null;
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
  return validateNumberRange(value, -90, 90, "Latitude");
};

/**
 * Validates longitude (-180 to 180 degrees)
 * @param {number|string} value - The longitude value
 * @returns {string|null} Error message or null if valid
 */
export const validateLongitude = (value) => {
  return validateNumberRange(value, -180, 180, "Longitude");
};

/**
 * Helper to chain multiple validations together
 * Stops at the first error it finds
 * 
 * Example usage:
 * const error = validateChain(
 *   validateRequired(value, "Field Name"),
 *   validateLatitude(value)
 * );
 * 
 * @param {...(string|null)} validations - Results from validation functions
 * @returns {string|null} First error message or null if all valid
 */
export const validateChain = (...validations) => {
  for (const validation of validations) {
    if (validation) return validation;
  }
  return null;
};

/**
 * Checks if the input value has more characters than the maximum allowed
 * Ignores negative sign when counting characters
 * 
 * @param {string} value - The input value
 * @param {number} maxLength - Maximum number of digits allowed
 * @returns {boolean} True if value is valid, false if it exceeds max length
 */
export const validateCharLimit = (value, maxLength) => {
  // Remove negative sign for length checking
  const valueWithoutSign = value.toString().replace('-', '');
  return valueWithoutSign.length <= maxLength;
};

/**
 * Validates that latitude input doesn't exceed 3 digits (excluding negative sign)
 * 
 * @param {string} value - The latitude value
 * @returns {boolean} True if value is valid, false if it exceeds max length
 */
export const validateLatitudeLength = (value) => {
  // Latitude range is -90 to 90, so max 3 digits including decimal point
  return validateCharLimit(value, 3);
};

/**
 * Validates that longitude input doesn't exceed 4 digits (excluding negative sign)
 * 
 * @param {string} value - The longitude value
 * @returns {boolean} True if value is valid, false if it exceeds max length
 */
export const validateLongitudeLength = (value) => {
  // Longitude range is -180 to 180, so max 4 digits including decimal point
  return validateCharLimit(value, 4);
};
