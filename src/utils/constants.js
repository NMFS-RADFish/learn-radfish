// ============================================================================
// TRIP STATUS CONSTANTS
// ============================================================================

export const TRIP_STATUS = {
  SUBMITTED: "submitted",
  IN_PROGRESS: "in-progress",
  NOT_SUBMITTED: "Not Submitted",
};

export const TRIP_STATUS_LABELS = {
  SUBMITTED: "SUBMITTED",
  IN_PROGRESS: "IN PROGRESS",
  READY_TO_SUBMIT: "READY TO SUBMIT",
  NOT_STARTED: "NOT STARTED",
};

// ============================================================================
// RADFISH STORE CONSTANTS
// ============================================================================

export const STORE_NAMES = {
  TRIP: "trip",
};

export const COLLECTION_NAMES = {
  FORM: "Form",
  CATCH: "Catch",
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

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

// Validation ranges
export const VALIDATION_RANGES = {
  WEIGHT: { min: 0, max: 1000 },
  LENGTH: { min: 0, max: 500 },
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 },
};

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export const SPECIES_OPTIONS = ["Yellowfin", "Bluefin", "Salmon", "Halibut"];

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const TIME_PICKER_CONFIG = {
  MIN_TIME: "00:00",
  MAX_TIME: "23:45",
  STEP: 15,
};

export const TRIP_STEPS = {
  START: 1,
  CATCH: 2,
  END: 3,
  REVIEW: 4,
}; 