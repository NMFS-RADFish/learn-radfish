import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormGroup,
  ErrorMessage,
  TimePicker,
  Select,
  Label,
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

// Field name constants
const FIELD_WEATHER = "Weather condition";
const FIELD_END_TIME = "End time";

function EndTrip() {
  const navigate = useNavigate();
  const app = useApplication();
  const [timeKey, setTimeKey] = useState(0); // Add key for TimePicker remounting

  // Form state - naming to match schema field names
  const [formData, setFormData] = useState({
    endWeather: "",
    endTime: "",
  });

  const [tripId, setTripId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Load existing trip data
  useEffect(() => {
    const loadExistingTrip = async () => {
      try {
        if (!app) return;

        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");

        // Get in-progress trips
        const existingTrips = await Form.find({ status: "in-progress" });

        if (existingTrips.length === 0) {
          console.warn("No in-progress trips found, redirecting to start trip page");
          navigate("/start");
          return;
        }

        // Use the first in-progress trip
        const currentTrip = existingTrips[0];
        setTripId(currentTrip.id);

        // Set form data from existing trip - using field names matching schema
        setFormData({
          endWeather: currentTrip.endWeather || "",
          endTime: currentTrip.endTime || "",
        });
        
        // Force remount of time picker to show saved value
        setTimeKey(prevKey => prevKey + 1);
      } catch (error) {
        console.error("Error loading trip data:", error);
      }
    };

    loadExistingTrip();
  }, [app, navigate]);

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

    // If no errors, save data and navigate to next page
    if (Object.keys(newErrors).length === 0 && tripId) {
      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");

        // Retrieve the trip to update
        const trips = await Form.find({ id: tripId });

        if (!trips || trips.length === 0) {
          console.error("Trip not found with ID:", tripId);
          return;
        }

        const tripToUpdate = trips[0];

        // Prepare update data and update trip
        // Set status to "in-progress" while the trip is being reviewed
        const updateData = {
          endWeather: formData.endWeather,
          endTime: formData.endTime,
          status: "in-progress",
          step: 4,
        };
        // Update trip
        await Form.update(
          {
            id: tripToUpdate.id,
            ...updateData
          }
        );
        navigate("/review");
      } catch (error) {
        console.error("Error saving end trip data:", error);
      }
    } else {
      console.warn(
        "Not proceeding with update due to errors or missing trip ID",
      );
    }
  };

  return (
    <>
      <div className="page-content">
        <div className="content-container">
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
                key={timeKey}
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

      <Footer backPath="/catch" nextPath="/review" onNextClick={handleSubmit} />
    </>
  );
}

export default EndTrip;
