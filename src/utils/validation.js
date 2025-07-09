// Field name constants used in validation messages
export const FIELD_NAMES = {
  DATE: "Trip date",
  START_WEATHER: "Start weather",
  START_TIME: "Start time",
  END_WEATHER: "End weather",
  END_TIME: "End time",
  SPECIES: "Species",
  WEIGHT: "Weight",
  LENGTH: "Length",
  LATITUDE: "Latitude",
  LONGITUDE: "Longitude",
  TIME: "Catch time",
};

// Utility to format a date string to YYYY-MM-DD for the DatePicker default value
export const formatToYYYYMMDD = (dateString) => {
  if (!dateString || typeof dateString !== "string") {
    return "";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string could not be parsed: ${dateString}`);
      return "";
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Error formatting date string: ${dateString}`, error);
    return "";
  }
};

// Simple required field validation
export const validateRequired = (value, fieldName) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }
  return null;
};

// Number range validation with optional zero handling
export const validateNumberRange = (value, min, max, fieldName, allowZero = true) => {
  if (value === "" || value === null || value === undefined) return null;
  const numValue = Number(value);
  if (isNaN(numValue)) return `${fieldName} must be a valid number`;
  if (!allowZero && numValue <= min)
    return `${fieldName} must be greater than ${min}`;
  if (allowZero && numValue < min)
    return `${fieldName} must be at least ${min}`;
  if (numValue > max) {
    const minOperator = allowZero ? ">=" : ">";
    return `${fieldName} must be ${minOperator} ${min} and <= ${max}`;
  }
  return null;
};

// Latitude validation (-90 to 90)
export const validateLatitude = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numValue = Number(value);
  if (isNaN(numValue)) return `${FIELD_NAMES.LATITUDE} must be a valid number`;
  if (numValue < -90 || numValue > 90)
    return `${FIELD_NAMES.LATITUDE} must be between -90 and 90`;
  return null;
};

// Longitude validation (-180 to 180)
export const validateLongitude = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numValue = Number(value);
  if (isNaN(numValue)) return `${FIELD_NAMES.LONGITUDE} must be a valid number`;
  if (numValue < -180 || numValue > 180)
    return `${FIELD_NAMES.LONGITUDE} must be between -180 and 180`;
  return null;
};

// Predefined species options for the dropdown
export const SPECIES_OPTIONS = ["Yellowfin", "Bluefin", "Salmon", "Halibut"]; 