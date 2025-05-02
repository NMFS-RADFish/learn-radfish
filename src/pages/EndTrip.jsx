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
  Button,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";

// Field name constants
const FIELD_WEATHER = "Weather condition";
const FIELD_END_TIME = "End time";

/**
 * EndTrip Component
 *
 * Handles the third step of logging a fishing trip:
 * entering the end time and weather conditions.
 */
function EndTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripId = location.state?.tripId;
  const app = useApplication();

  // Form state - naming to match schema field names
  const [formData, setFormData] = useState({
    endWeather: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing trip data based on state tripId
  useEffect(() => {
    const loadExistingTrip = async () => {
      setIsLoading(true);
      if (!app || !tripId) {
        console.warn(
          "App or Trip ID not available in state, cannot load end trip data.",
        );
        navigate("/");
        return;
      }

      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const trips = await Form.find({ id: tripId });

        if (trips.length === 0) {
          console.warn(
            `Trip with ID ${tripId} not found, redirecting to home.`,
          );
          navigate("/");
          return;
        }

        const currentTrip = trips[0];
        setFormData({
          endWeather: currentTrip.endWeather || "",
          endTime: currentTrip.endTime || "",
        });
      } catch (error) {
        console.error("Error loading trip data:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingTrip();
  }, [app, tripId, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;

      // Update form data
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

  // Handle time picker changes
  const handleTimeChange = (time, name = "endTime") => {
    setFormData({
      ...formData,
      [name]: time,
    });

    // Clear error when user selects time
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

    // Validate weather
    const weatherError = validateRequired(formData.endWeather, FIELD_WEATHER);
    if (weatherError) newErrors.endWeather = weatherError;

    // Validate end time
    const timeError = validateRequired(formData.endTime, FIELD_END_TIME);
    if (timeError) newErrors.endTime = timeError;

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateForm();
    /* [Lesson 5.19:START] Set validation errors */
    setErrors(newErrors);
    /* [Lesson 5.19:END] */

    if (Object.keys(newErrors).length === 0 && tripId) {
      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");

        await Form.update({
          id: tripId,
          endWeather: formData.endWeather,
          endTime: formData.endTime,
          status: "in-progress",
          step: 4,
        });
        navigate(`/review`, { state: { tripId: tripId } });
      } catch (error) {
        console.error("Error saving end trip data:", error);
      }
    } else {
      console.warn(
        "Not proceeding with update due to errors or missing trip ID in state",
      );
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip end details...</div>;
  }

  return (
    <>
      <div className="display-flex flex-column flex-align-center padding-y-4 padding-x-2">
        <div className="width-full maxw-mobile-lg text-left">
          
          {/* --- Embedded Step Indicator --- */}
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

          <Form onSubmit={handleSubmit} large className="margin-top-3">
            {/* Trip End Time */}
            <FormGroup error={submitted && errors.endTime}>
              <Label htmlFor="endTime" error={submitted && errors.endTime}>
                Time<span className="text-secondary-vivid margin-left-05">*</span>
              </Label>
              <TimePicker
                id="time"
                name="time"
                defaultValue={formData.endTime}
                onChange={(time) => handleTimeChange(time)}
                minTime="00:00"
                maxTime="23:30"
                step={15}
                validationStatus={submitted && errors.endTime ? "error" : undefined}
                className={submitted && errors.endTime ? "usa-input--error" : ""}
                aria-describedby="endTime-error-message"
              />
              {/* [Lesson 5.20:START] Display End Time Error */}
              <ErrorMessage id="endTime-error-message">
                {(submitted && errors.endTime) || "\u00A0"}
              </ErrorMessage>
              {/* [Lesson 5.20:END] */}
            </FormGroup>

            {/* Weather Conditions Select */}
            <FormGroup error={submitted && errors.endWeather}>
              <Label htmlFor="endWeather" error={submitted && errors.endWeather}>
                Weather<span className="text-secondary-vivid margin-left-05">*</span>
              </Label>
              <Select
                id="endWeather"
                name="endWeather"
                value={formData.endWeather}
                onChange={handleInputChange}
                validationStatus={submitted && errors.endWeather ? "error" : undefined}
                aria-describedby="endWeather-error-message"
              >
                <option value="">-Select-</option>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
              </Select>
              {/* [Lesson 5.21:START] Display End Weather Error */}
              <ErrorMessage id="endWeather-error-message">
                {(submitted && errors.endWeather) || "\u00A0"}
              </ErrorMessage>
              {/* [Lesson 5.21:END] */}
            </FormGroup>
          </Form>
        </div>
      </div>

      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigate("/catch", { state: { tripId: tripId } })}
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
