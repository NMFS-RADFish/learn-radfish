// --- Imports ---
import "../index.css";
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Grid,
  GridContainer,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";
import { validateRequired, FIELD_NAMES } from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

// --- Component Definition ---
/**
 * StartTrip - First step in the trip recording workflow
 * This component demonstrates:
 * - Form state management with validation
 * - Custom hooks for navigation and data management
 * - Creating/updating trips in RADFish stores
 * - Step-based workflow navigation
 */
function StartTrip() {
  // --- Custom Hooks ---
  // Navigation hook that handles trip-specific routing
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();

  // --- State Management ---
  // Form data state - tracks all user inputs for the start trip form
  const [formData, setFormData] = useState({
    tripDate: "",
    startWeather: "",
    startTime: "",
  });

  // Validation errors state - stores field-specific error messages
  const [errors, setErrors] = useState({});

  // --- Trip Data Management ---
  // Custom hook for managing trip data with RADFish stores
  // Handles both creating new trips and updating existing ones
  const { trip, isLoading, updateTrip, createTrip } = useTripData(
    tripId,
    (error) => {
      // Error callback - redirects to home if trip loading fails
      console.warn("Trip loading error:", error);
      navigateHome();
    },
    { formatFields: ["tripDate"] }, // Auto-formats date fields for display
  );

  // --- Effects ---
  /**
   * Populates form with existing trip data when editing
   * This allows users to resume an in-progress trip
   */
  useEffect(() => {
    if (trip) {
      setFormData({
        tripDate: trip.tripDate || "",
        startWeather: trip.startWeather || "",
        startTime: trip.startTime || "",
      });
    }
  }, [trip]);

  // --- Validation ---
  /**
   * Validates all form fields before submission
   * Uses centralized validation utilities for consistency
   * @param {Object} data - Form data to validate
   * @returns {Object} Validation errors object (empty if valid)
   */
  const validateForm = (data) => {
    const newErrors = {};

    // Validate each required field using centralized validators
    const dateError = validateRequired(data.tripDate, FIELD_NAMES.DATE);
    if (dateError) newErrors.tripDate = dateError;

    const weatherError = validateRequired(
      data.startWeather,
      FIELD_NAMES.START_WEATHER,
    );
    if (weatherError) newErrors.startWeather = weatherError;

    const timeError = validateRequired(data.startTime, FIELD_NAMES.START_TIME);
    if (timeError) newErrors.startTime = timeError;

    return newErrors;
  };

  // --- Event Handlers ---
  /**
   * Handles input field changes
   * Updates form state and clears validation errors on change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handles time picker changes
   * @param {string} time - Selected time value
   * @param {string} fieldName - Name of the time field
   */
  const handleTimeChange = (time, fieldName = "startTime") => {
    setFormData((prev) => ({ ...prev, [fieldName]: time }));

    // Clear error for this field when user selects time
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  /**
   * Handles date picker changes
   * @param {string} date - Selected date value
   * @param {string} fieldName - Name of the date field
   */
  const handleDateChange = (date, fieldName = "tripDate") => {
    setFormData((prev) => ({ ...prev, [fieldName]: date || "" }));

    // Clear error for this field when user selects date
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  /**
   * Handles form submission
   * Creates new trip or updates existing trip in RADFish store
   * Navigates to next step on success
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

      try {
        let navigateToId = tripId;

      } catch (error) {
        console.error("Error saving trip data:", error, "Trip ID:", tripId);
      }
  };

  // --- Render Logic ---
  // Show loading state while fetching existing trip data
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip...</div>;
  }

  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="width-full text-left">
              <div className="margin-top-4 border-bottom border-base-light padding-bottom-2">
                <StepIndicator
                  headingLevel="h4"
                  ofText="of"
                  stepText="Step"
                  className="usa-step-indicator margin-bottom-0"
                  showLabels={false}
                >
                  <StepIndicatorStep label="Start Trip" status="current" />
                  <StepIndicatorStep label="Log Catch" />
                  <StepIndicatorStep label="End Trip" />
                  <StepIndicatorStep label="Review and Submit" />
                </StepIndicator>
              </div>

              {/* Form fields will be added here in the learning exercises */}
              <Form onSubmit={handleSubmit} large className="margin-top-3">
              </Form>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={navigateHome}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="width-full margin-left-2"
            onClick={handleSubmit}
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default StartTrip;
