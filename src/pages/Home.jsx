import "../index.css";
import React, { useState } from "react";
import { useApplication, useOfflineStatus } from "@nmfs-radfish/react-radfish";
import { useNavigate } from "react-router-dom";
import { Button, GridContainer, Grid } from "@trussworks/react-uswds";

// --- Component Definition ---
/**
 * HomePage - Main landing page for the trip logging application
 * This component demonstrates basic React patterns before lesson 1:
 * - Basic state management with useState
 * - Simple rendering without USWDS grid structure
 * - Navigation setup with React Router
 * - Basic RADFish hooks for application context
 */
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
  // Error state for error handling
  const [error, setError] = useState(null);

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
      <div className="padding-y-4 padding-x-2 text-center">
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
            <div>Trip list would go here</div>
          )}
        </div>
      </div>

      {/* --- Footer Navigation --- */}
      {/* Fixed footer with primary action button */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            type="button"
            className="bg-primary hover:bg-primary-darker width-full"
          >
            Start New Trip
          </Button>
        </div>
      </footer>
    </>
  );
}

export default HomePage;