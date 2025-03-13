import "../index.css";
import React from "react";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

function EndTrip() {
  return (
    <>
      <div className="page-content">
        <StepIndicator />
        
        <h1>End Trip</h1>
        <p>Enter details to finalize your trip.</p>
      </div>
      
      <Footer backPath="/catch" nextPath="/review" />
    </>
  );
}

export default EndTrip;
