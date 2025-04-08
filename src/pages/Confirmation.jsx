import "../index.css";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApplication, useOfflineStatus } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";

function Confirmation() {
  const { isOffline } = useOfflineStatus();
  const [tripStatus, setTripStatus] = useState(null);
  const app = useApplication();

  // Load the latest trip's status
  useEffect(() => {
    const loadTripStatus = async () => {
      try {
        if (!app) return;
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Check for trips with different statuses
        const submittedTrips = await Form.find({ status: "submitted" });
        const notSubmittedTrips = await Form.find({ status: "Not Submitted" });
        
        if (submittedTrips.length > 0) {
          setTripStatus("submitted");
        } else if (notSubmittedTrips.length > 0) {
          setTripStatus("Not Submitted");
        }
      } catch (error) {
        console.error("Error loading trip status:", error);
      }
    };
    
    loadTripStatus();
  }, [app]);

  // Determine content based on trip status
  const getConfirmationContent = () => {
    // If we have a specific tripStatus, use that, otherwise fall back to offline status
    const effectiveStatus = tripStatus || (isOffline ? "Not Submitted" : "submitted");
    
    if (effectiveStatus === "submitted") {
      return {
        heading: "Success!",
        message: "Your trip has been successfully submitted!",
        color: "#00a91c" // green
      };
    } else {
      return {
        heading: "Saved Offline",
        message: "Your trip has been saved locally and will be submitted automatically when you're back online.",
        color: "#f5c400" // yellow
      };
    }
  };

  const content = getConfirmationContent();

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <h1 style={{ color: content.color }}>{content.heading}</h1>
          <p>{content.message}</p>
          
          {tripStatus === "Not Submitted" && (
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              border: '1px solid #dfe1e2',
              borderRadius: '4px',
              padding: '15px',
              marginTop: '20px'
            }}>
              <h3>What happens next?</h3>
              <p>When your device reconnects to the internet, you can manually submit your saved trip data from the home page.</p>
              <p>A "Sync Trips Now" button will appear on the home page when you're back online.</p>
            </div>
          )}
        </div>
      </div>
      <Footer backPath="/" backButtonLabel="Home" showNextButton={false} />
    </>
  );
}

export default Confirmation;
