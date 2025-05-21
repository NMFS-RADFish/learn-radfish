import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  FormGroup,
  ErrorMessage,
  TimePicker,
  Select,
  Label,
  DatePicker,
  Button,
  StepIndicator,
  StepIndicatorStep,
  GridContainer,
  Grid,
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";

// Utility to format a date string to YYYY-MM-DD for the DatePicker default value
const formatToYYYYMMDD = (dateString) => {
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

// Constants for field names used in validation messages
const FIELD_DATE = "Trip date";
const FIELD_WEATHER = "Weather condition";
const FIELD_START_TIME = "Start time";

/**
 * StartTrip Component
 *
 * This component handles the first step of logging a fishing trip:
 * entering the date, start time, and weather conditions.
 * It demonstrates:
 *  - Using React Hooks (useState, useEffect) for form state and side effects.
 *  - Using React Router Hooks (useNavigate, useLocation) for navigation and state passing.
 *  - Using RADFish Hooks (useApplication) to interact with the RADFish instance.
 *  - Basic form validation.
 *  - Creating or updating trip data in RADFish IndexedDB store.
 *  - Using USWDS React components for the form UI.
 */
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
    weather: "",
    startTime: "",
  });
  // useState hook to store the ID of the trip being edited, if any.
  const [currentTripId, setCurrentTripId] = useState(tripIdFromState || null);
  // useState hook to store validation errors for form fields.
  const [errors, setErrors] = useState({});
  // useState hook to track if the form has been submitted (to trigger error display).
  const [submitted, setSubmitted] = useState(false);
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
            weather: currentTrip.weather || "",
            startTime: currentTrip.startTime || "",
          });
        } else {
          // If trip not found (e.g., invalid ID passed), treat as a new trip
          console.warn(
            `Trip with ID ${tripIdFromState} not found. Starting new trip form.`,
          );
          setCurrentTripId(null);
          setFormData({ tripDate: "", weather: "", startTime: "" });
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
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      // Clear validation error for the field being edited
      if (errors[name]) {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
      }
    }
  };

  // Handles changes specifically for the USWDS DatePicker component
  const handleDateChange = (value) => {
    setFormData((prevData) => ({ ...prevData, tripDate: value || "" }));
    if (errors.tripDate) {
      setErrors((prevErrors) => ({ ...prevErrors, tripDate: undefined }));
    }
  };

  // Handles changes specifically for the USWDS TimePicker component
  const handleTimeChange = (time) => {
    // Assumes only one time picker, defaults name to 'startTime'
    setFormData((prevData) => ({ ...prevData, startTime: time }));
    if (errors.startTime) {
      setErrors((prevErrors) => ({ ...prevErrors, startTime: undefined }));
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

  // Validates all fields in the form
  const validateForm = () => {
    const newErrors = {};
    const dateError = validateRequired(formData.tripDate, FIELD_DATE);
    if (dateError) newErrors.tripDate = dateError;

    const weatherError = validateRequired(formData.weather, FIELD_WEATHER);
    if (weatherError) newErrors.weather = weatherError;

    const timeError = validateRequired(formData.startTime, FIELD_START_TIME);
    if (timeError) newErrors.startTime = timeError;

    return newErrors;
  };

  // --- Form Submission ---
  // Handles the form submission (saving data and navigating)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setSubmitted(true); // Mark form as submitted to show errors

    const newErrors = validateForm();
    setErrors(newErrors);

    // Proceed only if validation passes
    if (Object.keys(newErrors).length === 0) {
      try {
        // Access RADFish store and collection
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        let navigateToId = currentTripId;

        // Prepare data to be saved
        const tripData = {
          tripDate: formData.tripDate,
          weather: formData.weather,
          startTime: formData.startTime,
          status: "in-progress", // Set status for new/updated trip
          step: 2, // Update step number
        };

        if (currentTripId) {
          // --- Update existing trip ---
          // Merge existing ID with new data and update in IndexedDB
          await Form.update({ id: currentTripId, ...tripData });
        } else {
          // --- Create new trip ---
          const newTripId = crypto.randomUUID(); // Generate a unique ID
          // Add ID to data and create new record in IndexedDB
          await Form.create({
            id: newTripId,
            ...tripData,
            endWeather: "",
            endTime: "",
          });
          navigateToId = newTripId; // Store the new ID for navigation
          setCurrentTripId(newTripId); // Update state with the new ID
        }
        // Navigate to the next step (CatchLog), passing the tripId via state
        navigate(`/catch`, { state: { tripId: navigateToId } });
      } catch (error) {
        console.error(
          "Error saving trip data:",
          error,
          "Trip ID:",
          currentTripId,
        );
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
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            {/* Container to constrain width on larger screens */}
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
                {/* Trip Date - USWDS DatePicker */}
                {/* FormGroup adds spacing and connects label/input/error */}
                <FormGroup error={submitted && errors.tripDate}>
                  {/* Label with required indicator */}
                  <Label
                    htmlFor="tripDate"
                    error={submitted && errors.tripDate}
                  >
                    Date
                    <span className="text-secondary-vivid margin-left-05">
                      *
                    </span>
                  </Label>
                  {/* Hint text for date format */}
                  <div className="usa-hint" id="tripDate-hint">
                    mm/dd/yyyy
                  </div>
                  <DatePicker
                    id="tripDate"
                    name="tripDate"
                    defaultValue={formData.tripDate} // Use formatted date for default
                    onChange={handleDateChange} // Use specific handler
                    aria-describedby="tripDate-hint"
                    // Apply error styling if submitted and error exists
                    className={
                      submitted && errors.tripDate ? "usa-input--error" : ""
                    }
                  />
                  {/* Error message displayed below input */}
                  <ErrorMessage id="tripDate-error-message">
                    {(submitted && errors.tripDate) || "\u00A0"}{" "}
                    {/* Non-breaking space for layout */}
                  </ErrorMessage>
                </FormGroup>

                {/* Trip Start Time - USWDS TimePicker */}
                <FormGroup error={submitted && errors.startTime}>
                  <Label
                    htmlFor="startTime"
                    error={submitted && errors.startTime}
                  >
                    Time
                    <span className="text-secondary-vivid margin-left-05">
                      *
                    </span>
                  </Label>
                  <TimePicker
                    id="time"
                    name="time"
                    defaultValue={formData.startTime}
                    onChange={handleTimeChange} // Use specific handler
                    minTime="00:00"
                    maxTime="23:30"
                    step={15}
                    validationStatus={
                      submitted && errors.startTime ? "error" : undefined
                    }
                    className={
                      submitted && errors.startTime ? "usa-input--error" : ""
                    }
                    aria-describedby="startTime-error-message"
                  />
                  <ErrorMessage id="startTime-error-message">
                    {(submitted && errors.startTime) || "\u00A0"}
                  </ErrorMessage>
                </FormGroup>

                {/* Weather Conditions - USWDS Select */}
                <FormGroup error={submitted && errors.weather}>
                  <Label htmlFor="weather" error={submitted && errors.weather}>
                    Weather
                    <span className="text-secondary-vivid margin-left-05">
                      *
                    </span>
                  </Label>
                  <Select
                    id="weather"
                    name="weather"
                    value={formData.weather}
                    onChange={handleInputChange} // Standard handler works here
                    validationStatus={
                      submitted && errors.weather ? "error" : undefined
                    }
                    aria-describedby="weather-error-message"
                  >
                    <option value="">-Select-</option>
                    <option value="Sunny">Sunny</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rainy">Rainy</option>
                  </Select>
                  <ErrorMessage id="weather-error-message">
                    {(submitted && errors.weather) || "\u00A0"}
                  </ErrorMessage>
                </FormGroup>
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
