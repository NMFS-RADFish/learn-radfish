import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useApplication,
  Table,
  useOfflineStatus,
} from "@nmfs-radfish/react-radfish";
import { Button } from "@trussworks/react-uswds";
import StepIndicator from "../components/StepIndicator";

function ReviewSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripId = location.state?.tripId;
  const app = useApplication();
  const { isOffline } = useOfflineStatus();
  const [trip, setTrip] = useState(null);
  const [aggregatedCatches, setAggregatedCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load trip and catch data based on state tripId
  useEffect(() => {
    const loadTripData = async () => {
      setLoading(true);
      if (!app || !tripId) {
        console.warn(
          "App or Trip ID not available in state, cannot load review data.",
        );
        navigate("/");
        return;
      }

      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const trips = await Form.find({ id: tripId });

        if (trips.length === 0) {
          setError(`Trip with ID ${tripId} not found`);
          setLoading(false);
          return;
        }

        const selectedTrip = trips[0];
        setTrip(selectedTrip);

        const Catch = tripStore.getCollection("Catch");
        const tripCatches = await Catch.find({ tripId: selectedTrip.id });

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

  // Aggregate catches by species, calculating total weight and average length
  const aggregateCatchesBySpecies = (catchData) => {
    const speciesMap = {};

    // Group catches by species
    catchData.forEach((catchItem) => {
      if (!speciesMap[catchItem.species]) {
        speciesMap[catchItem.species] = {
          species: catchItem.species,
          weights: [],
          lengths: [],
          count: 0,
        };
      }

      speciesMap[catchItem.species].weights.push(catchItem.weight);
      speciesMap[catchItem.species].lengths.push(catchItem.length);
      speciesMap[catchItem.species].count++;
    });

    // Calculate totals and averages
    return Object.values(speciesMap).map((item) => {
      const totalWeight = item.weights.reduce((sum, val) => sum + val, 0);
      const avgLength =
        item.lengths.reduce((sum, val) => sum + val, 0) / item.count;

      return {
        species: item.species,
        totalWeight: totalWeight.toFixed(2),
        avgLength: avgLength.toFixed(2),
        count: item.count,
      };
    });
  };

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time from 24-hour format to 12-hour format with AM/PM
  const format24HourTo12Hour = (timeString) => {
    if (!timeString) return "";
    
    // Parse hours and minutes
    const [hoursStr, minutesStr] = timeString.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    
    // Determine AM/PM
    const period = hours >= 12 ? "PM" : "AM";
    
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12 AM
    
    return `${hours}:${minutes} ${period}`;
  };

  // Handle trip submission/saving
  const handleSubmit = async () => {
    if (!trip) return;

    try {
      const tripStore = app.stores["trip"];
      const Form = tripStore.getCollection("Form");
      const finalStatus = isOffline ? "Not Submitted" : "submitted";

      await Form.update({
        id: trip.id,
        status: finalStatus,
        step: 4,
      });

      navigate(isOffline ? "/offline-confirm" : "/online-confirm");
    } catch (error) {
      console.error("Error submitting trip:", error);
    }
  };

  // Determine Footer properties based on trip status and offline state
  const getFooterProps = () => {
    if (!trip) return { showBackButton: false, showNextButton: false };

    let backPath = "/";
    let backNavState = {};
    let showBackButton = true;
    let showNextButton = true;
    let nextLabel = "Submit";
    let onNextClick = handleSubmit;
    let nextButtonProps = {};

    if (trip.status === "submitted") {
      backPath = "/";
      showNextButton = false;
    } else {
      backPath = `/end`;
      backNavState = { state: { tripId: tripId } };
      if (isOffline) {
        nextLabel = "Save";
      } else {
        nextLabel = "Submit";
        nextButtonProps = { className: "usa-button--success" };
      }
    }

    return {
      backPath,
      backNavState,
      showBackButton,
      showNextButton,
      nextLabel,
      onNextClick,
      nextButtonProps,
    };
  };

  if (loading) {
    return <div className="page-content">Loading review data...</div>;
  }

  if (error) {
    return <div className="page-content">Error: {error}</div>;
  }

  if (!trip) {
    return <div className="page-content">Trip data not available.</div>;
  }

  const footerProps = getFooterProps();

  return (
    <>
      <div className="display-flex flex-column flex-align-center padding-y-4 padding-x-2 text-center">
        <div className="width-full maxw-mobile-lg">
          <StepIndicator />

          {/* Trip info card - consolidated from start and end trip */}
          <div className="trip-card width-full margin-top-4 maxw-full">
            <div className="trip-card-header width-full">
              <h3>Trip Summary</h3>
            </div>
            <div className="trip-card-body">
              <div className="trip-info-row">
                <div className="icon-container">Date</div>
                <span>{formatDate(trip.tripDate)}</span>
              </div>
              <div className="trip-info-row">
                <div className="icon-container">Weather</div>
                <div className="display-flex flex-align-center">
                  <span>{trip.weather}</span>
                  <span className="margin-x-1 text-base-dark">→</span>
                  <span>{trip.endWeather}</span>
                </div>
              </div>
              <div className="trip-info-row">
                <div className="icon-container">Time</div>
                <div className="display-flex flex-align-center">
                  <span>{format24HourTo12Hour(trip.startTime)}</span>
                  <span className="margin-x-1 text-base-dark">→</span>
                  <span>{format24HourTo12Hour(trip.endTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated Catch Data Box */}
          <div className="trip-card catch-summary-card">
            <div className="trip-card-header">
              <h3>Aggregate Catches</h3>
            </div>
            <div className="trip-card-body">
              {aggregatedCatches.length > 0 ? (
                <Table
                  data={aggregatedCatches.map((item, index) => ({
                    id: index,
                    species: item.species,
                    count: item.count,
                    totalWeight: `${item.totalWeight} lbs`,
                    avgLength: `${item.avgLength} in`,
                  }))}
                  columns={[
                    { key: "species", label: "Species", sortable: true },
                    { key: "count", label: "Count", sortable: true },
                    {
                      key: "totalWeight",
                      label: "Total Weight",
                      sortable: true,
                    },
                    { key: "avgLength", label: "Avg. Length", sortable: true },
                  ]}
                />
              ) : (
                <p>No catches recorded for this trip.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Footer */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-y-4 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto">
          {footerProps.showBackButton && (
            <Button
              outline
              type="button"
              className={footerProps.showNextButton ? "width-card-lg bg-white" : "width-full bg-white"}
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
              className={`${footerProps.showBackButton ? "width-full margin-left-2" : ""} ${footerProps.nextButtonProps.className || ""}`}
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
