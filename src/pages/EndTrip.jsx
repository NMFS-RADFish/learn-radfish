import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  Form,
} from "@trussworks/react-uswds";
import Layout from "../components/Layout";
import {
  FIELD_NAMES,
} from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

function EndTrip() {
  // --- RADFish Application Context ---
  const app = useApplication();
  
  // --- Custom Hooks ---
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();
  
  // --- State Management ---
  const [tripData, setTripData] = useState({
    endWeather: undefined,
    endTime: undefined,
  });
  
  // --- Trip Data Management ---
  const { trip, isLoading, updateTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    }
  );
  
  // --- Effects ---
  useEffect(() => {
    if (trip) {
      setTripData({
        endWeather: trip.endWeather || "",
        endTime: trip.endTime || "",
      });
    }
  }, [trip]);
  
  // --- Event Handlers ---
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await updateTrip({
        ...tripData,
        status: "in-progress",
        step: 4
      });
      
      if (success) {
        navigateWithTripId("/review", tripId);
      } else {
        throw new Error("Failed to update trip");
      }
    } catch (error) {
      console.error("Error saving end trip data:", error);
    }
  };
  
  // --- Render Logic ---
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip end details...</div>;
  }
  
  return (
    <>
      <Layout currentStep="End Trip">
        <Form onSubmit={handleSubmit} large className="margin-top-3">

        </Form>
      </Layout>
      
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigateWithTripId("/catch", tripId)}
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