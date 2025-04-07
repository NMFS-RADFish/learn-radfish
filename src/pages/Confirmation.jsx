import "../index.css";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApplication } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";

function Confirmation() {
  const location = useLocation();
  const [tripStatus, setTripStatus] = useState(null);
  const app = useApplication();

  // Load the latest trip's status
  useEffect(() => {
    const loadTripStatus = async () => {
      try {
        if (!app) return;
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Check for submitted trips
        const submittedTrips = await Form.find({ status: "submitted" });
        
        if (submittedTrips.length > 0) {
          setTripStatus("submitted");
        }
      } catch (error) {
        console.error("Error loading trip status:", error);
      }
    };
    
    loadTripStatus();
  }, [app]);

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <h1>Success!</h1>
          <p>Your trip has been successfully submitted!</p>
        </div>
      </div>
      <Footer backPath="/" />
    </>
  );
}

export default Confirmation;
