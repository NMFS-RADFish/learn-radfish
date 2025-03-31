import "../index.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormGroup,
  ErrorMessage,
  TimePicker,
  Select,
  Label,
} from "@trussworks/react-uswds";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

// Field name constants
const FIELD_WEATHER = "Weather condition";
const FIELD_END_TIME = "End time";

function EndTrip() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    weather: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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
    const weatherError = validateRequired(formData.weather, FIELD_WEATHER);
    if (weatherError) newErrors.weather = weatherError;

    // Validate end time
    const timeError = validateRequired(formData.endTime, FIELD_END_TIME);
    if (timeError) newErrors.endTime = timeError;

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    // If no errors, save data and navigate to next page
    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement data storage here
      console.log("End trip data to be saved:", formData);
      navigate("/review");
    }
  };

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <StepIndicator />
          <Form onSubmit={handleSubmit} large className="form">
            {/* Weather Conditions Select */}
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
                  submitted && errors.endTime ? "usa-input--error error-input-field" : ""
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
          </Form>
        </div>
      </div>

      <Footer backPath="/catch" nextPath="/review" onNextClick={handleSubmit} />
    </>
  );
}

export default EndTrip;
