import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
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

function StartTrip() {
  const app = useApplication();
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();
  
  // Form state
  const [formData, setFormData] = useState({
    tripDate: "",
    startWeather: "",
    startTime: "",
  });
  const [errors, setErrors] = useState({});
  
  // Trip data management
  const { trip, isLoading, updateTrip, createTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    },
    { formatFields: ['tripDate'] }
  );
  
  // Load trip data into form when trip is loaded
  useEffect(() => {
    if (trip) {
      setFormData({
        tripDate: trip.tripDate || "",
        startWeather: trip.startWeather || "",
        startTime: trip.startTime || "",
      });
    }
  }, [trip]);
  
  // Form validation function
  const validateForm = (data) => {
    const newErrors = {};
    
    const dateError = validateRequired(data.tripDate, FIELD_NAMES.DATE);
    if (dateError) newErrors.tripDate = dateError;
    
    const weatherError = validateRequired(data.startWeather, FIELD_NAMES.START_WEATHER);
    if (weatherError) newErrors.startWeather = weatherError;
    
    const timeError = validateRequired(data.startTime, FIELD_NAMES.START_TIME);
    if (timeError) newErrors.startTime = timeError;
    
    return newErrors;
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle time changes
  const handleTimeChange = (time, fieldName = 'startTime') => {
    setFormData(prev => ({ ...prev, [fieldName]: time }));
    
    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (date, fieldName = 'tripDate') => {
    setFormData(prev => ({ ...prev, [fieldName]: date || '' }));
    
    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // Only proceed if no validation errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        let navigateToId = tripId;
        
        if (tripId) {
          // Update existing trip
          const success = await updateTrip({
            ...formData,
            status: "in-progress",
            step: 2
          });
          
          if (!success) {
            throw new Error("Failed to update trip");
          }
        } else {
          // Create new trip
          navigateToId = await createTrip({
            ...formData,
            status: "in-progress",
            step: 2
          });
          
          if (!navigateToId) {
            throw new Error("Failed to create trip");
          }
        }
        
        // Navigate to catch log page
        navigateWithTripId("/catch", navigateToId);
      } catch (error) {
        console.error("Error saving trip data:", error, "Trip ID:", tripId);
      }
    }
  };
  
  // Show loading message while fetching data
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
