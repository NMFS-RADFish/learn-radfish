import "../index.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "@trussworks/react-uswds";
import Layout from "../components/Layout";

function StartTrip() {
  // --- Navigation ---
  // React Router navigation hook for programmatic routing
  const navigate = useNavigate();

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

  // Trip ID state - used to store the ID of the trip being edited
  const [tripId, setTripId] = useState(null);

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

    if (errors.startWeather) {
      setErrors((prev) => ({ ...prev, startWeather: "" }));
    }
  };

  /**
   * Navigates back to the home page
   */
  const navigateHome = () => {
    navigate("/");
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