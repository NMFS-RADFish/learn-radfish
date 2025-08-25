import { 
  validateRequired, 
  validateNumberRange, 
  validateLatitude, 
  validateLongitude, 
  FIELD_NAMES,
  VALIDATION_RANGES
} from './validation';

/**
 * Validates new catch form data
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation errors keyed by field name
 */
export const validateNewCatch = (data) => {
  const newErrors = {};
  
  // Validate required fields
  newErrors.species = validateRequired(data.species, FIELD_NAMES.SPECIES);
  newErrors.weight = validateRequired(data.weight, FIELD_NAMES.WEIGHT);
  newErrors.length = validateRequired(data.length, FIELD_NAMES.LENGTH);
  newErrors.time = validateRequired(data.time, FIELD_NAMES.TIME);
  
  // Validate ranges if value exists and required check passed
  if (!newErrors.weight && data.weight) {
    const { min, max } = VALIDATION_RANGES.WEIGHT;
    newErrors.weight = validateNumberRange(data.weight, min, max, FIELD_NAMES.WEIGHT, false);
  }
  if (!newErrors.length && data.length) {
    const { min, max } = VALIDATION_RANGES.LENGTH;
    newErrors.length = validateNumberRange(data.length, min, max, FIELD_NAMES.LENGTH, false);
  }
  
  // Validate coordinates if entered
  if (data.latitude) {
    newErrors.latitude = validateLatitude(data.latitude);
  }
  if (data.longitude) {
    newErrors.longitude = validateLongitude(data.longitude);
  }
  
  // Filter out null/undefined errors
  return Object.entries(newErrors).reduce((acc, [key, value]) => {
    if (value) acc[key] = value;
    return acc;
  }, {});
};

/**
 * Validates recorded catch data
 * @param {Object} catchItem - Catch item to validate
 * @returns {Object} Validation errors keyed by field name
 */
export const validateRecordedCatch = (catchItem) => {
  const catchErrors = {};
  
  // Validate required fields
  catchErrors.species = validateRequired(catchItem.species, FIELD_NAMES.SPECIES);
  catchErrors.weight = validateRequired(catchItem.weight, FIELD_NAMES.WEIGHT);
  catchErrors.length = validateRequired(catchItem.length, FIELD_NAMES.LENGTH);
  catchErrors.time = validateRequired(catchItem.time, FIELD_NAMES.TIME);
  
  // Validate ranges if value exists and required check passed
  if (!catchErrors.weight && catchItem.weight) {
    const { min, max } = VALIDATION_RANGES.WEIGHT;
    catchErrors.weight = validateNumberRange(catchItem.weight, min, max, FIELD_NAMES.WEIGHT, false);
  }
  if (!catchErrors.length && catchItem.length) {
    const { min, max } = VALIDATION_RANGES.LENGTH;
    catchErrors.length = validateNumberRange(catchItem.length, min, max, FIELD_NAMES.LENGTH, false);
  }
  
  // Validate coordinates if entered
  if (catchItem.latitude) {
    catchErrors.latitude = validateLatitude(catchItem.latitude);
  }
  if (catchItem.longitude) {
    catchErrors.longitude = validateLongitude(catchItem.longitude);
  }
  
  return catchErrors;
};

/**
 * Validates all catches in an array using a provided validator function
 * @param {Array} catches - Array of catch objects to validate
 * @param {Function} validator - Function that validates a single catch
 * @returns {Object} Validation errors indexed by catch index
 */
export const validateAllCatches = (catches, validator) => {
  if (!validator || !Array.isArray(catches)) return {};
  
  const allErrors = {};
  
  catches.forEach((catchItem, index) => {
    const catchErrors = validator(catchItem);
    
    // Filter out null/undefined errors for this specific catch
    const filteredCatchErrors = Object.entries(catchErrors).reduce(
      (acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      },
      {}
    );
    
    // If there are errors for this catch, add them to the main error object
    if (Object.keys(filteredCatchErrors).length > 0) {
      allErrors[index] = filteredCatchErrors;
    }
  });
  
  return allErrors;
}; 