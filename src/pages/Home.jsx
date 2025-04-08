import "../index.css";
import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";

function HomePage() {
  const app = useApplication();
  const [trips, setTrips] = useState([]);
  const [tripStats, setTripStats] = useState({});
  
  // Load trips on component mount
  useEffect(() => {
    // Load all trips and their catch data
    const loadTripsAndCatches = async () => {
      try {
        if (!app) return;
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        const Catch = tripStore.getCollection("Catch");
        
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
        
        // Get catch data for all trips
        const stats = {};
        
        // Process each trip to get its catch statistics
        for (const trip of sortedTrips) {
          const tripCatches = await Catch.find({ tripId: trip.id });
          
          if (tripCatches.length > 0) {
            // Calculate statistics
            const totalCount = tripCatches.length;
            
            const totalWeight = tripCatches.reduce((sum, catchItem) => 
              sum + (catchItem.weight || 0), 0).toFixed(1);
              
            const totalLength = tripCatches.reduce((sum, catchItem) => 
              sum + (catchItem.length || 0), 0);
              
            const avgLength = totalCount > 0 
              ? (totalLength / totalCount).toFixed(1) 
              : 0;
            
            stats[trip.id] = { totalCount, totalWeight, avgLength };
          } else {
            stats[trip.id] = { totalCount: 0, totalWeight: 0, avgLength: 0 };
          }
        }
        
        setTripStats(stats);
      } catch (error) {
        console.error("Error loading trips and catches:", error);
      }
    };

    loadTripsAndCatches();
  }, [app]);

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get human-readable status
  const getStatusLabel = (trip) => {
    if (trip.status === "submitted") return "SUBMITTED";
    if (trip.status === "in-progress") return "IN PROGRESS";
    return "NOT SUBMITTED";
  };

  const getHeaderClass = (trip) => {
    if (trip.status === "submitted") return "trip-header-submitted";
    if (trip.status === "in-progress") return "trip-header-in-progress";
    return "trip-header-not-submitted";
  };

  return (
    <>
      <div className="page-content">
        <h1>Welcome Captain</h1>
        
        <h2 style={{ textAlign: 'center', margin: '1.5rem 0 1rem', fontWeight: 'bold', fontSize: '1.5rem' }}>Recent Trips</h2>
        
        {trips.length === 0 ? (
          <p>No trips found. Start a new trip to record your fishing activity.</p>
        ) : (
          <div className="trip-card-list">
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card-modern">
                <div className={`trip-card-header-modern ${getHeaderClass(trip)}`}>
                  <div className="trip-card-header-date">
                    {formatDate(trip.tripDate)}
                  </div>
                  <div className="trip-status-indicator">
                    {getStatusLabel(trip)}
                  </div>
                </div>
                <div className="trip-card-content">
                  <div className="trip-stats-container">
                    <div className="trip-stat-item">
                      <div className="trip-stat-label">Fish Count</div>
                      <div className="trip-stat-value">{tripStats[trip.id]?.totalCount || 0}</div>
                    </div>
                    
                    <div className="trip-stat-item">
                      <div className="trip-stat-label">Total Weight</div>
                      <div className="trip-stat-value">{tripStats[trip.id]?.totalWeight || 0} lbs</div>
                    </div>
                    
                    <div className="trip-stat-item">
                      <div className="trip-stat-label">Avg Length</div>
                      <div className="trip-stat-value">{tripStats[trip.id]?.avgLength || 0} in</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer nextPath="/start" nextLabel="Start New Trip" showBackButton={false} />
    </>
  );
}

export default HomePage;
