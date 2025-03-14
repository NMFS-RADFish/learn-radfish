import "../index.css";
import React from "react";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

function StartTrip() {
  return (
    <>
      <div className="page-content">
        <StepIndicator />
        
        <h1>Start Trip</h1>
        <p>Enter your trip details here.</p>
      </div>
      
      <Footer nextPath="/catch" />
    </>
  );
}

export default StartTrip;
