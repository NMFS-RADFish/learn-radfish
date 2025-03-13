import "../index.css";
import React from "react";
import { StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import Footer from "../components/Footer";

function ReviewSubmit() {
  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="complete" />
            <StepIndicatorStep label="Catch Log" status="complete" />
            <StepIndicatorStep label="End Trip" status="complete" />
            <StepIndicatorStep label="Review and Submit" status="current" />
          </StepIndicator>
        </div>
        
        <h1>Review and Submit</h1>
        <p>Review your trip details before submission.</p>
      </div>
      
      <Footer backPath="/end" nextPath="/confirm" nextLabel="Submit" />
    </>
  );
}

export default ReviewSubmit;
