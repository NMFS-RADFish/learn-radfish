import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useApplication,
} from "@nmfs-radfish/react-radfish";
import {
  Button,
  StepIndicator,
  StepIndicatorStep,
  GridContainer,
  Grid,
} from "@trussworks/react-uswds";

function ReviewSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useApplication();

  // --- State ---
  // Stores the ID of the trip being reviewed, passed from the previous step
  const tripId = location.state?.tripId;
  // Stores the fetched trip data object
  const [trip, setTrip] = useState(null);
  // Stores the aggregated catch data (grouped by species) for display in the table
  const [aggregatedCatches, setAggregatedCatches] = useState([]);
  // Stores the catch data for API submission
  const [catches, setCatches] = useState([]);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  // Error state for data fetching issues
  const [error, setError] = useState(null);

  // --- Data Loading Effect ---
  // useEffect to load the trip data and associated catches when the component mounts
  // or when app instance or tripId changes.
  useEffect(() => {
    const loadTripData = async () => {
      setLoading(true);
      setError(null); // Reset error state on new load attempt

      // Guard clause: Ensure app and tripId are available before proceeding
      if (!app || !tripId) {
        console.warn(
          "App or Trip ID not available in state, cannot load review data.",
        );
        navigate("/"); // Redirect home if essential data is missing
        return;
      }

      try {

      } catch (err) {
        // Handle errors during data fetching
        console.error("Error loading trip data:", err);
        setError("Failed to load trip data");
        navigate("/"); // Redirect home on critical error
      } finally {
        // Ensure loading state is turned off regardless of outcome
        setLoading(false);
      }
    };

    loadTripData();
  }, [app, tripId, navigate]); // Dependencies for the effect

  // --- Helper Functions ---

  /**
   * Aggregates raw catch data by species.
   * Calculates total count, total weight, and average length for each species.
   * @param {Array} catchData - An array of catch objects from the RADFish store.
   * @returns {Array} An array of objects, each representing aggregated data for one species.
   */
  const aggregateCatchesBySpecies = (catchData) => {
    // Use a map to group catches by species
    const speciesMap = {};

    catchData.forEach((catchItem) => {
      // Initialize species entry if it doesn't exist
      if (!speciesMap[catchItem.species]) {
        speciesMap[catchItem.species] = {
          species: catchItem.species,
          weights: [],
          lengths: [],
          count: 0,
        };
      }
      // Add weight and length to arrays for calculation, increment count
      speciesMap[catchItem.species].weights.push(catchItem.weight || 0); // Default to 0 if null/undefined
      speciesMap[catchItem.species].lengths.push(catchItem.length || 0); // Default to 0 if null/undefined
      speciesMap[catchItem.species].count++;
    });

    // Calculate totals and averages for each species
    return Object.values(speciesMap).map((item) => {
      const totalWeight = item.weights.reduce((sum, val) => sum + val, 0);
      const totalLength = item.lengths.reduce((sum, val) => sum + val, 0);
      const avgLength = item.count > 0 ? totalLength / item.count : 0;

      return {
        species: item.species,
        totalWeight: totalWeight.toFixed(1), // Format to one decimal place
        avgLength: avgLength.toFixed(1), // Format to one decimal place
        count: item.count,
      };
    });
  };

  /**
   * Formats an ISO date string (or Date object) into MM/DD/YYYY format.
   * @param {string | Date} dateString - The date string or object to format.
   * @returns {string} The formatted date string, or "" if input is invalid.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if the date is valid after parsing
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString(); // Uses browser's locale
    } catch (e) {
      console.error("Error formatting date:", e);
      return ""; // Return empty string on formatting error
    }
  };

  /**
   * Formats a time string (HH:MM) from 24-hour format to 12-hour format with AM/PM.
   * @param {string} timeString - The time string in HH:MM format.
   * @returns {string} The formatted time string (e.g., "1:30 PM"), or "" if input is invalid.
   */
  const format24HourTo12Hour = (timeString) => {
    if (
      !timeString ||
      typeof timeString !== "string" ||
      !timeString.includes(":")
    )
      return "";

    try {
      // Parse hours and minutes
      const [hoursStr, minutesStr] = timeString.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr.padStart(2, "0"); // Ensure minutes are two digits

      // Validate parsed values
      if (isNaN(hours) || hours < 0 || hours > 23) return "";

      // Determine AM/PM
      const period = hours >= 12 ? "PM" : "AM";

      // Convert hours to 12-hour format
      hours = hours % 12;
      hours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12 AM/PM

      return `${hours}:${minutes} ${period}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return ""; // Return empty string on formatting error
    }
  };

  // --- Event Handlers ---

  /**
   * Handles the final submission of the trip.
   * Updates the trip status in RADFish based on online/offline state.
   * Navigates to the appropriate confirmation page.
   */
  const handleSubmit = async () => {
    if (!trip) return; // Guard clause if trip data isn't loaded

    const tripStore = app.stores["trip"];
    const Form = tripStore.getCollection("Form");
  };

  // --- Dynamic Footer Logic ---

  /**
   * Determines the properties for the footer buttons (Back, Next/Submit/Save)
   * based on the current trip status and online/offline state.
   * @returns {object} An object containing props for the footer buttons.
   */
  const getFooterProps = () => {
    // Default props
    const defaultProps = {
      showBackButton: true,
      showNextButton: true,
      backPath: "/",
      backNavState: {},
      nextLabel: "Submit",
      onNextClick: handleSubmit,
      nextButtonProps: {},
    };

    if (!trip) {
      // If trip data hasn't loaded, hide buttons
      return { ...defaultProps, showBackButton: false, showNextButton: false };
    }

    // Customize based on trip status
    if (trip.status === "submitted") {
      // If already submitted, only show Back button navigating to Home
      return {
        ...defaultProps,
        backPath: "/",
        showNextButton: false,
      };
    } else {
      defaultProps.backPath = `/end`; // Back goes to EndTrip page
      defaultProps.backNavState = { state: { tripId: tripId } }; // Pass tripId back

      return defaultProps;
    }
  };

  // --- Render Logic ---

  // Display loading indicator
  if (loading) {
    return <div className="padding-5 text-center">Loading review data...</div>;
  }

  // Display error message if fetching failed
  if (error) {
    return (
      <div className="padding-5 text-center text-error">Error: {error}</div>
    );
  }

  // Display message if trip data is unexpectedly missing after loading
  if (!trip) {
    return (
      <div className="padding-5 text-center">Trip data not available.</div>
    );
  }

  // Get dynamic footer button properties
  const footerProps = getFooterProps();

  return (
    <>
      {/* Main content area */}
      <GridContainer className="padding-y-4 tablet:padding-x-0 tablet:width-mobile-lg">
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
                <StepIndicatorStep label="End Trip" status="complete" />
                <StepIndicatorStep label="Review and Submit" status="current" />
              </StepIndicator>
            </div>

            {/* Trip info card - consolidated from start and end trip */}
            {/* Using USWDS utility classes for card styling */}
            <div className="bg-white border border-base-lighter radius-md shadow-2 margin-y-4 maxw-full overflow-hidden">
              {/* Card Header */}
              <div className="bg-primary-darker padding-y-1 padding-x-2">
                <h3 className="margin-0 font-sans-lg text-semibold text-white text-center">
                  Trip Summary
                </h3>
              </div>
              {/* Card Body */}
              <div className="padding-2 display-flex flex-column gap-2">
                {/* Date Row */}
                <div className="display-flex flex-align-center gap-1">
                  <div className="width-10 text-bold font-sans-xs">Date</div>
                  <span className="text-base-dark font-sans-sm">
                    {formatDate(trip.tripDate)}
                  </span>
                </div>
                {/* Weather Row */}
                <div className="display-flex flex-align-center gap-1">
                  <div className="width-10 text-bold font-sans-xs">Weather</div>
                  <div className="display-flex flex-align-center">
                    <span className="text-base-dark font-sans-sm">
                      {trip.startWeather}
                    </span>
                    <span className="margin-x-1 text-base-dark">→</span>
                    <span className="text-base-dark font-sans-sm">
                      {trip.endWeather}
                    </span>
                  </div>
                </div>
                {/* Time Row */}
                <div className="display-flex flex-align-center gap-1">
                  <div className="width-10 text-bold font-sans-xs">Time</div>
                  <div className="display-flex flex-align-center">
                    <span className="text-base-dark font-sans-sm">
                      {format24HourTo12Hour(trip.startTime)}
                    </span>
                    <span className="margin-x-1 text-base-dark">→</span>
                    <span className="text-base-dark font-sans-sm">
                      {format24HourTo12Hour(trip.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aggregated Catch Data Card */}
            {/* Using USWDS utility classes for card styling */}
            <div className="bg-white border border-base-lighter radius-md shadow-2 margin-y-4 maxw-full overflow-hidden">
              {/* Card Header */}
              <div className="bg-primary-darker padding-y-1 padding-x-2">
                <h3 className="margin-0 font-sans-lg text-semibold text-white text-center">
                  Aggregate Catches
                </h3>
              </div>
              <div className="padding-0">
                {aggregatedCatches.length > 0 ? (
                  // RADFish Table component for displaying aggregated catches
                  <></>
                ) : (
                  // Display message if no catches were recorded
                  <p className="padding-2 text-base-dark">
                    No catches recorded for this trip.
                  </p>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

      {/* Sticky Footer with dynamic buttons */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          {/* Conditionally render Back button */}
          {footerProps.showBackButton && (
            <Button
              outline
              type="button"
              // Adjust width based on whether the Next button is also shown
              className={
                footerProps.showNextButton
                  ? "width-card-lg bg-white"
                  : "width-full bg-white"
              }
              onClick={() =>
                navigate(footerProps.backPath, footerProps.backNavState)
              }
            >
              Back
            </Button>
          )}
          {/* Conditionally render Next/Submit/Save button */}
          {footerProps.showNextButton && (
            <Button
              type="button"
              // Apply conditional width/margin and any specific button styles (like success)
              className={`${footerProps.showBackButton ? "width-full margin-left-2" : "width-full"} ${footerProps.nextButtonProps.className || ""}`}
              onClick={footerProps.onNextClick}
            >
              {footerProps.nextLabel}
            </Button>
          )}
        </div>
      </footer>
    </>
  );
}

export default ReviewSubmit;