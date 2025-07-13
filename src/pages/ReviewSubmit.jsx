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
import { formatDate, format24HourTo12Hour, aggregateCatchesBySpecies, STORE_NAMES, COLLECTION_NAMES } from "../utils";

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



  // --- Event Handlers ---

  /**
   * Handles the final submission of the trip.
   * Updates the trip status in RADFish based on online/offline state.
   * Navigates to the appropriate confirmation page.
   */
  const handleSubmit = async () => {
    if (!trip) return; // Guard clause if trip data isn't loaded

    const tripStore = app.stores[STORE_NAMES.TRIP];
    const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
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

      {/* --- Dynamic Navigation Footer --- */}
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