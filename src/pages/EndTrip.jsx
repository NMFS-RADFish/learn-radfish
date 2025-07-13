// --- Imports ---
import "../index.css";

import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Select,
  StepIndicator,
  StepIndicatorStep,
  TimePicker,
} from "@trussworks/react-uswds";
import { validateRequired, FIELD_NAMES } from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

// --- Component Definition ---
/**
 * EndTrip - Third step in the trip recording workflow
 * This component demonstrates:
 * - Loading and updating existing trip data
 * - Form validation for trip end details
 * - Continuing the step-based workflow
 * - Consistent error handling patterns
 */
function EndTrip() {
  // --- RADFish Application Context ---
  // Access to the RADFish application instance for store operations
  const app = useApplication();
  
  // --- Custom Hooks ---
  // Navigation hook that handles trip-specific routing
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();
  
  // --- State Management ---
  // Form data state - tracks end trip details
  const [formData, setFormData] = useState({
    endWeather: "",
    endTime: "",
  });
  
  // Validation errors state - stores field-specific error messages
  const [errors, setErrors] = useState({});
  
  // --- Trip Data Management ---
  // Custom hook for managing trip data with RADFish stores
  // Only updates existing trips (no creation needed at this step)
  const { trip, isLoading, updateTrip } = useTripData(
    tripId,
    (error) => {
      // Error callback - redirects to home if trip not found
      console.warn("Trip loading error:", error);
      navigateHome();
    }
  );
  
  // --- Effects ---
  /**
   * Populates form with existing end trip data
   * Allows users to edit previously entered end details
   */
  useEffect(() => {
    if (trip) {
      setFormData({
        endWeather: trip.endWeather || "",
        endTime: trip.endTime || "",
      });
    }
  }, [trip]);
  
  // --- Validation ---
  /**
   * Validates end trip form fields
   * Uses centralized validation utilities for consistency
   * @param {Object} data - Form data to validate
   * @returns {Object} Validation errors object (empty if valid)
   */
  const validateForm = (data) => {
    const newErrors = {};
    
    // Validate required fields using centralized validators
    const weatherError = validateRequired(data.endWeather, FIELD_NAMES.END_WEATHER);
    if (weatherError) newErrors.endWeather = weatherError;
    
    const timeError = validateRequired(data.endTime, FIELD_NAMES.END_TIME);
    if (timeError) newErrors.endTime = timeError;
    
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  /**
   * Handles time picker changes
   * @param {string} time - Selected time value
   * @param {string} fieldName - Name of the time field (defaults to 'endTime')
   */
  const handleTimeChange = (time, fieldName = 'endTime') => {
    setFormData(prev => ({ ...prev, [fieldName]: time }));
    
    // Clear error for this field when user selects time
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };
  
  /**
   * Handles form submission
   * Updates trip with end details and advances to review step
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all form fields
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // Only proceed if no validation errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Update trip with end details
        const success = await updateTrip({
          ...formData,
          status: "in-progress",
          step: 4 // Move to step 4 (Review & Submit)
        });
        
        if (success) {
          // Navigate to review page with trip context
          navigateWithTripId("/review", tripId);
        } else {
          throw new Error("Failed to update trip");
        }
      } catch (error) {
        console.error("Error saving end trip data:", error);
      }
    }
  };
  
  // --- Render Logic ---
  // Show loading state while fetching trip data
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip end details...</div>;
  }
  
  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="margin-top-4 border-bottom border-base-light padding-bottom-2">
              <StepIndicator
                headingLevel="h4"
                ofText="of"
                stepText="Step"
                className="usa-step-indicator margin-bottom-0"
                showLabels={false}
              >
                <StepIndicatorStep label="Start Trip" status="complete" />
                <StepIndicatorStep label="Log Catch" status="complete" />
                <StepIndicatorStep label="End Trip" status="current" />
                <StepIndicatorStep label="Review and Submit" />
              </StepIndicator>
            </div>
            
            {/* End Trip Form */}
            <Form onSubmit={handleSubmit} large className="margin-top-3">
              {/* End Weather Selection */}
              <FormGroup error={errors.endWeather}>
                <Label htmlFor="endWeather" error={errors.endWeather} requiredMarker>
                  End Weather
                </Label>
                <Select
                  id="endWeather"
                  name="endWeather"
                  value={formData.endWeather}
                  onChange={handleInputChange}
                  validationStatus={errors.endWeather ? "error" : undefined}
                  aria-describedby="endWeather-error-message"
                >
                  <option value="">-Select-</option>
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Foggy">Foggy</option>
                  <option value="Windy">Windy</option>
                </Select>
                <ErrorMessage id="endWeather-error-message" className="font-sans-2xs">
                  {errors.endWeather}
                </ErrorMessage>
              </FormGroup>

              {/* End Time Selection */}
              <FormGroup error={errors.endTime}>
                <Label htmlFor="endTime" error={errors.endTime} requiredMarker>
                  End Time
                </Label>
                <TimePicker
                  id="endTime"
                  name="endTime"
                  defaultValue={formData.endTime}
                  onChange={(time) => handleTimeChange(time, 'endTime')}
                  minTime="00:00"
                  maxTime="23:30"
                  step={30}
                  validationStatus={errors.endTime ? "error" : undefined}
                  aria-describedby="endTime-error-message"
                />
                <ErrorMessage id="endTime-error-message" className="font-sans-2xs">
                  {errors.endTime}
                </ErrorMessage>
              </FormGroup>
            </Form>
          </Grid>
        </Grid>
      </GridContainer>
      
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigateWithTripId("/catch", tripId)}
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

export default EndTrip;
