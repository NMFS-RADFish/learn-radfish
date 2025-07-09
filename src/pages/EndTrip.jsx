import "../index.css";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  Form,
  Grid,
  GridContainer,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";
import { validateRequired, FIELD_NAMES } from "../utils/validation";

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

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate weather
    const weatherError = validateRequired(formData.endWeather, FIELD_NAMES.END_WEATHER);
    if (weatherError) newErrors.endWeather = weatherError;

    // Validate end time
    const timeError = validateRequired(formData.endTime, FIELD_NAMES.END_TIME);
    if (timeError) newErrors.endTime = timeError;

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

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
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
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

              {/* Weather Conditions Select */}
            </Form>
          </Grid>
        </Grid>
      </GridContainer>

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
