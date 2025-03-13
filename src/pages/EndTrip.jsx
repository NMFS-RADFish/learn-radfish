import "../index.css";
import React from "react";
import { StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import Footer from "../components/Footer";

function EndTrip() {
  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="complete" />
            <StepIndicatorStep label="Catch Log" status="complete" />
            <StepIndicatorStep label="End Trip" status="current" />
            <StepIndicatorStep label="Review and Submit" />
          </StepIndicator>
        </div>
        
        <h1>End Trip</h1>
        <p>Enter details to finalize your trip.</p>
      </div>
      
      <Footer backPath="/catch" nextPath="/review" />
    </>
  );
}

export default EndTrip;
