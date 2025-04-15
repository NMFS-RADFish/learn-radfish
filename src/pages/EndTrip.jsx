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
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";
import StepIndicator from "../components/StepIndicator";

// Field name constants
const FIELD_WEATHER = "Weather condition";
const FIELD_END_TIME = "End time";

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
    setErrors(newErrors);

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

  if (isLoading) {
    return <div className="page-content">Loading trip end details...</div>;
  }

  return (
    <>
      <div className="display-flex flex-column flex-align-center padding-y-4 padding-x-2 text-center">
        <div className="width-full maxw-mobile-lg">
          <StepIndicator />
          <Form onSubmit={handleSubmit} large className="form">
            {/* Trip End Time */}
            <FormGroup error={submitted && errors.endTime}>
              <Label
                htmlFor="endTime"
                error={submitted && errors.endTime}
                className="form-label"
              >
                Time<span className="text-secondary-vivid">*</span>
              </Label>
              <TimePicker
                id="time"
                name="time"
                defaultValue={formData.endTime}
                onChange={(time) => handleTimeChange(time)}
                minTime="00:00"
                maxTime="23:30"
                step={15}
                validationStatus={
                  submitted && errors.endTime ? "error" : undefined
                }
                className={
                  submitted && errors.endTime
                    ? "usa-input--error error-input-field"
                    : ""
                }
                aria-describedby={
                  submitted && errors.endTime
                    ? "endTime-error-message"
                    : undefined
                }
              />
              <ErrorMessage
                id="endTime-error-message"
                className="error-message"
              >
                {(submitted && errors.endTime && errors.endTime) || "\u00A0"}
              </ErrorMessage>
            </FormGroup>

            {/* Weather Conditions Select */}
            <FormGroup error={submitted && errors.endWeather}>
              <Label
                htmlFor="endWeather"
                error={submitted && errors.endWeather}
                className="form-label"
              >
                Weather<span className="text-secondary-vivid">*</span>
              </Label>
              <Select
                id="endWeather"
                name="endWeather"
                value={formData.endWeather}
                onChange={handleInputChange}
                validationStatus={
                  submitted && errors.endWeather ? "error" : undefined
                }
                aria-describedby={
                  submitted && errors.endWeather
                    ? "endWeather-error-message"
                    : undefined
                }
              >
                <option value="">-Select-</option>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
              </Select>
              <ErrorMessage
                id="endWeather-error-message"
                className="error-message"
              >
                {(submitted && errors.endWeather && errors.endWeather) ||
                  "\u00A0"}
              </ErrorMessage>
            </FormGroup>
          </Form>
        </div>
      </div>

      {/* Inline Footer */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-y-4 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto">
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
