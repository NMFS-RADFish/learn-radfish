import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication, useOfflineStatus } from "@nmfs-radfish/react-radfish";
import { useNavigate } from "react-router-dom";
import { Button } from "@trussworks/react-uswds";

// Status constants
const STATUS_SUBMITTED = "submitted";
const STATUS_IN_PROGRESS = "in-progress";
const STATUS_NOT_SUBMITTED = "Not Submitted";

// Status label constants
const LABEL_SUBMITTED = "SUBMITTED";
const LABEL_IN_PROGRESS = "IN PROGRESS";
const LABEL_READY_TO_SUBMIT = "READY TO SUBMIT";
const LABEL_NOT_STARTED = "NOT STARTED";

/**
 * HomePage Component
 *
 * This component displays a list of fishing trips with their status and statistics.
 * It demonstrates:
 *  - Using RADFish hooks (useApplication, useOfflineStatus)
 *  - Working with IndexedDB via RADFish collections
 *  - Displaying data in a responsive layout with USWDS utility classes
 */
function HomePage() {
  // RADFish hooks
  const app = useApplication(); // Access the RADFish application instance
  const { isOffline } = useOfflineStatus(); // Check offline status

  // React state
  const [trips, setTrips] = useState([]);
  const [tripStats, setTripStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation
  const navigate = useNavigate();

  /**
   * Calculates statistics for a trip based on its catch data
   * @param {Array} tripCatches - Array of catch objects for a trip
   * @returns {Object} Object containing totalCount, totalWeight, and avgLength
   */
  const calculateTripStats = (tripCatches) => {
    if (!tripCatches || tripCatches.length === 0) {
      return { totalCount: 0, totalWeight: 0, avgLength: 0 };
    }

    const totalCount = tripCatches.length;

    const totalWeight = tripCatches
      .reduce((sum, catchItem) => sum + (catchItem.weight || 0), 0)
      .toFixed(1);

    const totalLength = tripCatches.reduce(
      (sum, catchItem) => sum + (catchItem.length || 0),
      0,
    );

    const avgLength =
      totalCount > 0 ? (totalLength / totalCount).toFixed(1) : 0;

    return { totalCount, totalWeight, avgLength };
  };

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
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const Catch = tripStore.getCollection("Catch");

        // Fetch all trips
        const allTrips = await Form.find({});

        // Sort trips by date (most recent first)
        const sortedTrips = [...allTrips].sort((a, b) => {
          if (!a.tripDate) return 1; // No date - put at bottom
          if (!b.tripDate) return -1;
          return new Date(b.tripDate) - new Date(a.tripDate);
        });

        setTrips(sortedTrips);

        // Calculate statistics for each trip
        const stats = {};

        for (const trip of sortedTrips) {
          // Find all catches associated with this trip
          const tripCatches = await Catch.find({ tripId: trip.id });

          // Use the calculateTripStats function to get statistics
          stats[trip.id] = calculateTripStats(tripCatches);
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
   * Format a date string to a localized date display
   * @param {string} dateString - ISO date string
   * @return {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  /**
   * Get human-readable status label based on trip status
   * @param {object} trip - Trip object
   * @return {string} Status label
   */
  const getStatusLabel = (trip) => {
    if (!trip || !trip.status) return LABEL_NOT_STARTED;
    
    if (trip.status === STATUS_SUBMITTED) return LABEL_SUBMITTED;
    if (trip.status === STATUS_IN_PROGRESS) return LABEL_IN_PROGRESS;
    if (trip.status === STATUS_NOT_SUBMITTED) return LABEL_READY_TO_SUBMIT;
    
    return LABEL_NOT_STARTED;
  };

  /**
   * Get appropriate CSS class for the trip header based on status
   * @param {object} trip - Trip object
   * @return {string} CSS class name
   */
  const getHeaderClass = (trip) => {
    if (!trip || !trip.status) return "bg-red-dark";
    
    if (trip.status === STATUS_SUBMITTED) return "bg-secondary-dark"; // Green
    if (trip.status === STATUS_IN_PROGRESS) return "bg-warning"; // Orange
    if (trip.status === STATUS_NOT_SUBMITTED) return "bg-primary"; // Blue
    
    // Default to orange for any other status
    return "bg-red-dark";
  };

  /**
   * Handle click on a trip card - navigate to appropriate page
   * @param {object} trip - Trip object
   */
  const handleTripClick = (trip) => {
    // Pass tripId via React Router state (not URL parameters)
    const destinationState = { state: { tripId: trip.id } };
    
    if (trip.status === STATUS_SUBMITTED) {
      navigate(`/review`, destinationState);
    } else if (trip.status === STATUS_IN_PROGRESS) {
      navigate(`/catch`, destinationState);
    } else if (trip.status === STATUS_NOT_SUBMITTED) {
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

  // Show error state
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
      <div className="page-content padding-y-2">
        <h1 className="font-heading-xl text-center margin-0">
          Welcome Captain
        </h1>

        <h2 className="font-heading-lg text-center margin-top-4 margin-bottom-2">
          Recent Trips
        </h2>

        {trips.length === 0 ? (
          <div className="border-dashed border-base-lighter bg-base-lightest padding-2 width-full maxw-mobile-lg margin-y-2">
            <p className="text-base margin-0 text-center">
              No trips found. Start a new trip to record your fishing activity.
            </p>
          </div>
        ) : (
          <div className="width-full maxw-mobile-lg margin-x-auto margin-bottom-5">
            {trips.map((trip) => (
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
                  <div className="grid-row">
                    <div className="grid-col-4 display-flex flex-column padding-y-1 stat-grid-column">
                      <div className="font-ui-xs text-base-dark margin-bottom-1">Fish Count</div>
                      <div className="font-ui-lg text-bold">{tripStats[trip.id]?.totalCount || 0}</div>
                    </div>
                    <div className="grid-col-4 display-flex flex-column padding-y-1 stat-grid-column">
                      <div className="font-ui-xs text-base-dark margin-bottom-1">Total Weight</div>
                      <div className="font-ui-lg text-bold">{tripStats[trip.id]?.totalWeight || 0} lbs</div>
                    </div>
                    <div className="grid-col-4 display-flex flex-column padding-y-1 stat-grid-column">
                      <div className="font-ui-xs text-base-dark margin-bottom-1">Avg. Length</div>
                      <div className="font-ui-lg text-bold">{tripStats[trip.id]?.avgLength || 0} in</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky footer with "Start New Trip" button */}
      <footer className="position-fixed bottom-0 width-full bg-base-lighter padding-x-2 padding-bottom-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            type="button"
            onClick={() => navigate("/start")}
            className="bg-accent-cool-darker hover:bg-accent-cool-dark width-full"
          >
            Start New Trip
          </Button>
        </div>
      </footer>
    </>
  );
}

export default HomePage;
