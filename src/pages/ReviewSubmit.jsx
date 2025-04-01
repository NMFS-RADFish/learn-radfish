import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApplication } from "@nmfs-radfish/react-radfish";
import { Table } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

function ReviewSubmit() {
  const navigate = useNavigate();
  const app = useApplication();
  const [trip, setTrip] = useState(null);
  const [catches, setCatches] = useState([]);
  const [aggregatedCatches, setAggregatedCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load trip and catch data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        if (!app) return;
        
        setLoading(true);
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Get completed trips
        const completedTrips = await Form.find({ status: "completed" });
        
        if (completedTrips.length === 0) {
          setError("No completed trip found");
          navigate("/start");
          return;
        }
        
        // Use the most recent completed trip
        const completedTrip = completedTrips[0];
        setTrip(completedTrip);
        
        // Get catches for this trip
        const Catch = tripStore.getCollection("Catch");
        const tripCatches = await Catch.find({ tripId: completedTrip.id });
        setCatches(tripCatches);
        
        // Aggregate catches by species
        const aggregatedData = aggregateCatchesBySpecies(tripCatches);
        setAggregatedCatches(aggregatedData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading trip data:", err);
        setError("Failed to load trip data");
        setLoading(false);
      }
    };
    
    loadTripData();
  }, [app, navigate]);
  
  // Aggregate catches by species, calculating average weight and length
  const aggregateCatchesBySpecies = (catchData) => {
    const speciesMap = {};
    
    // Group catches by species
    catchData.forEach(catchItem => {
      if (!speciesMap[catchItem.species]) {
        speciesMap[catchItem.species] = {
          species: catchItem.species,
          weights: [],
          lengths: [],
          count: 0
        };
      }
      
      speciesMap[catchItem.species].weights.push(catchItem.weight);
      speciesMap[catchItem.species].lengths.push(catchItem.length);
      speciesMap[catchItem.species].count++;
    });
    
    // Calculate averages
    return Object.values(speciesMap).map(item => {
      const avgWeight = item.weights.reduce((sum, val) => sum + val, 0) / item.count;
      const avgLength = item.lengths.reduce((sum, val) => sum + val, 0) / item.count;
      
      return {
        species: item.species,
        avgWeight: avgWeight.toFixed(2),
        avgLength: avgLength.toFixed(2),
        count: item.count
      };
    });
  };
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="page-content">Loading trip data...</div>;
  }

  if (error) {
    return <div className="page-content">Error: {error}</div>;
  }

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <StepIndicator />
          
          {/* Trip cards side-by-side */}
          <div className="trip-cards-container">
            {/* Start Trip Info Box */}
            <div className="trip-card start-trip-card">
              {trip && (
                <>
                  <div className="trip-card-header">
                    <h3>Start Trip</h3>
                  </div>
                  <div className="trip-card-body">
                    <div className="trip-info-row">
                      <div className="icon-container">
                        Date
                      </div>
                      <span>{formatDate(trip.tripDate)}</span>
                    </div>
                    <div className="trip-info-row">
                      <div className="icon-container">
                        Weather
                      </div>
                      <span>{trip.weather}</span>
                    </div>
                    <div className="trip-info-row">
                      <div className="icon-container">
                        Time
                      </div>
                      <span>{trip.startTime}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* End Trip Info Box */}
            <div className="trip-card end-trip-card">
              {trip && (
                <>
                  <div className="trip-card-header">
                    <h3>End Trip</h3>
                  </div>
                  <div className="trip-card-body">
                    <div className="trip-info-row">
                      <div className="icon-container">
                        Weather
                      </div>
                      <span>{trip.endWeather}</span>
                    </div>
                    <div className="trip-info-row">
                      <div className="icon-container">
                        Time
                      </div>
                      <span>{trip.endTime}</span>
                    </div>
                  </div>
                </>
              )}
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
                    avgWeight: `${item.avgWeight} lbs`,
                    avgLength: `${item.avgLength} in`
                  }))}
                  columns={[
                    { key: "species", label: "Species", sortable: true },
                    { key: "count", label: "Count", sortable: true },
                    { key: "avgWeight", label: "Avg. Weight", sortable: true },
                    { key: "avgLength", label: "Avg. Length", sortable: true }
                  ]}

                />
              ) : (
                <p>No catches recorded for this trip.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer backPath="/end" nextPath="/confirm" nextLabel="Submit" />
    </>
  );
}

export default ReviewSubmit;
