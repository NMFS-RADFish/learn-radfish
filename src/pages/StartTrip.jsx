import "../index.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
} from "@trussworks/react-uswds";
import Layout from "../components/Layout";
import { STORE_NAMES, COLLECTION_NAMES } from "../utils/constants";

// --- Component Definition ---
/**
 * StartTrip - First step in the trip recording workflow
 * - Basic form structure with no input fields yet
 * - Step indicator showing current progress
 * - Basic state management setup
 * - Foundation for form building exercises
 */
function StartTrip() {
  // --- Navigation ---
  // React Router navigation hook for programmatic routing
  const navigate = useNavigate();

  // --- State Management ---
  // Form data state
  const [tripData, setTripData] = useState({
    tripDate: "",
    startWeather: "",
    startTime: "",
  });

  // Trip state - used for defaultValue in form fields
  const [defaultTripData, setDefaultTripData] = useState(null);

  // --- Event Handlers ---
  /**
   * Handles text input and select changes
   * Updates form state with new values
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles time picker changes
   * TimePicker component passes time value directly
   */
  const handleTimeChange = (time) => {
    setTripData((prev) => ({ ...prev, startTime: time }));
  };

  /**
   * Handles date picker changes
   * DatePicker component passes date value directly
   */
  const handleDateChange = (date) => {
    setTripData((prev) => ({ ...prev, tripDate: date || "" }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  /**
   * Navigates back to the home page
   */
  const navigateHome = () => {
    navigate("/");
  };

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