/**
 * Utility functions for processing user inputs in forms
 */

/**
 * Processes coordinate input (latitude/longitude) to enforce length limitations
 * For latitude: max 2 whole number digits, 6 decimal places
 * For longitude: max 3 whole number digits, 6 decimal places
 * 
 * @param {string} value - The input value to process
 * @param {string} coordinateType - Either 'latitude' or 'longitude'
 * @param {HTMLInputElement} inputElement - The DOM input element (for direct updating)
 * @returns {Object} - Contains processedValue and a flag indicating if update should be skipped
 */
export const processCoordinateInput = (value, coordinateType, inputElement) => {
  // Define max whole number digits based on coordinate type
  const maxWholeDigits = coordinateType === 'latitude' ? 2 : 3;
  let processedValue = value;
  let skipUpdate = false;
  
  // Handle decimal numbers
  if (value.includes('.')) {
    const parts = value.split('.');
    // Limit whole number part (excluding negative sign)
    const wholePartWithoutSign = parts[0].replace('-', '');
    
    if (wholePartWithoutSign.length > maxWholeDigits) {
      // Skip update if exceeds whole number limit
      skipUpdate = true;
      return { processedValue, skipUpdate };
    }
    
    // Limit decimal part to 6 places
    if (parts[1] && parts[1].length > 6) {
      // Truncate to 6 decimal places
      processedValue = `${parts[0]}.${parts[1].substring(0, 6)}`;
      
      // If value was truncated and we have an input element, update it directly
      if (processedValue !== value && inputElement) {
        inputElement.value = processedValue;
        skipUpdate = true;
      }
    }
  } 
  // Handle whole numbers (no decimal point)
  else {
    // Limit whole number part (excluding negative sign)
    const valueWithoutSign = value.replace('-', '');
    if (valueWithoutSign.length > maxWholeDigits) {
      skipUpdate = true;
    }
  }
  
  return { processedValue, skipUpdate };
};
