import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  DatePicker,
  Form,
  FormGroup,
  Label,
  Select,
  TimePicker,
} from "@trussworks/react-uswds";
import Layout from "../components/Layout";
import { STORE_NAMES, COLLECTION_NAMES } from "../utils";

function StartTrip() {
  const navigate = useNavigate();
  const app = useApplication();
  const location = useLocation();
  const tripId = location.state?.tripId;

  // --- State Management ---
  // Form data state
  const [tripData, setTripData] = useState({
    tripDate: undefined,
    startWeather: undefined,
    startTime: undefined,
  });

  // Validation errors state - stores field-specific error messages
  const [errors, setErrors] = useState({});

  // Track if form has been submitted to show errors
  const [submitted, setSubmitted] = useState(false);

  // Loading state - used to show loading message while fetching trip data
  const [isLoading, setIsLoading] = useState(false);

  // Load existing trip data if editing
  useEffect(() => {
    const loadExistingTrip = async () => {
      // Only load if we have the app instance and a tripId
      if (!app || !tripId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Direct access to RADFish stores and collections
        const tripStore = app.stores[STORE_NAMES.TRIP_STORE];
        const tripCollection = tripStore.getCollection(COLLECTION_NAMES.TRIP_COLLECTION);

        // Find trips matching this ID
        const existingTripsData = await tripCollection.find({ id: tripId });

        if (existingTripsData.length > 0) {
          const tripData = existingTripsData[0];

          // Format date for DatePicker compatibility (YYYY-MM-DD)
          const formattedDate = tripData.tripDate ? 
            new Date(tripData.tripDate).toISOString().split('T')[0] : "";

          setTripData({
            tripDate: formattedDate,
            startWeather: tripData.startWeather || "",
            startTime: tripData.startTime || "",
          });
        } else {
          // If trip not found, treat as new trip
          console.warn(`Trip with ID ${tripId} not found. Starting new trip form.`);
          setTripData({ tripDate: "", startWeather: "", startTime: "" });
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
      } finally {
        // Ensure loading indicator is turned off
        setIsLoading(false);
      }
    };

    loadExistingTrip();
  }, [tripId, app]);

  // --- Event Handlers ---
  /**
   * Handles text input and select changes
   * Updates form state with new values
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Handles time picker changes
   * TimePicker component passes time value directly
   */
  const handleTimeChange = (time) => {
    setTripData((prev) => ({ ...prev, startTime: time }));

    if (errors.startTime) {
      setErrors((prev) => ({ ...prev, startTime: "" }));
    }
  };

  /**
   * Handles date picker changes
   * DatePicker component passes date value directly
   */
  const handleDateChange = (date) => {
    setTripData((prev) => ({ ...prev, tripDate: date || "" }));

    if (errors.tripDate) {
      setErrors((prev) => ({ ...prev, tripDate: "" }));
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tripStore = app.stores[STORE_NAMES.TRIP_STORE];
      const tripCollection = tripStore.getCollection(COLLECTION_NAMES.TRIP_COLLECTION);

      const tripDataToSave = {
        tripDate: tripData.tripDate,
        startWeather: tripData.startWeather,
        startTime: tripData.startTime,
        status: "in-progress",
        step: 2,
      };

      let navigateToId = tripId;

      if (tripId) {
        await tripCollection.update({ id: tripId, ...tripDataToSave });
      } else {
        const newTripId = crypto.randomUUID();
        await tripCollection.create({
          id: newTripId,
          ...tripDataToSave,
        });
        navigateToId = newTripId;
      }
      navigateWithTripId("/catch", navigateToId);
    } catch (error) {
      console.error("Error saving trip data:", error, "Trip ID:", tripId);
    }
  };

  /**
   * Navigates back to the home page
   */
  const navigateHome = () => {
    navigate("/");
  };

  // Helper to pass tripId between pages in our multi-step form
  const navigateWithTripId = (path, tripId) => {
    navigate(path, { state: { tripId } });
  };

  // Show loading state while fetching existing trip data
  if (isLoading && tripId) {
    return (
      <Layout currentStep="Start Trip">
        <div className="padding-5 text-center">Loading trip data...</div>
      </Layout>
    );
  }

  return (
    <>
      <Layout currentStep="Start Trip">
        <Form onSubmit={handleSubmit} large className="margin-top-3">
          <FormGroup>
            <Label
              htmlFor="tripDate"
              hint=" mm/dd/yyyy"
              className="input-date-label"
              requiredMarker
            >
              Date
            </Label>
            <DatePicker
              id="tripDate"
              name="tripDate"
              defaultValue={tripData.tripDate}
              onChange={handleDateChange}
              aria-describedby="trip-date-hint"
              required
            />
            <span id="trip-date-hint" className="usa-sr-only">
              Please enter or select the date of your fishing trip.
            </span>
          </FormGroup>
          <FormGroup>
            <Label
              htmlFor="startTime"
              className="input-time-label"
              requiredMarker
            >
              Time
            </Label>
            <TimePicker
              id="startTime"
              name="startTime"
              defaultValue={tripData.startTime}
              onChange={handleTimeChange}
              minTime="00:00"
              maxTime="23:45"
              step={15}
              aria-describedby="start-time-hint"
              required
            />
            <span id="start-time-hint" className="usa-sr-only">
              Please enter or select the time you started fishing.
            </span>
          </FormGroup>
          <FormGroup>
            <Label
              htmlFor="startWeather"
              requiredMarker
            >
              Weather
            </Label>
            <Select
              id="startWeather"
              name="startWeather"
              value={tripData.startWeather}
              onChange={handleInputChange}
              aria-describedby="start-weather-hint"
              required
            >
              <option value="">-Select-</option>
              <option value="Sunny">Sunny</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
            </Select>
            <span id="start-weather-hint" className="usa-sr-only">
              Please select the weather conditions at the start of your fishing trip.
            </span>
          </FormGroup>
        </Form>
      </Layout>

      {/* --- Footer Navigation --- */}
      {/* Fixed footer with navigation buttons */}
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