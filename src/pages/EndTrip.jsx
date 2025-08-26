import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Label,
  Select,
  TimePicker,
} from "@trussworks/react-uswds";
import Layout from "../components/Layout";
import {
  validateRequired,
  FIELD_NAMES,
} from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

function EndTrip() {
  // --- RADFish Application Context ---
  const app = useApplication();

  // --- Custom Hooks ---
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();

  // --- State Management ---
  const [tripData, setTripData] = useState({
    endWeather: undefined,
    endTime: undefined,
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Track if form has been submitted to show errors
  const [submitted, setSubmitted] = useState(false);

  // --- Trip Data Management ---
  const { trip, isLoading, updateTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    }
  );

  // --- Effects ---
  useEffect(() => {
    if (trip) {
      setTripData({
        endWeather: trip.endWeather || "",
        endTime: trip.endTime || "",
      });
    }
  }, [trip]);

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTimeChange = (time) => {
    setTripData((prev) => ({ ...prev, endTime: time }));

    if (errors.endTime) {
      setErrors((prev) => ({ ...prev, endTime: "" }));
    }
  };

  // --- Validation ---
  const validateForm = (data) => {
    const newErrors = {};

    const timeError = validateRequired(data.endTime, FIELD_NAMES.END_TIME);
    if (timeError) newErrors.endTime = timeError;

    const weatherError = validateRequired(data.endWeather, FIELD_NAMES.END_WEATHER);
    if (weatherError) newErrors.endWeather = weatherError;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate all form fields
    const validationErrors = validateForm(tripData);
    setErrors(validationErrors);

    // Only proceed if no validation errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        const success = await updateTrip({
          ...tripData,
          status: "in-progress",
          step: 4
        });

        if (success) {
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
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip end details...</div>;
  }

  return (
    <>
      <Layout currentStep="End Trip">
        <Form onSubmit={handleSubmit} large className="margin-top-3">
          <FormGroup error={submitted && errors.endTime}>
            <Label
              htmlFor="endTime"
              error={submitted && errors.endTime}
              className="input-time-label"
              requiredMarker
            >
              End Time
            </Label>
            <TimePicker
              id="endTime"
              name="endTime"
              defaultValue={tripData.endTime}
              onChange={handleTimeChange}
              minTime="00:00"
              maxTime="23:45"
              step={15}
              className={submitted && errors.endTime ? "usa-input--error" : undefined}
              aria-describedby="end-time-hint end-time-error-message"
              required
            />
            <span id="end-time-hint" className="usa-sr-only">
              Please enter or select the time you finished fishing.
            </span>
            {submitted && errors.endTime && (
              <ErrorMessage id="end-time-error-message" className="font-sans-2xs">
                {errors.endTime}
              </ErrorMessage>
            )}
          </FormGroup>
          <FormGroup error={submitted && errors.endWeather}>
            <Label
              htmlFor="endWeather"
              error={submitted && errors.endWeather}
              requiredMarker
            >
              End Weather
            </Label>
            <Select
              id="endWeather"
              name="endWeather"
              value={tripData.endWeather}
              onChange={handleInputChange}
              validationStatus={submitted && errors.endWeather ? "error" : undefined}
              aria-describedby="end-weather-hint end-weather-error-message"
              required
            >
              <option value="">-Select-</option>
              <option value="Sunny">Sunny</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
            </Select>
            <span id="end-weather-hint" className="usa-sr-only">
              Please select the weather conditions at the end of your fishing trip.
            </span>
            {submitted && errors.endWeather && (
              <ErrorMessage id="end-weather-error-message" className="font-sans-2xs">
                {errors.endWeather}
              </ErrorMessage>
            )}
          </FormGroup>
        </Form>
      </Layout>

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