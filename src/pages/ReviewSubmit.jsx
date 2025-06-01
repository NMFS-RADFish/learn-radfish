import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useApplication,
  Table,
  useOfflineStatus,
} from "@nmfs-radfish/react-radfish";
import {
  Button,
  StepIndicator,
  StepIndicatorStep,
  GridContainer,
  Grid,
} from "@trussworks/react-uswds";

/**
 * ReviewSubmit Component
 *
 * This component represents the final step (Step 4) in the trip logging process.
 * It displays a summary of the entire trip, including:
 *  - Start/End date, time, and weather.
 *  - Aggregated catch data (total count, total weight, average length per species).
 * It allows the user to review all entered information before submitting the trip.
 * The submission behavior adapts based on the user's online/offline status.
 *
 * Demonstrates:
 *  - Fetching related data (trip details and associated catches) from RADFish stores.
 *  - Data aggregation and formatting for display.
 *  - Conditional logic based on offline status (`useOfflineStatus`).
 *  - Updating a record's status in RADFish (`Form.update`).
 *  - Navigating to different confirmation pages based on submission outcome.
 *  - Using the RADFish `Table` component.
 */
function ReviewSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useApplication();
  const { isOffline } = useOfflineStatus();

  // --- State ---
  // Stores the ID of the trip being reviewed, passed from the previous step
  const tripId = location.state?.tripId;
  // Stores the fetched trip data object
  const [trip, setTrip] = useState(null);
  // Stores the aggregated catch data (grouped by species) for display in the table
  const [aggregatedCatches, setAggregatedCatches] = useState([]);
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
        // Access RADFish collections
        /* [Lesson 6.1:START] Access RADFish stores and fetch trip/catch data */
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const Catch = tripStore.getCollection("Catch");

        // Fetch the trip details
        const trips = await Form.find({ id: tripId });

        // Handle trip not found
        if (trips.length === 0) {
          setError(`Trip with ID ${tripId} not found`);
          navigate("/"); // Redirect home if trip doesn't exist
          return;
        }

        const selectedTrip = trips[0];
        setTrip(selectedTrip); // Store fetched trip data in state

        // Fetch all catches associated with this trip
        const tripCatches = await Catch.find({ tripId: selectedTrip.id });
        /* [Lesson 6.1:END] */

        // Aggregate catch data for the summary table
        /* [Lesson 6.2:START] Call the aggregation function */
        const aggregatedData = aggregateCatchesBySpecies(tripCatches);
        setAggregatedCatches(aggregatedData);
        /* [Lesson 6.2:END] */
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
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return "";

    try {
      // Parse hours and minutes
      const [hoursStr, minutesStr] = timeString.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr.padStart(2, '0'); // Ensure minutes are two digits

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

    try {
      const tripStore = app.stores["trip"];
      const Form = tripStore.getCollection("Form");
      // Determine final status: "submitted" if online, "Not Submitted" if offline
      const finalStatus = isOffline ? "Not Submitted" : "submitted";

      // Update the trip record in RADFish/IndexedDB
      await Form.update({
        id: trip.id,
        status: finalStatus,
        step: 4, // Mark as completed step 4 (review)
      });

      // Navigate to the relevant confirmation screen
      navigate(isOffline ? "/offline-confirm" : "/online-confirm");
    } catch (error) {
      console.error("Error submitting trip:", error);
      // Consider adding user feedback here (e.g., using a toast notification)
      setError("Failed to submit trip. Please try again.");
    }
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

      if (isOffline) {
        // If offline, label the button "Save"
        defaultProps.nextLabel = "Save";
        // Keep default button style
      } else {
        // If online, label the button "Submit" and use success style
        defaultProps.nextLabel = "Submit";
        // Apply the custom success style defined in index.css
        defaultProps.nextButtonProps = { className: "bg-green hover:bg-green" };
      }
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
    return <div className="padding-5 text-center text-error">Error: {error}</div>;
  }

  // Display message if trip data is unexpectedly missing after loading
  if (!trip) {
    return <div className="padding-5 text-center">Trip data not available.</div>;
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
                      {trip.weather}
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
                  <Table
                    // Map aggregated data to the format expected by the Table component
                    data={aggregatedCatches.map((item, index) => ({
                      id: index, // Use index as ID for the table row
                      species: item.species,
                      count: item.count,
                      totalWeight: `${item.totalWeight} lbs`, // Add units
                      avgLength: `${item.avgLength} in`, // Add units
                    }))}
                    // Define table columns: key corresponds to data keys, label is header text
                    columns={[
                      { key: "species", label: "Species", sortable: true },
                      { key: "count", label: "Count", sortable: true },
                      {
                        key: "totalWeight",
                        label: "Total Weight",
                        sortable: true,
                      },
                      {
                        key: "avgLength",
                        label: "Avg. Length",
                        sortable: true,
                      },
                    ]}
                    // Enable striped rows for better readability
                    striped
                  />
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
              className={footerProps.showNextButton ? "width-card-lg bg-white" : "width-full bg-white"}
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


