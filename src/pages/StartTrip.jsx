import "../index.css";
import React from "react";
import { StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import Footer from "../components/Footer";

function StartTrip() {
  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="current" />
            <StepIndicatorStep label="Catch Log" />
            <StepIndicatorStep label="End Trip" />
            <StepIndicatorStep label="Review and Submit" />
          </StepIndicator>
        </div>
        
        <h1>Start Trip</h1>
        <p>Enter your trip details here.</p>
      </div>
      
      <Footer nextPath="/catch" />
    </>
  );
}

export default StartTrip;
