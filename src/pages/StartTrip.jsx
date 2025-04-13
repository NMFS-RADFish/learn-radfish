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
  Button
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";
import StepIndicator from "../components/StepIndicator";

// Utility to format a date string to YYYY-MM-DD
const formatToYYYYMMDD = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return ''; // Return empty for invalid input
  }

  try {
    const date = new Date(dateString);
    // Check if the date object is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string could not be parsed: ${dateString}`);
      return '';
    }
    // Format the valid date
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    // Catch unexpected errors during Date processing
    console.error(`Error formatting date string: ${dateString}`, error);
    return '';
  }
};

// Field name constants
const FIELD_DATE = "Trip date";
const FIELD_WEATHER = "Weather condition";
const FIELD_START_TIME = "Start time";

function StartTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripIdFromState = location.state?.tripId;
  const app = useApplication();

  // Form state
  const [formData, setFormData] = useState({
    tripDate: "",
    weather: "",
    startTime: "",
  });

  const [currentTripId, setCurrentTripId] = useState(tripIdFromState || null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(!!tripIdFromState);

  // Handle input changes
  const handleInputChange = (e) => {
    // Check if e is an event (from TextInput/Select) or a direct value (from TimePicker)
    if (e && e.target) {
      const { name, value } = e.target;

      // Update form data normally
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  // Handle date picker changes
  const handleDateChange = (value) => {
    setFormData({
      ...formData,
      tripDate: value || "",
    });

    // Clear error when user selects a date
    if (errors.tripDate) {
      setErrors({
        ...errors,
        tripDate: undefined,
      });
    }
  };

  // Handle time picker changes
  const handleTimeChange = (time, name = "startTime") => {
    setFormData({
      ...formData,
      [name]: time,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Validate a required field
  const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate trip date
    const dateError = validateRequired(formData.tripDate, FIELD_DATE);
    if (dateError) newErrors.tripDate = dateError;

    // Validate weather
    const weatherError = validateRequired(formData.weather, FIELD_WEATHER);
    if (weatherError) newErrors.weather = weatherError;

    // Validate start time
    const timeError = validateRequired(formData.startTime, FIELD_START_TIME);
    if (timeError) newErrors.startTime = timeError;

    return newErrors;
  };

  // Load existing trip data if tripId is present in location state
  useEffect(() => {
    const loadExistingTrip = async () => {
      if (!app || !tripIdFromState) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const trips = await Form.find({ id: tripIdFromState });

        if (trips.length > 0) {
          const currentTrip = trips[0];
          setCurrentTripId(currentTrip.id);
          const formattedDate = formatToYYYYMMDD(currentTrip.tripDate || "");
          setFormData({
            tripDate: formattedDate,
            weather: currentTrip.weather || "",
            startTime: currentTrip.startTime || "",
          });
        } else {
          console.warn(`Trip with ID ${tripIdFromState} not found in state. Starting new trip form.`);
          setCurrentTripId(null);
          setFormData({ tripDate: "", weather: "", startTime: "" });
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
        setCurrentTripId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingTrip();
  }, [app, tripIdFromState]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        let navigateToId = currentTripId;

        if (currentTripId) {
          // Update existing trip
          await Form.update(
            {
              id: currentTripId,
              tripDate: formData.tripDate,
              weather: formData.weather,
              startTime: formData.startTime,
              status: "in-progress",
              step: 2
            }
          );
        } else {
          // Create new trip
          const newTripId = crypto.randomUUID();
          await Form.create({
            id: newTripId,
            tripDate: formData.tripDate,
            weather: formData.weather,
            startTime: formData.startTime,
            step: 2, 
            status: "in-progress",
            endWeather: "",
            endTime: "",
          });
          navigateToId = newTripId;
          setCurrentTripId(newTripId); 
        }
        navigate(`/catch`, { state: { tripId: navigateToId } });
      } catch (error) {
        console.error("Error saving trip data:", error, "Trip ID:", currentTripId);
      }
    }
  };

  if (isLoading) {
    return <div className="page-content">Loading trip...</div>;
  }

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <StepIndicator />
          <Form onSubmit={handleSubmit} large className="form">
            {/* Trip Date */}
            <FormGroup error={submitted && errors.tripDate}>
              <Label
                htmlFor="tripDate"
                error={submitted && errors.tripDate}
                className="form-label"
              >
                Date<span className="text-secondary-vivid">*</span>
              </Label>
              <div className="usa-hint" id="appointment-date-hint">
                mm/dd/yyyy
              </div>
              <DatePicker
              
                id="tripDate"
                name="tripDate"
                defaultValue={formData.tripDate}
                onChange={handleDateChange}
                aria-describedby="tripDate-hint"
                className={
                  submitted && errors.tripDate
                    ? "usa-input--error error-input-field"
                    : ""
                }
              />
              <ErrorMessage
                id="tripDate-error-message"
                className="error-message"
              >
                {(submitted && errors.tripDate && errors.tripDate) || "\u00A0"}
              </ErrorMessage>
            </FormGroup>

            {/* Trip Start Time - Full Width */}
            <FormGroup error={submitted && errors.startTime}>
              <Label
                htmlFor="startTime"
                error={submitted && errors.startTime}
                className="form-label"
              >
                Time<span className="text-secondary-vivid">*</span>
              </Label>
              <TimePicker
                id="time"
                name="time"
                defaultValue={formData.startTime}
                onChange={(time) => handleTimeChange(time)}
                minTime="00:00"
                maxTime="23:30"
                step={15}
                validationStatus={
                  submitted && errors.startTime ? "error" : undefined
                }
                className={
                  submitted && errors.startTime
                    ? "usa-input--error error-input-field"
                    : ""
                }
                aria-describedby={
                  submitted && errors.startTime
                    ? "startTime-error-message"
                    : undefined
                }
              />
              <ErrorMessage
                id="startTime-error-message"
                className="error-message"
              >
                {(submitted && errors.startTime && errors.startTime) ||
                  "\u00A0"}
              </ErrorMessage>
            </FormGroup>

            {/* Weather Conditions Select - Full Width */}
            <FormGroup error={submitted && errors.weather}>
              <Label
                htmlFor="weather"
                error={submitted && errors.weather}
                className="form-label"
              >
                Weather<span className="text-secondary-vivid">*</span>
              </Label>
              <Select
                id="weather"
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                validationStatus={
                  submitted && errors.weather ? "error" : undefined
                }
                aria-describedby={
                  submitted && errors.weather
                    ? "weather-error-message"
                    : undefined
                }
              >
                <option value="">-Select-</option>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
              </Select>
              <ErrorMessage
                id="weather-error-message"
                className="error-message"
              >
                {(submitted && errors.weather && errors.weather) || "\u00A0"}
              </ErrorMessage>
            </FormGroup>
          </Form>
        </div>
      </div>

      {/* Inline Footer */}
      <footer className="sticky-footer">
        <div className="footer-content">
          <Button
            outline 
            type="button" 
            className="back-button" 
            onClick={() => navigate("/")}
          >
            Back
          </Button>
          <Button 
            type="submit" // Use submit to trigger form's onSubmit
            className="next-button"
            onClick={handleSubmit} // Call handleSubmit directly 
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default StartTrip;
