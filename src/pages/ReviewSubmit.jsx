import "../index.css";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  StepIndicator,
  StepIndicatorStep,
  GridContainer,
  Grid,
} from "@trussworks/react-uswds";
import { 
  formatDate, 
  format24HourTo12Hour, 
  aggregateCatchesBySpecies
} from "../utils";

/**
 * ReviewSubmit - Fourth step in the trip recording workflow
 */
function ReviewSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useApplication();

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
        console.warn("App or Trip ID not available in state, cannot load review data.");
        navigate("/");
        return;
      }

      try {
        
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
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-left">
              {/* Step Indicator */}
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
                  <p className="padding-2 text-base-dark">
                    Table component will be added here.
                  </p>
                ) : (
                  <p className="padding-2 text-base-dark">
                    No catches recorded for this trip.
                  </p>
                )}
              </div>
            </div>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

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