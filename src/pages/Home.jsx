import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication, useOfflineStatus } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";

function HomePage() {
  const app = useApplication();
  const { isOffline } = useOfflineStatus();
  const [trips, setTrips] = useState([]);

  // Load all trips
  useEffect(() => {
    const loadTrips = async () => {
      try {
        if (!app) return;
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Get all trips, ordered by most recent first
        const allTrips = await Form.find({});
        
        // Sort trips by date (most recent first)
        const sortedTrips = [...allTrips].sort((a, b) => {
          // If no tripDate, put at bottom
          if (!a.tripDate) return 1;
          if (!b.tripDate) return -1;
          
          return new Date(b.tripDate) - new Date(a.tripDate);
        });
        
        setTrips(sortedTrips);
      } catch (error) {
        console.error("Error loading trips:", error);
      }
    };
    
    loadTrips();
    
    // Set up an interval to reload trips when offline status might have changed
    const intervalId = setInterval(loadTrips, 5000);
    
    return () => clearInterval(intervalId);
  }, [app, isOffline]); // Add isOffline dependency to reload when online status changes

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "#e5a000"; // amber
      case "in-progress": return "#f5c400"; // yellow
      case "Not Submitted": return "#e41d3d"; // red
      case "submitted": return "#00a91c"; // green-warm
      default: return "#71767a"; // gray
    }
  };

  // Get human-readable status
  const getStatusLabel = (status) => {
    switch (status) {
      case "draft": return "Draft";
      case "in-progress": return "In Progress";
      case "Not Submitted": return "Not Submitted";
      case "submitted": return "Submitted";
      default: return status;
    }
  };

  return (
    <>
      <div className="page-content">
        <h1>Welcome Captain</h1>
        
        {isOffline && (
          <div style={{ backgroundColor: '#e41d3d', color: 'white', padding: '10px', marginTop: '10px', maxWidth: '30rem', width: '100%', borderRadius: '4px' }}>
            You are currently offline. Your trips will be saved locally and synced when you're back online.
          </div>
        )}
        
        <div style={{ padding: '20px', marginTop: '20px', maxWidth: '30rem', width: '100%' }}>
          <h2>Recent Trips</h2>
          
          {trips.length === 0 ? (
            <p>No trips found. Start a new trip to record your fishing activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {trips.map(trip => (
                <div key={trip.id} style={{ 
                  border: '1px solid #dfe1e2', 
                  borderRadius: '4px',
                  padding: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{formatDate(trip.tripDate)}</span>
                    <span style={{ 
                      backgroundColor: getStatusColor(trip.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <span>Weather: {trip.weather}</span>
                    {trip.endWeather && (
                      <span> → {trip.endWeather}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer nextPath="/start" nextLabel="Start New Trip" showBackButton={false} />
    </>
  );
}

export default HomePage;
