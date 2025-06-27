import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  Form,
  Grid,
  GridContainer,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";

// Utility to format a date string to YYYY-MM-DD for the DatePicker default value
const formatToYYYYMMDD = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string could not be parsed: ${dateString}`);
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Error formatting date string: ${dateString}`, error);
    return '';
  }
};

// Constants for field names used in validation messages
const FIELD_DATE = "Trip date";
const FIELD_START_WEATHER = "Start weather";
const FIELD_START_TIME = "Start time";

function StartTrip() {
  // React Router hook for programmatic navigation
  const navigate = useNavigate();
  // React Router hook to access location state (like tripId passed from Home)
  const location = useLocation();
  // Extract tripId from location state if it exists (for editing an existing trip)
  const tripIdFromState = location.state?.tripId;
  // RADFish hook to get the application instance, needed for store access
  const app = useApplication();

  // --- State Management ---
  // useState hook to manage the form's input values.
  // Initialized empty for new trips.
  const [formData, setFormData] = useState({
    tripDate: "",
    startWeather: "",
    startTime: "",
  });
  // useState hook to store the ID of the trip being edited, if any.
  const [currentTripId, setCurrentTripId] = useState(tripIdFromState || null);
  // useState hook to store validation errors for form fields.
  const [errors, setErrors] = useState({});
  // useState hook to show a loading indicator while fetching existing trip data.
  const [isLoading, setIsLoading] = useState(!!tripIdFromState); // True if editing

  // --- Data Loading ---
  // useEffect hook to load existing trip data if a tripId was passed in state.
  // Runs once when the component mounts or when app/tripIdFromState changes.
  useEffect(() => {
    const loadExistingTrip = async () => {
      // Only load if we have the app instance and a tripId
      if (!app || !tripIdFromState) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Access the 'trip' store and 'Form' collection from RADFish
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        // Find the trip by its ID in IndexedDB
        const trips = await Form.find({ id: tripIdFromState });

        if (trips.length > 0) {
          // If trip found, populate the form state with its data
          const currentTrip = trips[0];
          setCurrentTripId(currentTrip.id);
          const formattedDate = formatToYYYYMMDD(currentTrip.tripDate || "");
          setFormData({
            tripDate: formattedDate,
            startWeather: currentTrip.startWeather || "",
            startTime: currentTrip.startTime || "",
          });
        } else {
          // If trip not found (e.g., invalid ID passed), treat as a new trip
          console.warn(`Trip with ID ${tripIdFromState} not found. Starting new trip form.`);
          setCurrentTripId(null);
          setFormData({ tripDate: "", startWeather: "", startTime: "" });
        }
      } catch (error) {
        // Handle errors during data fetching
        console.error("Error loading trip data:", error);
        setCurrentTripId(null); // Reset ID on error
      } finally {
        // Ensure loading indicator is turned off
        setIsLoading(false);
      }
    };

    loadExistingTrip();
  }, [app, tripIdFromState]); // Dependencies: re-run if app or tripId changes

  // --- Event Handlers ---
  // Handles changes for standard input fields (Select)
  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData(prevData => ({ ...prevData, [name]: value }));
      // Clear validation error for the field being edited
      if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
      }
    }
  };

  // Handles changes specifically for the USWDS DatePicker component
  const handleDateChange = (value) => {
    setFormData(prevData => ({ ...prevData, tripDate: value || "" }));
    if (errors.tripDate) {
      setErrors(prevErrors => ({ ...prevErrors, tripDate: undefined }));
    }
  };

  // Handles changes specifically for the USWDS TimePicker component
  const handleTimeChange = (time) => {
    // Assumes only one time picker, defaults name to 'startTime'
    setFormData(prevData => ({ ...prevData, startTime: time }));
    if (errors.startTime) {
      setErrors(prevErrors => ({ ...prevErrors, startTime: undefined }));
    }
  };

  // --- Validation ---
  // Simple required field validation
  const validateRequired = (value, fieldName) => {
    if (!value || String(value).trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    const dateError = validateRequired(formData.tripDate, FIELD_DATE);
    if (dateError) newErrors.tripDate = dateError;

    const weatherError = validateRequired(formData.startWeather, FIELD_START_WEATHER);
    if (weatherError) newErrors.startWeather = weatherError;

    const timeError = validateRequired(formData.startTime, FIELD_START_TIME);
    if (timeError) newErrors.startTime = timeError;

    return newErrors;
  };

  // --- Form Submission ---
  // Handles the form submission (saving data and navigating)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      try {
        let navigateToId = currentTripId;

      } catch (error) {
        console.error("Error saving trip data:", error, "Trip ID:", currentTripId);
      }
    }
  };

  // --- Render Logic ---
  // Show loading message while fetching data
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip...</div>;
  }

  // Render the form
  return (
    <>
      {/* Main content area using USWDS layout utilities */}
      <GridContainer className="padding-y-4 tablet:padding-x-0 tablet:width-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="width-full text-left">
              {/* --- Embedded Step Indicator --- */}
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

              {/* USWDS Form component */}
              <Form onSubmit={handleSubmit} large className="margin-top-3">

              </Form>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

      {/* Inline Footer using USWDS utilities */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        {/* Container for footer content, centered and max-width */}
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          {/* Back Button */}
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigate("/")} // Navigate to Home page
          >
            Back
          </Button>
          {/* Next Button */}
          <Button
            type="submit" // Triggers the Form's onSubmit
            className="width-full margin-left-2"
            onClick={handleSubmit} // Also call handleSubmit for direct click scenario
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default StartTrip;
