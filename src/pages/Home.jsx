import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication, useOfflineStatus } from "@nmfs-radfish/react-radfish";
import { useNavigate } from "react-router-dom";
import { Button, GridContainer, Grid } from "@trussworks/react-uswds";
import {
  TRIP_STATUS,
  TRIP_STATUS_LABELS,
  STORE_NAMES,
  COLLECTION_NAMES,
  calculateTripStats,
  formatDate,
} from "../utils";

function HomePage() {
  // --- RADFish Application Context ---
  const app = useApplication();
  const { isOffline } = useOfflineStatus();

  // --- Navigation ---
  // React Router navigation hook for programmatic routing
  const navigate = useNavigate();

  // --- State Management ---
  // Trip list state - will be populated in later lessons
  const [trips, setTrips] = useState([]);
  // Trip statistics state
  const [tripStats, setTripStats] = useState({});
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Error state for error handling
  const [error, setError] = useState(null);

  // Load trips and catch data on component mount
  useEffect(() => {
    const loadTripsAndCatches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Ensure the RADFish app is available
        if (!app) {
          setIsLoading(false);
          return;
        }

        // Get collections from the trip store
        const tripStore = app.stores[STORE_NAMES.TRIP_STORE];
        const tripCollection = tripStore.getCollection(
          COLLECTION_NAMES.TRIP_COLLECTION,
        );
        const catchCollection = tripStore.getCollection(
          COLLECTION_NAMES.CATCH_COLLECTION,
        );

        // Fetch all trips
        const allTrips = await tripCollection.find({});

        // Sort trips by date (most recent first)
        const sortedTrips = [...allTrips].sort((a, b) => {
          if (!a.tripDate) return 1; // No date - put at bottom
          if (!b.tripDate) return -1;
          return new Date(b.tripDate) - new Date(a.tripDate);
        });

        setTrips(sortedTrips);

        // Calculate statistics for each trip
        const stats = {};

        // CatchCollection will be added in Lesson 4 - for now, gracefully handle if not present    
        if (catchCollection) {
          for (const trip of sortedTrips) {
            // Find all catches associated with this trip
            const tripCatches = await catchCollection.find({ tripId: trip.id });
            // Use the calculateTripStats function to get statistics
            stats[trip.id] = calculateTripStats(tripCatches);
          }
        }

        setTripStats(stats);
      } catch (error) {
        console.error("Error loading trips and catches:", error);
        setError("Failed to load trips. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTripsAndCatches();
  }, [app, isOffline]); // Re-run if app or offline status changes

  /**
   * Get human-readable status label based on trip status
   * @param {object} trip - Trip object
   * @return {string} Status label
   */
  const getStatusLabel = (trip) => {
    if (!trip || !trip.status) return TRIP_STATUS_LABELS.NOT_STARTED;

    if (trip.status === TRIP_STATUS.SUBMITTED)
      return TRIP_STATUS_LABELS.SUBMITTED;
    if (trip.status === TRIP_STATUS.IN_PROGRESS) {
      if (trip.step) {
        return `${TRIP_STATUS_LABELS.IN_PROGRESS}: ${trip.step}/4`;
      }
      return TRIP_STATUS_LABELS.IN_PROGRESS;
    }
    if (trip.status === TRIP_STATUS.NOT_SUBMITTED)
      return TRIP_STATUS_LABELS.READY_TO_SUBMIT;

    return TRIP_STATUS_LABELS.NOT_STARTED;
  };

  /**
   * Get appropriate CSS class for the trip header based on status
   * @param {object} trip - Trip object
   * @return {string} CSS class name
   */
  const getHeaderClass = (trip) => {
    if (!trip || !trip.status) return "bg-secondary";

    if (trip.status === TRIP_STATUS.SUBMITTED) return "bg-green"; // Green
    if (trip.status === TRIP_STATUS.IN_PROGRESS) return "bg-accent-warm"; // Orange
    if (trip.status === TRIP_STATUS.NOT_SUBMITTED) return "bg-primary-darker"; // Blue

    // Default to orange for any other status
    return "bg-accent-warm";
  };

  /**
   * Handle click on a trip card - navigate to appropriate page
   * @param {object} trip - Trip object
   */
  const handleTripClick = (trip) => {
    // Pass tripId via React Router state (not URL parameters)
    const destinationState = { state: { tripId: trip.id } };

    if (trip.status === TRIP_STATUS.SUBMITTED) {
      navigate(`/review`, destinationState);
    } else if (trip.status === TRIP_STATUS.IN_PROGRESS) {
      // Navigate based on the step for in-progress trips
      if (trip.step === 2) {
        navigate(`/catch`, destinationState);
      } else if (trip.step === 3) {
        navigate(`/end`, destinationState);
      } else if (trip.step === 4) {
        navigate(`/review`, destinationState);
      } else {
        // Default to start if step is missing or invalid
        navigate(`/start`, destinationState);
      }
    } else if (trip.status === TRIP_STATUS.NOT_SUBMITTED) {
      navigate(`/review`, destinationState);
    } else {
      navigate(`/start`, destinationState);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="padding-5 text-center">
        <p className="font-heading-lg">Loading trips...</p>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="padding-5 text-center">
        <p className="font-heading-lg text-error">{error}</p>
        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="margin-top-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main Content - Basic structure without USWDS grid components */}
      <GridContainer className="padding-y-4 padding-x-2 text-center">
        <Grid row>
          <Grid col="fill">
        <h1 className="font-heading-xl text-center margin-0">Hi, Captain</h1>
        <h2 className="font-heading-lg text-center margin-top-4 margin-bottom-2">
          Recent Trips
        </h2>

        <div className="width-full maxw-mobile-lg margin-x-auto margin-bottom-5">
          {trips.length === 0 ? (
            <div className="border-dashed border-base-lighter bg-base-lightest padding-2 width-full maxw-mobile-lg margin-y-2">
              <p className="text-base margin-0 text-center">
                No trips found. Start a new trip to record your fishing
                activity.
              </p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="display-flex flex-column width-full border-radius-md bg-white shadow-2 overflow-hidden margin-bottom-2 cursor-pointer hover:shadow-4 hover:transform-"
                onClick={() => handleTripClick(trip)}
              >
                <div
                  className={`display-flex flex-justify flex-align-center padding-y-2 padding-x-2 text-white radius-top-md ${getHeaderClass(trip)}`}
                >
                  <div className="text-white font-ui-md text-bold">
                    {formatDate(trip.tripDate)}
                  </div>
                  <div className="text-white font-ui-md text-bold">
                    {getStatusLabel(trip)}
                  </div>
                </div>

                <div className="padding-2 bg-white radius-bottom-md">
                  <Grid row>
                    <Grid
                      col={4}
                      className="display-flex flex-column padding-y-1 stat-grid-column"
                    >
                      <div className="font-ui-xs text-base-dark margin-bottom-1">
                        Fish Count
                      </div>
                      <div className="font-ui-lg text-bold">
                        {tripStats[trip.id]?.totalCount || 0}
                      </div>
                    </Grid>
                    <Grid
                      col={4}
                      className="display-flex flex-column padding-y-1 stat-grid-column"
                    >
                      <div className="font-ui-xs text-base-dark margin-bottom-1">
                        Total Weight
                      </div>
                      <div className="font-ui-lg text-bold">
                        {tripStats[trip.id]?.totalWeight || 0} lbs
                      </div>
                    </Grid>
                    <Grid
                      col={4}
                      className="display-flex flex-column padding-y-1 stat-grid-column"
                    >
                      <div className="font-ui-xs text-base-dark margin-bottom-1">
                        Avg. Length
                      </div>
                      <div className="font-ui-lg text-bold">
                        {tripStats[trip.id]?.avgLength || 0} in
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </div>
            ))
          )}
        </div>
          </Grid>
        </Grid>
      </GridContainer>

      {/* --- Footer Navigation --- */}
      {/* Fixed footer with primary action button */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            type="button"
            className="bg-primary hover:bg-primary-darker width-full"
            onClick={() => {
              navigate("/start");
            }}
          >
            Start New Trip
          </Button>
        </div>
      </footer>
    </>
  );
}

export default HomePage;