import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useApplication,
  Table,
  useOfflineStatus,
} from "@nmfs-radfish/react-radfish";
import { Button } from "@trussworks/react-uswds";
import Layout from "../components/Layout";
import {
  formatDate,
  format24HourTo12Hour,
  aggregateCatchesBySpecies,
  STORE_NAMES,
  COLLECTION_NAMES,
} from "../utils";

/**
 * ReviewSubmit - Fourth step in the trip recording workflow
 */
function ReviewSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useApplication();
  const { isOffline } = useOfflineStatus();

  // --- State ---
  const tripId = location.state?.tripId;
  const [trip, setTrip] = useState(null);
  const [aggregatedCatches, setAggregatedCatches] = useState([]);
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Loading Effect ---
  useEffect(() => {
    const loadTripData = async () => {
      setLoading(true);
      setError(null);

      if (!app || !tripId) {
        console.warn(
          "App or Trip ID not available in state, cannot load review data.",
        );
        navigate("/");
        return;
      }

      try {
        // Access RADFish collections
        const tripStore = app.stores[STORE_NAMES.TRIP_STORE];
        const tripCollection = tripStore.getCollection(COLLECTION_NAMES.TRIP_COLLECTION);
        const catchCollection = tripStore.getCollection(COLLECTION_NAMES.CATCH_COLLECTION);

        // Fetch the trip details
        const tripsDataFromCollection = await tripCollection.find({ id: tripId });

        // Handle trip not found
        if (tripsDataFromCollection.length === 0) {
          setError(`Trip with ID ${tripId} not found`);
          navigate("/"); // Redirect home if trip doesn't exist
          return;
        }

        const selectedTrip = tripsDataFromCollection[0];
        setTrip(selectedTrip); // Store fetched trip data in state

        // Fetch all catches associated with this trip
        const tripCatches = await catchCollection.find({ tripId: selectedTrip.id });

        // Store catches for API submission
        setCatches(tripCatches);

        const aggregatedData = aggregateCatchesBySpecies(tripCatches);
        setAggregatedCatches(aggregatedData);

      } catch (err) {
        console.error("Error loading trip data:", err);
        setError("Failed to load trip data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadTripData();
  }, [app, tripId, navigate]);

  // --- Event Handlers ---
  const handleSubmit = async () => {
    if (!trip) return;

    const tripStore = app.stores[STORE_NAMES.TRIP_STORE];
    const tripCollection = tripStore.getCollection(COLLECTION_NAMES.TRIP_COLLECTION);

    if (isOffline) {
      // Offline: Save status as "Not Submitted" locally
      try {
        await tripCollection.update({
          id: trip.id,
          status: "Not Submitted",
          step: 4, // Mark as completed step 4 (review)
        });
        navigate("/offline-confirm");
      } catch (error) {
        console.error("Error saving trip offline:", error);
        setError("Failed to save trip for offline submission. Please try again.");
      }
    } else {
      // Online: Attempt to submit to the backend
      try {
        // Prepare submission data with trip and associated catches
        const submissionData = {
          trip: trip,
          catches: catches,
        };

        const response = await fetch("/api/trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const status = response.status;
          const statusText = response.statusText ? response.statusText.trim() : "";
          const errorDetail = statusText
            ? `${status} ${statusText}`
            : `${status} Server error occurred`;

          console.error("Server submission failed:", errorDetail);
          setError(`Server submission failed: ${errorDetail}`);
          return;
        }

        // If server submission is successful, update local status to "submitted"
        await tripCollection.update({
          id: trip.id,
          status: "submitted",
          step: 4,
        });
        navigate("/online-confirm");
      } catch (error) {
        // Catch network errors or other issues with the fetch call
        console.error("Error submitting trip online:", error);
        setError(
          "Failed to submit trip. Check your internet connection or try saving offline.",
        );
      }
    }
  };

  // --- Dynamic Footer Logic ---
  const getFooterProps = () => {
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
      return { ...defaultProps, showBackButton: false, showNextButton: false };
    }

    if (trip.status === "submitted") {
      return {
        ...defaultProps,
        backPath: "/",
        showNextButton: false,
      };
    } else {
      defaultProps.backPath = `/end`;
      defaultProps.backNavState = { state: { tripId: tripId } };

      if (isOffline) {
        defaultProps.nextLabel = "Save";
      } else {
        defaultProps.nextLabel = "Submit";
        defaultProps.nextButtonProps = { className: "bg-green hover:bg-green" };
      }

      return defaultProps;
    }
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="padding-5 text-center">Loading trip data...</div>;
  }

  if (error) {
    return <div className="padding-5 text-center text-red">Error: {error}</div>;
  }

  const footerProps = getFooterProps();

  return (
    <>
      <Layout currentStep="Review and Submit">
        {/* Trip Summary Card */}
        <div className="bg-white border border-base-lighter radius-md shadow-2 margin-y-4 maxw-full overflow-hidden">
          <div className="bg-primary-darker padding-y-1 padding-x-2">
            <h3 className="margin-0 font-sans-lg text-semibold text-white text-center">
              Trip Summary
            </h3>
          </div>
          <div className="padding-2 display-flex flex-column gap-2">
            {trip && (
              <>
                {/* Date Row */}
                <div className="display-flex flex-align-center gap-1">
                  <div className="width-10 text-bold font-sans-xs">
                    Date
                  </div>
                  <span className="text-base-dark font-sans-sm">
                    {formatDate(trip.tripDate)}
                  </span>
                </div>
                {/* Weather Row */}
                <div className="display-flex flex-align-center gap-1">
                  <div className="width-10 text-bold font-sans-xs">
                    Weather
                  </div>
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
                  <div className="width-10 text-bold font-sans-xs">
                    Time
                  </div>
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
              </>
            )}
          </div>
        </div>

        {/* Aggregated Catch Data Card */}
        <div className="bg-white border border-base-lighter radius-md shadow-2 margin-y-4 maxw-full overflow-hidden">
          <div className="bg-primary-darker padding-y-1 padding-x-2">
            <h3 className="margin-0 font-sans-lg text-semibold text-white text-center">
              Aggregate Catches
            </h3>
          </div>
          <div className="padding-0">
            {aggregatedCatches.length > 0 ? (
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
                  { key: "totalWeight", label: "Total Weight", sortable: true },
                  { key: "avgLength", label: "Avg. Length", sortable: true },
                ]}
                // Enable striped rows for better readability
                striped
              />
            ) : (
              <p className="padding-2 text-base-dark">
                No catches recorded for this trip.
              </p>
            )}
          </div>
        </div>
      </Layout>

      {/* Footer */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          {footerProps.showBackButton && (
            <Button
              outline
              type="button"
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
          {footerProps.showNextButton && (
            <Button
              type="button"
              className={`${
                footerProps.showBackButton
                  ? "width-full margin-left-2"
                  : "width-full"
              } ${footerProps.nextButtonProps.className || ""}`}
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
